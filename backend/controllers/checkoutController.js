import { Clothing } from '../models/Clothing.js';
import { Electronics } from '../models/Electronics.js';
import { Transaction } from '../models/Transaction.js';
import { Customer } from '../models/Customer.js';

// POST /api/checkout
// Body: { customerId (optional), items: [ { type: 'clothing'|'electronics', id?, code?, quantity?, sellingPriceInPaise } ], paymentMethod }
export const checkout = async (req, res) => {
  try {
    const { customerId, items, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'cart items are required' });
    }

    // Validate items and perform inventory updates
    let totalPaise = 0;
    const soldItems = [];
    let containsElectronics = false;
    let containsClothing = false;

    // If any electronics will be sold, require customerId for warranty anchoring
    for (const it of items) {
      if (!it || !it.type || it.sellingPriceInPaise == null) {
        return res.status(400).json({ success: false, error: 'Each item must include type and sellingPriceInPaise' });
      }
      if (!Number.isInteger(it.sellingPriceInPaise) || it.sellingPriceInPaise <= 0) {
        return res.status(400).json({ success: false, error: 'sellingPriceInPaise must be a positive integer (paise) for all items' });
      }
      if (it.type === 'electronics') containsElectronics = true;
      if (it.type === 'clothing') containsClothing = true;
    }

    if (containsElectronics && !customerId) {
      return res.status(400).json({ success: false, error: 'Customer is required to sell electronics items (warranty anchoring)' });
    }

    // Verify customer if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
      if (!customer) return res.status(400).json({ success: false, error: 'Provided customerId not found' });
    }

    // Process each item sequentially
    for (const it of items) {
      if (it.type === 'clothing') {
        // find clothing by id or code
        let clothing = null;
        if (it.id) clothing = await Clothing.findById(it.id);
        else if (it.code) clothing = await Clothing.findOne({ $or: [{ articleCode: it.code }, { quickLookupCode: it.code }] });
        if (!clothing) return res.status(404).json({ success: false, error: `Clothing item not found for ${it.code || it.id}` });

        const qty = Number.isInteger(it.quantity) ? it.quantity : 1;
        if (clothing.stockCount < qty) return res.status(400).json({ success: false, error: `Insufficient stock for articleCode ${clothing.articleCode}` });

        // Guardrail: do not allow sale below acquisition cost
        if (it.sellingPriceInPaise < clothing.costPriceInPaise) {
          return res.status(400).json({ success: false, error: `Selling price for ${clothing.articleCode} cannot be lower than acquisition cost` });
        }

        // Decrement stock
        clothing.stockCount = clothing.stockCount - qty;
        await clothing.save();

        totalPaise += it.sellingPriceInPaise * qty;
        soldItems.push({ type: 'clothing', itemId: clothing._id, articleCode: clothing.articleCode, qty, sellingPriceInPaise: it.sellingPriceInPaise });

      } else if (it.type === 'electronics') {
        // find electronics by id or code
        let electronics = null;
        if (it.id) electronics = await Electronics.findById(it.id);
        else if (it.code) electronics = await Electronics.findOne({ $or: [{ serialNumber: it.code }, { quickLookupCode: it.code }] });
        if (!electronics) return res.status(404).json({ success: false, error: `Electronics item not found for ${it.code || it.id}` });

        if (electronics.soldTo) return res.status(400).json({ success: false, error: `Item ${electronics.serialNumber} already sold` });

        // Must have customer (checked earlier)
        // Validate salePrice
        const salePriceInPaise = it.sellingPriceInPaise;

        // Guardrail: do not allow sale below acquisition cost
        if (electronics.costPriceInPaise != null && salePriceInPaise < electronics.costPriceInPaise) {
          return res.status(400).json({ success: false, error: `Selling price for ${electronics.serialNumber} cannot be lower than acquisition cost` });
        }

        // Compute warranty expiry similar to sellElectronics
        const saleDate = new Date();
        const months = it.warrantyPeriodInMonths != null ? Number(it.warrantyPeriodInMonths) : (electronics.warrantyPeriodInMonths || 0);
        const warrantyExpiryDate = months > 0 ? new Date(saleDate.getTime() + months * 30 * 24 * 60 * 60 * 1000) : null;

        electronics.soldTo = customer._id;
        electronics.salePriceInPaise = salePriceInPaise;
        electronics.warrantyPeriodInMonths = months;
        if (warrantyExpiryDate) electronics.warrantyExpiryDate = warrantyExpiryDate;

        await electronics.save();

        totalPaise += salePriceInPaise;
        soldItems.push({ type: 'electronics', itemId: electronics._id, serialNumber: electronics.serialNumber, sellingPriceInPaise: salePriceInPaise });

      } else {
        return res.status(400).json({ success: false, error: `Unsupported item type ${it.type}` });
      }
    }

    // Decide department for transaction
    let department = 'General';
    if (containsElectronics && !containsClothing) department = 'Electronics';
    else if (containsClothing && !containsElectronics) department = 'Clothing';

    // Create transaction ledger entry
    const txn = await Transaction.create({
      amountInPaise: totalPaise,
      type: 'income',
      department,
      paymentMethod: paymentMethod || 'Cash',
      description: `Checkout - ${soldItems.length} items`,
      date: new Date()
    });

    return res.status(201).json({ success: true, transaction: txn, soldItems });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
