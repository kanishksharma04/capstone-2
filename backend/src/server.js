require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authenticate } = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { searchItems } = require('./controllers/itemController');

const app = express();
const PORT = process.env.PORT || 3001;

const CLIENT_URL = process.env.CLIENT_URL || '*';

const corsOptions = {
  origin(origin, callback) {
    if (!origin || CLIENT_URL === '*' || origin === CLIENT_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flex Vault API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.get('/api/search', authenticate, searchItems);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Flex Vault API listening on port ${PORT}`);
  });
});


