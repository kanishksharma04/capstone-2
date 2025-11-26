const CartItem = require('../models/CartItem');
const Item = require('../models/Item');

const addToCart = async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'itemId is required' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const existing = await CartItem.findOne({ userId: req.user.userId, itemId });
    if (existing) {
      existing.quantity += Number(quantity) || 1;
      await existing.save();
      return res.json(existing);
    }

    const cartItem = await CartItem.create({
      userId: req.user.userId,
      itemId,
      quantity: Number(quantity) || 1,
    });
    return res.status(201).json(cartItem);
  } catch (err) {
    console.error('Add to cart error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getCart = async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.user.userId }).populate('itemId');
    const mapped = items.map((ci) => ({
      id: ci._id,
      quantity: ci.quantity,
      item: ci.itemId,
    }));
    return res.json({ items: mapped });
  } catch (err) {
    console.error('Get cart error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    return res.json(cartItem);
  } catch (err) {
    console.error('Update cart error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('Remove cart error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};


