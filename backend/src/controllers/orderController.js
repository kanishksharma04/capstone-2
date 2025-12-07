const CartItem = require('../models/CartItem');
const Item = require('../models/Item');
const Order = require('../models/Order');

const checkout = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({ error: 'Address is required with street, city, state, and zipCode' });
    }

    const cartItems = await CartItem.find({ userId: req.user.userId }).populate('itemId');

    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderItems = cartItems.map((ci) => {
      const item = ci.itemId;
      return {
        itemId: item._id,
        nameSnapshot: item.name,
        priceSnapshot: item.price * (1 - item.discount / 100),
        quantity: ci.quantity,
        imageSnapshot: Array.isArray(item.images) && item.images.length ? item.images[0] : null,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, oi) => sum + oi.priceSnapshot * oi.quantity,
      0
    );

    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country || 'India',
      },
    });

    await CartItem.deleteMany({ userId: req.user.userId });

    return res.status(201).json(order);
  } catch (err) {
    console.error('Checkout error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ orders });
  } catch (err) {
    console.error('Get orders error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (err) {
    console.error('Get order error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  checkout,
  getOrders,
  getOrderById,
};


