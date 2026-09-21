const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');

const ORDERS_FILE = 'orders.json';

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await readData(ORDERS_FILE);
    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const orders = await readData(ORDERS_FILE);
    const order = orders.find(o => o.id === req.params.id || o.orderId === req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST place a new order
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      cakeName,
      weight,
      isEggless,
      deliveryDate,
      deliveryTime,
      customMessage,
      deliveryType,
      deliveryAddress,
      notes
    } = req.body;

    if (!customerName || !phone || !cakeName) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and cake flavor are required'
      });
    }

    const orders = await readData(ORDERS_FILE);

    // Generate readable order ID, e.g., PB-2041
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderId = `PB-${orderNumber}`;

    const newOrder = {
      id: `order-${Date.now()}`,
      orderId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      cakeName: cakeName.trim(),
      weight: weight || '1 kg',
      isEggless: Boolean(isEggless),
      deliveryDate: deliveryDate || '',
      deliveryTime: deliveryTime || '',
      customMessage: customMessage ? customMessage.trim() : '',
      deliveryType: deliveryType || 'Pickup',
      deliveryAddress: deliveryAddress ? deliveryAddress.trim() : '',
      notes: notes ? notes.trim() : '',
      status: 'Pending', // Pending, Baking, Ready, Delivered, Cancelled
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    await writeData(ORDERS_FILE, orders);

    res.status(201).json({
      success: true,
      message: `Order ${orderId} created successfully!`,
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

// PATCH update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Baking', 'Ready', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const orders = await readData(ORDERS_FILE);
    const index = orders.findIndex(o => o.id === req.params.id || o.orderId === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();

    await writeData(ORDERS_FILE, orders);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: orders[index]
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  try {
    const orders = await readData(ORDERS_FILE);
    const filtered = orders.filter(o => o.id !== req.params.id && o.orderId !== req.params.id);

    if (filtered.length === orders.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await writeData(ORDERS_FILE, filtered);
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting order' });
  }
});

module.exports = router;
