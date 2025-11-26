const express = require('express');
const { addToCart, getCart, updateCartItem, removeCartItem } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');
const { checkout } = require('../controllers/orderController');

const router = express.Router();

router.post('/', authenticate, addToCart);
router.get('/', authenticate, getCart);
router.put('/:id', authenticate, updateCartItem);
router.delete('/:id', authenticate, removeCartItem);
router.post('/checkout', authenticate, checkout);

module.exports = router;


