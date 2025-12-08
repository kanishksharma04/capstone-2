require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

const parseOrigins = (value) =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const clientUrlEnv = process.env.CLIENT_URL;
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

const isDev = process.env.NODE_ENV !== 'production';

const corsOrigin = isDev
  ? (origin, callback) => callback(null, true)
  : clientUrlEnv && clientUrlEnv !== '*'
  ? [...parseOrigins(clientUrlEnv), ...defaultDevOrigins]
  : (origin, callback) => callback(null, true);

// CORS configuration - handles preflight automatically
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Explicitly handle OPTIONS requests for all routes (additional safety)
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(express.json());

// Request logging middleware for debugging - log ALL requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', timestamp: new Date().toISOString() });
});

// ============================================
// AUTH ROUTES - Register these FIRST
// ============================================

// Signup route with /api prefix
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = uuidv4();
    const user = await prisma.user.create({
      data: { id: userId, name, email, password: hashedPassword, role }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('API Signup error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Frontend-compatible signup route
app.post('/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = uuidv4();
    const user = await prisma.user.create({
      data: { id: userId, name, email, password: hashedPassword, role }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Signup error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Also add login route without /api prefix
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Login route with /api prefix - MUST be before any catch-all routes
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('=== LOGIN REQUEST RECEIVED ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Original URL:', req.originalUrl);
    console.log('Body received:', { email: req.body?.email, hasPassword: !!req.body?.password });
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Validation failed: Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✓ Login successful for user:', user.email);
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('✗ Login error:', error?.message || error);
    console.error('Error stack:', error?.stack);
    return res.status(500).json({ error: 'Server error', message: error?.message });
  }
});

// Also add me route without /api prefix
app.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error?.message || error);
    res.status(500).json({ error: error?.message || 'Server error' });
  }
});

// Add me route with /api prefix
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error?.message || error);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'FlexVault API', env: process.env.NODE_ENV || 'development' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'FlexVault API is running' });
});

// Items routes (Prisma)
app.get('/api/items', async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const where = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.priceMin || req.query.priceMax) {
      where.price = {};
      if (req.query.priceMin) where.price.gte = Number(req.query.priceMin);
      if (req.query.priceMax) where.price.lte = Number(req.query.priceMax);
    }
    if (req.query.search) {
      const q = req.query.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q] } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get items error:', error?.message || error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cart routes (Prisma)
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const existing = await prisma.cartItem.findUnique({
      where: { userId_itemId: { userId: req.user.userId, itemId } },
    });
    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (Number(quantity) || 1) },
      });
      return res.json(updated);
    }
    const cartItem = await prisma.cartItem.create({
      data: { userId: req.user.userId, itemId, quantity: Number(quantity) || 1 },
    });
    return res.status(201).json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { item: true },
    });
    const mapped = items.map((ci) => ({ id: ci.id, quantity: ci.quantity, item: ci.item }));
    return res.json({ items: mapped });
  } catch (error) {
    console.error('Get cart error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    const cartItem = await prisma.cartItem.update({
      where: { id: req.params.id },
      data: { quantity },
    });
    return res.json(cartItem);
  } catch (error) {
    console.error('Update cart error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/cart/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    return res.status(204).end();
  } catch (error) {
    console.error('Remove cart error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/cart/checkout', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address || !address.street || !address.city || !address.state || !address.zipCode) {
      return res.status(400).json({ error: 'Address is required with street, city, state, and zipCode' });
    }
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { item: true },
    });
    if (!cartItems.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    const orderItemsData = cartItems.map((ci) => ({
      itemId: ci.item.id,
      nameSnapshot: ci.item.name,
      priceSnapshot: ci.item.price * (1 - (ci.item.discount || 0) / 100),
      quantity: ci.quantity,
      imageSnapshot: Array.isArray(ci.item.images) && ci.item.images.length ? ci.item.images[0] : null,
    }));
    const totalAmount = orderItemsData.reduce((sum, oi) => sum + oi.priceSnapshot * oi.quantity, 0);
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        totalAmount,
        status: 'pending',
        addressStreet: address.street,
        addressCity: address.city,
        addressState: address.state,
        addressZipCode: address.zipCode,
        addressCountry: address.country || 'India',
        items: { create: orderItemsData },
      },
      include: { items: true },
    });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.userId } });
    return res.status(201).json(order);
  } catch (error) {
    console.error('Checkout error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Orders routes (Prisma)
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    return res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: { items: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(order);
  } catch (error) {
    console.error('Get order error:', error?.message || error);
    return res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    console.error('Get item error:', error?.message || error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/items/seller/my-items', authenticateToken, async (req, res) => {
  try {
    const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 12;
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';
    const where = { sellerId: req.user.userId };
    if (req.query.category) where.category = req.query.category;
    if (req.query.search) {
      const q = req.query.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);
    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get seller items error:', error?.message || error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
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
    const item = await prisma.item.create({
      data: {
        name: req.body.name,
        brand: req.body.brand,
        category: req.body.category,
        description: req.body.description,
        price,
        discount,
        stock,
        images,
        tags,
        sellerId: req.user.userId,
      },
    });
    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error?.message || error);
    res.status(400).json({ error: 'Invalid item data' });
  }
});

app.put('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (req.user.role === 'seller' && existing.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only update your own items' });
    }
    const data = { ...req.body };
    if (typeof data.discount !== 'undefined') {
      data.discount = Math.max(0, Math.min(100, Number(data.discount || 0)));
    }
    if (typeof data.stock !== 'undefined') {
      data.stock = Math.max(0, Number(data.stock || 0));
    }
    const updated = await prisma.item.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (error) {
    console.error('Update item error:', error?.message || error);
    res.status(400).json({ error: 'Invalid item data' });
  }
});

app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const existing = await prisma.item.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Item not found' });
    if (req.user.role === 'seller' && existing.sellerId !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }
    await prisma.item.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    console.error('Delete item error:', error?.message || error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 404 handler for undefined routes - MUST be last before error handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  console.log(`   Original URL: ${req.originalUrl}`);
  console.log(`   Query:`, req.query);
  
  // If it's a POST to /api/auth/login and we're getting 404, something is wrong
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    console.error('⚠️  CRITICAL: POST /api/auth/login is hitting 404 handler!');
    console.error('   This means the route is not registered properly!');
  }
  
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server - MUST be at the end after all routes
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'all origins'}`);
  console.log(`========================================`);
  console.log('Registered AUTH routes:');
  console.log('  POST /api/auth/signup');
  console.log('  POST /api/auth/login ✓');
  console.log('  GET  /api/auth/me');
  console.log('  POST /auth/signup');
  console.log('  POST /auth/login');
  console.log('  GET  /auth/me');
  console.log('========================================');
  console.log('✓ All routes registered successfully');
  console.log('✓ Server ready to accept requests');
  console.log('========================================');
});
