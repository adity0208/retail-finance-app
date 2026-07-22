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

// @desc    Get all transactions (with optional departmental filtering)
// @route   GET /api/transactions
// @access  Public (Internal Shop Use)
export const getTransactions = async (req, res) => {
  try {
    const { department } = req.query;
    let query = {};

    // If a department filter is requested, bind it to our database query
    if (department) {
      // Defensive check: Ensure requested department matches our business sectors
      const validDepartments = ['Clothing', 'Electronics', 'General'];
      if (!validDepartments.includes(department)) {
        return res.status(400).json({
          success: false,
          error: `${department} is not a valid business department`
        });
      }
      query.department = department;
    }

    // Execute the query, sorting chronologically (newest first)
    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Return the industry-standard 200 OK response
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server Error: Unable to retrieve ledger records'
    });
  }
};