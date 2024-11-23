const express = require('express');
const cors = require('cors');
const { convertFile } = require('./src/file-converter');
const { getMetadata } = require('./src/metadata');
const multer = require('multer');
const fs = require('fs');

// Initialize app and middleware
const app = express();
const port = 5000;
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes
app.post('/convert', upload.single('file'), convertFile);
app.post('/metadata', upload.single('file'), getMetadata);

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
