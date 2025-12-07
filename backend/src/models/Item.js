const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['sneakers', 'streetwear', 'electronics', 'accessories', 'other'],
      default: 'other',
    },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    description: { type: String, required: true },
    images: [{ type: String }],
    tags: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);


