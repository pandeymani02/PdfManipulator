const fs = require('fs');
const path = require('path');

const getMetadata = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;

    // Extract metadata
    const stats = fs.statSync(filePath);
    const metadata = {
      fileName: req.file.originalname,
      size: `${(stats.size / 1024).toFixed(2)} KB`,
      createdDate: stats.birthtime,
    };

    // Respond with metadata
    res.json(metadata);

    // Cleanup file
    fs.unlink(filePath, () => {});
  } catch (error) {
    console.error('Metadata extraction error:', error);
    res.status(500).send('Error extracting metadata');
  }
};

module.exports = { getMetadata };
