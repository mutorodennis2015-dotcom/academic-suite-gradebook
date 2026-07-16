require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(express.json({ limit: '50mb' }));

// 1. Setup R2 Client
const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// 2. The PDF Generation Route
app.post('/generate-pdf', async (req, res) => {
  const { htmlContent, fileName } = req.body;

  if (!htmlContent || !fileName) {
    return res.status(400).json({ success: false, message: "Missing content or filename" });
  }

  let browser;
  try {
    // Launch Puppeteer with cloud-friendly settings
    browser = await puppeteer.launch({ 
      headless: true,
      executablePath: '/usr/bin/google-chrome-stable', 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ] 
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    // Upload to R2
    await s3.send(new PutObjectCommand({
      Bucket: 'academic-suite-gradebook',
      Key: `${fileName}.pdf`,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }));

    // Return the successful download link
    const downloadUrl = `https://pub-40711d5214f14442ae9aeb1664f941a7.r2.dev/${fileName}.pdf`;
    res.json({ success: true, url: downloadUrl });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

// 3. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`School PDF Service running on port ${PORT}`));