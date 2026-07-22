import mongoose from 'mongoose';

const coolerSchema = new mongoose.Schema({
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
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
    index: true
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
  // Quick human-readable lookup code printed on tags (generated if not supplied)
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

export const Cooler = mongoose.model('Cooler', coolerSchema);
