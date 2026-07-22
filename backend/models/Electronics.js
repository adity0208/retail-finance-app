import mongoose from 'mongoose';

const electronicsSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    index: true,
    trim: true
  },
  modelName: {
    type: String,
    required: [true, 'Model name is required'],
    trim: true
  },
  deviceCategory: {
    type: String,
    enum: ['Cooler', 'Mobile', 'Appliance', 'Other'],
    default: 'Cooler'
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    index: true
  },
  // Acquisition cost stored as paise integer
  costPriceInPaise: {
    type: Number,
    min: [0, 'Cost price cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'costPriceInPaise must be an integer representing paise'
    },
    default: 0
  },
  // When sold, link to a customer
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },
  salePriceInPaise: {
    type: Number,
    min: [1, 'Sale price must be greater than zero'],
    validate: {
      validator: Number.isInteger,
      message: 'salePriceInPaise must be an integer representing paise'
    },
    default: null
  },
  // Photo stored as base64 data URL
  photoData: {
    type: String,
    default: null
  },
  // Computed at the exact millisecond of sale and marked immutable
  warrantyExpiryDate: {
    type: Date,
    immutable: true,
    default: null
  },
  warrantyPeriodInMonths: {
    type: Number,
    min: 0,
    default: 0
  },
  quickLookupCode: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
    trim: true,
    default: null
  }
}, {
  timestamps: true
});

export const Electronics = mongoose.model('Electronics', electronicsSchema);
