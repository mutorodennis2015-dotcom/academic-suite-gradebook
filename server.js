require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize S3 (ensure these env vars are set in Render)
const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://9f2283c8f3239a2ad85599b57a4401c4.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Root route to fix "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).send('Academic Suite Gradebook Service is Running.');
});

// Example route for your future PDF export functionality
app.post('/export', async (req, res) => {
  try {
    // Your export/puppeteer logic goes here
    res.status(200).send("Export process initiated");
  } catch (error) {
    console.error(error);
    res.status(500).send("Export failed");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});