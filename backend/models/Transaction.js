import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amountInPaise: {
    type: Number,
    required: [true, 'Transaction amount is mandatory'],
    min: [1, 'Amount must be greater than zero']
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['income', 'expense'],
      message: '{VALUE} is not a valid transaction type'
    }
  },
  department: {
    type: String,
    required: true,
    enum: {
      values: ['Clothing', 'Electronics', 'General'],
      message: '{VALUE} is not a valid business department'
    },
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: {
      values: ['Cash', 'UPI', 'Card'],
      message: '{VALUE} is not a supported payment method'
    }
  },
  description: {
    type: String,
    required: [true, 'Please provide a brief narration for this transaction'],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Automatically tracks createdAt and updatedAt fields for auditing
});

export const Transaction = mongoose.model('Transaction', transactionSchema);