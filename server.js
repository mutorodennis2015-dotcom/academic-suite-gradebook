require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client } = require('@aws-sdk/client-s3');
const puppeteer = require('puppeteer');

const app = express();

// 1. Configure CORS for your frontend
app.use(cors({
  origin: 'https://glasspane.pages.dev',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Handle preflight requests
app.options('*', cors()); 

// 2. Increase payload limit for large gradebook datasets
app.use(express.json({ limit: '10mb' }));

// 3. S3/R2 Setup
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

app.post('/export', async (req, res) => {
  let browser;
  try {
    // Launch headless browser for PDF generation
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Render the report data provided by your client
    await page.setContent(`<html><body><h1>Gradebook Data</h1><pre>${JSON.stringify(req.body, null, 2)}</pre></body></html>`, { 
      waitUntil: 'networkidle0' 
    });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    // Return the generated PDF to the user
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': 'attachment; filename="gradebook_report.pdf"'
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error("SERVER-SIDE EXPORT ERROR:", error);
    res.status(500).json({ error: "Export failed: " + error.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});