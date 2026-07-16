require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors()); // Allows your HTML to talk to this server
app.use(express.json()); // Essential for receiving JSON data

// Initialize S3 - Ensure these are added in Render's Environment tab
const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://9f2283c8f3239a2ad85599b57a4401c4.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Root route to confirm the service is live
app.get('/', (req, res) => {
  res.status(200).send('Academic Suite Gradebook Service is Running.');
});

// Endpoint to receive gradebook data and process export
app.post('/export', async (req, res) => {
  try {
    const gradebookData = req.body; 
    console.log("Received data for PDF:", gradebookData);
    
    // Logic for PDF generation using Puppeteer goes here
    
    res.status(200).json({ message: "PDF export initiated successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Export failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});