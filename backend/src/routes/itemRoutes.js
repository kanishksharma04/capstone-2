const express = require('express');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getSellerItems,
} = require('../controllers/itemController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getItems);
router.get('/seller/my-items', authenticate, authorizeRoles('seller'), getSellerItems);
router.get('/:id', authenticate, getItemById);
router.post('/', authenticate, authorizeRoles('seller', 'admin'), createItem);
router.put('/:id', authenticate, authorizeRoles('seller', 'admin'), updateItem);
router.delete('/:id', authenticate, authorizeRoles('seller', 'admin'), deleteItem);

// /api/search -> search items
router.get('/search/proxy', authenticate, searchItems);

module.exports = router;


