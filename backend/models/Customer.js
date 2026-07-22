import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Customer full name is required'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    index: true,
    trim: true
  }
}, {
  timestamps: true
});

export const Customer = mongoose.model('Customer', customerSchema);
