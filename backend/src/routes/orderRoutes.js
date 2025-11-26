const express = require('express');
const { getOrders, getOrderById } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);

module.exports = router;


