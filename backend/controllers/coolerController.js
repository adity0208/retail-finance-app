import { Electronics } from '../models/Electronics.js';
import { Customer } from '../models/Customer.js';
import { generateUniqueLookupCode } from '../utils/codeGenerator.js';

// POST /api/electronics
// Create an electronics inventory record (unsold by default)
export const createElectronics = async (req, res) => {
  try {
    const { serialNumber, modelName, purchaseDate, warrantyPeriodInMonths, deviceCategory, costPriceInPaise, photoData } = req.body;

    if (!serialNumber || !modelName || !purchaseDate) {
      return res.status(400).json({ success: false, error: 'serialNumber, modelName and purchaseDate are required' });
    }

    // Validate cost paise if provided
    if (costPriceInPaise != null && !Number.isInteger(costPriceInPaise)) {
      return res.status(400).json({ success: false, error: 'costPriceInPaise must be an integer representing paise' });
    }

    // Generate a quick lookup code (tag) if not provided by client
    const quickLookupCode = await generateUniqueLookupCode(8);

    const record = await Electronics.create({
      serialNumber: String(serialNumber).trim(),
      modelName: String(modelName).trim(),
      deviceCategory: deviceCategory || 'Cooler',
      purchaseDate: new Date(purchaseDate),
      costPriceInPaise: costPriceInPaise != null ? costPriceInPaise : 0,
      warrantyPeriodInMonths: warrantyPeriodInMonths ? Number(warrantyPeriodInMonths) : 0,
      quickLookupCode,
      photoData: photoData || null
    });

    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'serialNumber or quick lookup code must be unique' });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/electronics/:id/sell
// Marks an electronics item as sold. Expects soldTo (customer id), salePriceInPaise (integer), and warrantyPeriodInMonths (integer) optionally.
// Computes warrantyExpiryDate at the exact millisecond of sale and sets it immutably.
export const sellElectronics = async (req, res) => {
  try {
    const { id } = req.params; // explicit resource identification
    const { soldTo, salePriceInPaise, warrantyPeriodInMonths } = req.body;

    if (!soldTo || salePriceInPaise == null) {
      return res.status(400).json({ success: false, error: 'soldTo (customer id) and salePriceInPaise are required to mark as sold' });
    }

    // Validate integer paise
    if (!Number.isInteger(salePriceInPaise) || salePriceInPaise <= 0) {
      return res.status(400).json({ success: false, error: 'salePriceInPaise must be a positive integer representing paise' });
    }

    // Ensure customer exists
    const customer = await Customer.findById(soldTo);
    if (!customer) return res.status(400).json({ success: false, error: 'Referenced customer not found' });

    const electronics = await Electronics.findById(id);
    if (!electronics) return res.status(404).json({ success: false, error: 'Electronics item not found' });

    if (electronics.soldTo) {
      return res.status(400).json({ success: false, error: 'Item is already marked sold and cannot be re-sold' });
    }

    // Guardrail: prevent selling below acquisition cost
    if (electronics.costPriceInPaise != null && salePriceInPaise < electronics.costPriceInPaise) {
      return res.status(400).json({ success: false, error: 'Selling price cannot be lower than acquisition cost' });
    }

    const saleDate = new Date();
    const months = warrantyPeriodInMonths != null ? Number(warrantyPeriodInMonths) : (electronics.warrantyPeriodInMonths || 0);

    // Compute warranty expiry at exact millisecond of sale
    const warrantyExpiryDate = months > 0 ? new Date(saleDate.getTime() + months * 30 * 24 * 60 * 60 * 1000) : null;

    // Perform update - warrantyExpiryDate is immutable at schema level so it cannot be changed later
    electronics.soldTo = customer._id;
    electronics.salePriceInPaise = salePriceInPaise;
    electronics.warrantyPeriodInMonths = months;
    if (warrantyExpiryDate) electronics.warrantyExpiryDate = warrantyExpiryDate;

    await electronics.save();

    return res.status(200).json({ success: true, data: electronics });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/electronics
// Supports filtering via req.query (e.g., ?sold=true or ?modelName=XYZ)
export const listElectronics = async (req, res) => {
  try {
    const { sold, modelName, serialNumber, deviceCategory } = req.query;
    const filter = {};
    if (sold === 'true') filter.soldTo = { $ne: null };
    if (sold === 'false') filter.soldTo = null;
    if (modelName) filter.modelName = new RegExp(String(modelName), 'i');
    if (serialNumber) filter.serialNumber = String(serialNumber).trim();
    if (deviceCategory) filter.deviceCategory = deviceCategory;

    const items = await Electronics.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch electronics items' });
  }
};

// GET /api/electronics/:id
export const getElectronicsById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Electronics.findById(id).populate('soldTo');
    if (!item) return res.status(404).json({ success: false, error: 'Electronics item not found' });
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch item' });
  }
};
