require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client } = require('@aws-sdk/client-s3');
const puppeteer = require('puppeteer'); // This is the engine that makes the PDF

const app = express();
app.use(cors());
app.use(express.json());

// Initialize S3
const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://9f2283c8f3239a2ad85599b57a4401c4.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

app.get('/', (req, res) => {
  res.status(200).send('Academic Suite Gradebook Service is Running.');
});

// The updated export logic
app.post('/export', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // We send your data to the PDF generator
    await page.setContent(`<html><body><h1>Gradebook Data</h1><pre>${JSON.stringify(req.body, null, 2)}</pre></body></html>`, { 
      waitUntil: 'networkidle0' 
    });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Send the file to your computer
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="gradebook.pdf"'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Export failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});