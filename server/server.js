const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { readData } = require('./utils/db');
const cakesRouter = require('./routes/cakes');
const ordersRouter = require('./routes/orders');
const contactRouter = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/cakes', cakesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/contact', contactRouter);

// Admin Owner Authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'paikada123';
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password && password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Welcome back, Owner!' });
  } else {
    res.status(401).json({ success: false, message: 'Incorrect owner password' });
  }
});

// Dashboard Summary Stats Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const cakes = await readData('cakes.json');
    const orders = await readData('orders.json');
    const contacts = await readData('contacts.json');

    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const bakingOrders = orders.filter(o => o.status === 'Baking').length;
    const readyOrders = orders.filter(o => o.status === 'Ready').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    res.json({
      success: true,
      stats: {
        totalCakes: cakes.length,
        totalOrders: orders.length,
        pendingOrders,
        bakingOrders,
        readyOrders,
        deliveredOrders,
        totalInquiries: contacts.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving statistics' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Paikada Bakes API',
    time: new Date().toISOString()
  });
});

// Serve frontend static assets from parent directory
const clientPath = path.join(__dirname, '..');
app.use(express.static(clientPath));

// Fallback to index.html for root or client navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎂 Paikada Bakes Server is live!`);
  console.log(`🌐 Website:     http://localhost:${PORT}`);
  console.log(`📡 API Base:    http://localhost:${PORT}/api`);
  console.log(`🛡️ Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`=========================================`);
});
