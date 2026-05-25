import { Transaction } from '../models/Transaction.js';

// @desc    Create a new financial transaction
// @route   POST /api/transactions
// @access  Public (Internal Shop Use)
export const createTransaction = async (req, res) => {
  try {
    const { amountInRupees, type, department, paymentMethod, description, date } = req.body;

    // Industry Guardrail: Convert Rupee input cleanly to Integer Paise before saving
    // Math.round ensures we eliminate any floating-point quirks passed by the client input
    const amountInPaise = Math.round(parseFloat(amountInRupees) * 100);

    // Instantiate and save the new record using our strict Mongoose Schema
    const newTransaction = await Transaction.create({
      amountInPaise,
      type,
      department,
      paymentMethod,
      description,
      date
    });

    // Return the industry-standard 201 Created response
    return res.status(201).json({
      success: true,
      data: newTransaction
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};