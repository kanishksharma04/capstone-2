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

// CORS configuration
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Handle preflight requests - must be before other routes
app.options('*', (req, res) => {
  console.log('OPTIONS request:', req.path);
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

app.use(express.json());

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

// Routes
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

// Add login route with /api prefix
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', { method: req.method, path: req.path, body: { email: req.body?.email } });
    
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

    console.log('Login successful for user:', user.email);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error?.message || error);
    res.status(500).json({ error: 'Server error', message: error?.message });
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

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found', 
    path: req.path, 
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
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'all origins'}`);
});
