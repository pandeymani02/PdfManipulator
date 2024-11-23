const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Allow requests only from this origin
  methods: ['GET', 'POST'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type'], // Allow specific headers
}));

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  const pdfPath = req.file.path;
  const password = req.body.password || 'defaultPassword'; // Password passed from the request body

  // Set the output file path for the protected PDF
  const outputPath = path.resolve(__dirname, `protected_${req.file.originalname.trim()}`);

  try {
    // Send the file to the Python server for processing
    const formData = new FormData();
    formData.append('pdfFile', fs.createReadStream(pdfPath));
    formData.append('password', password);

    // Send the file to the Python server (assumes the Python server is running on port 5001)
    const response = await axios.post('http://localhost:5001/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'stream',
    });

    // Send the protected PDF file back to the user
    response.data.pipe(res);

    // Handle file deletion after download
    response.data.on('end', () => {
      // Delete the uploaded file and the protected file after sending it to the client
      fs.unlink(pdfPath, () => {});
      fs.unlink(outputPath, () => {});
    });
  } catch (error) {
    console.error('Error uploading file to Python server:', error);
    res.status(500).send('Error processing file');
  }
});

app.listen(5002, () => {
  console.log('Node.js server started on port 5002');
});
