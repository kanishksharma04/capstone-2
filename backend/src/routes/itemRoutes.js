const express = require('express');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
} = require('../controllers/itemController');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, getItems);
router.get('/:id', authenticate, getItemById);
router.post('/', authenticate, authorizeRoles('admin'), createItem);
router.put('/:id', authenticate, authorizeRoles('admin'), updateItem);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteItem);

// /api/search -> search items
router.get('/search/proxy', authenticate, searchItems);

module.exports = router;


