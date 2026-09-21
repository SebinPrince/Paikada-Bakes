const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

async function readData(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeData(fileName, []);
      return [];
    }
    throw err;
  }
}

async function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, fileName);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readData,
  writeData
};
