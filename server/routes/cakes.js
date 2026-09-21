const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/db');

const CAKES_FILE = 'cakes.json';

// GET all cakes (with optional search and category filter)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let cakes = await readData(CAKES_FILE);

    if (category && category !== 'all') {
      cakes = cakes.filter(cake => cake.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      cakes = cakes.filter(cake =>
        cake.name.toLowerCase().includes(q) ||
        (cake.desc && cake.desc.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: cakes.length, data: cakes });
  } catch (error) {
    console.error('Error getting cakes:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving cakes' });
  }
});

// GET cake by ID
router.get('/:id', async (req, res) => {
  try {
    const cakes = await readData(CAKES_FILE);
    const cake = cakes.find(c => c.id === req.params.id);

    if (!cake) {
      return res.status(404).json({ success: false, message: 'Cake not found' });
    }

    res.json({ success: true, data: cake });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST add new cake
router.post('/', async (req, res) => {
  try {
    const { name, price, category, image, desc, isAvailable } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const cakes = await readData(CAKES_FILE);
    const newCake = {
      id: `cake-${Date.now()}`,
      name: name.trim(),
      price: price.trim(),
      category: category.trim().toLowerCase(),
      image: image ? image.trim() : 'images/chocolate_truffle_cake.jpg',
      desc: desc ? desc.trim() : '',
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdAt: new Date().toISOString()
    };

    cakes.unshift(newCake);
    await writeData(CAKES_FILE, cakes);

    res.status(201).json({ success: true, message: 'Cake added successfully', data: newCake });
  } catch (error) {
    console.error('Error adding cake:', error);
    res.status(500).json({ success: false, message: 'Server error adding cake' });
  }
});

// PUT update cake
router.put('/:id', async (req, res) => {
  try {
    const cakes = await readData(CAKES_FILE);
    const index = cakes.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Cake not found' });
    }

    const currentCake = cakes[index];
    const updatedCake = {
      ...currentCake,
      ...req.body,
      id: currentCake.id, // Immutable ID
      updatedAt: new Date().toISOString()
    };

    cakes[index] = updatedCake;
    await writeData(CAKES_FILE, cakes);

    res.json({ success: true, message: 'Cake updated successfully', data: updatedCake });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating cake' });
  }
});

// DELETE cake
router.delete('/:id', async (req, res) => {
  try {
    const cakes = await readData(CAKES_FILE);
    const filtered = cakes.filter(c => c.id !== req.params.id);

    if (filtered.length === cakes.length) {
      return res.status(404).json({ success: false, message: 'Cake not found' });
    }

    await writeData(CAKES_FILE, filtered);
    res.json({ success: true, message: 'Cake deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting cake' });
  }
});

module.exports = router;
