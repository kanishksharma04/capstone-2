const Item = require('../models/Item');

const buildItemsQuery = (query) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.priceMin || query.priceMax) {
    filter.price = {};
    if (query.priceMin) filter.price.$gte = Number(query.priceMin);
    if (query.priceMax) filter.price.$lte = Number(query.priceMax);
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    filter.$or = [{ name: regex }, { brand: regex }, { tags: regex }];
  }

  return filter;
};

const getItems = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter = buildItemsQuery(req.query);

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Get items error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Get item error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const createItem = async (req, res) => {
  try {
    const imagesInput = req.body.images;
    const tagsInput = req.body.tags;
    const images = Array.isArray(imagesInput)
      ? imagesInput.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
      : typeof imagesInput === 'string' && imagesInput.length
      ? imagesInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const tags = Array.isArray(tagsInput)
      ? tagsInput.filter((s) => typeof s === 'string' && s.trim()).map((s) => s.trim())
      : typeof tagsInput === 'string' && tagsInput.length
      ? tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const price = Number(req.body.price);
    const discount = Math.max(0, Math.min(100, Number(req.body.discount || 0)));
    const stock = Math.max(0, Number(req.body.stock || 0));

    const itemData = {
      name: req.body.name,
      brand: req.body.brand,
      category: req.body.category,
      description: req.body.description,
      price,
      discount,
      stock,
      images,
      tags,
      sellerId: req.user.role === 'seller' ? req.user.userId : req.body.sellerId,
    };
    const item = await Item.create(itemData);
    return res.status(201).json(item);
  } catch (err) {
    console.error('Create item error:', err.message || err);
    return res.status(400).json({ error: 'Invalid item data' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Allow sellers to update only their own items, admins can update any
    if (req.user.role === 'seller' && item.sellerId?.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own items' });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.json(updatedItem);
  } catch (err) {
    console.error('Update item error:', err.message || err);
    return res.status(400).json({ error: 'Invalid item data' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Allow sellers to delete only their own items, admins can delete any
    if (req.user.role === 'seller' && item.sellerId?.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }

    await Item.findByIdAndDelete(req.params.id);
    return res.status(204).end();
  } catch (err) {
    console.error('Delete item error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getSellerItems = async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    const filter = { sellerId: req.user.userId };
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: regex }, { brand: regex }, { tags: regex }];
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ [sortBy]: order })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    return res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Get seller items error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const searchItems = async (req, res) => {
  try {
    const filter = buildItemsQuery({ search: req.query.q || req.query.search });
    const items = await Item.find(filter).limit(20);
    return res.json({ items });
  } catch (err) {
    console.error('Search items error:', err.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItems,
  getSellerItems,
};

