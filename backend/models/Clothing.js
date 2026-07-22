import mongoose from 'mongoose';

const clothingSchema = new mongoose.Schema({
  photoData: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    required: true,
    enum: ['Men', 'Women', 'Kids']
  },
  size: {
    type: String,
    required: true,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  },
  costPriceInPaise: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'costPriceInPaise must be an integer representing paise'
    }
  },
  retailPriceInPaise: {
    type: Number,
    required: [true, 'Retail price is required'],
    min: [1, 'Retail price must be greater than zero'],
    validate: {
      validator: Number.isInteger,
      message: 'retailPriceInPaise must be an integer representing paise'
    }
  },
  articleCode: {
    type: String,
    required: [true, 'Article code is required'],
    unique: true,
    index: true,
    trim: true
  },
  // Human-printable quick lookup code (generated if not supplied)
  quickLookupCode: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
    trim: true,
    default: null
  },
  stockCount: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'stockCount must be an integer'
    }
  }
}, {
  timestamps: true
});

export const Clothing = mongoose.model('Clothing', clothingSchema);
