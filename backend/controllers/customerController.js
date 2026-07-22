import { Customer } from '../models/Customer.js';

// POST /api/customers
export const createCustomer = async (req, res) => {
  try {
    const { fullName, phoneNumber } = req.body;

    if (!fullName || !phoneNumber) {
      return res.status(400).json({ success: false, error: 'fullName and phoneNumber are required' });
    }

    // Basic phone number normalization - store as string
    const normalizedPhone = String(phoneNumber).trim();

    // Attempt create - unique index on phoneNumber protects duplicates
    const customer = await Customer.create({ fullName: fullName.trim(), phoneNumber: normalizedPhone });

    return res.status(201).json({ success: true, data: customer });
  } catch (err) {
    // Duplicate key handling
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'A customer with this phone number already exists' });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/customers
// Supports optional filtering via req.query (e.g., ?phoneNumber=9198...)
export const listCustomers = async (req, res) => {
  try {
    const { phoneNumber, fullName } = req.query;
    const filter = {};
    if (phoneNumber) filter.phoneNumber = String(phoneNumber).trim();
    if (fullName) filter.fullName = new RegExp(fullName.trim(), 'i');

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch customers' });
  }
};

// GET /api/customers/:id
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Unable to fetch customer' });
  }
};
