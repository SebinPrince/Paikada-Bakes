const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');

const CONTACTS_FILE = 'contacts.json';

// GET all contact messages
router.get('/', async (req, res) => {
  try {
    const messages = await readData(CONTACTS_FILE);
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving messages' });
  }
});

// POST send new contact message
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || (!phone && !email) || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, contact info (phone or email), and message are required'
      });
    }

    const messages = await readData(CONTACTS_FILE);
    const newMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email ? email.trim() : '',
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    messages.unshift(newMessage);
    await writeData(CONTACTS_FILE, messages);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: newMessage
    });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, message: 'Server error saving message' });
  }
});

module.exports = router;
