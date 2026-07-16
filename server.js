require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(express.json());

// Initialize S3
const s3 = new S3Client({ /* ... your config ... */ });

// Global browser variable to reuse across requests
let browserInstance = null;

app.post('/export', async (req, res) => {
    try {
        if (!browserInstance) {
            browserInstance = await puppeteer.launch({ args: ['--no-sandbox'] });
        }
        
        const page = await browserInstance.newPage();
        await page.goto(req.body.url);
        const pdf = await page.pdf();
        
        // ... Upload to S3 logic ...
        
        await page.close();
        res.status(200).send("Export successful");
    } catch (error) {
        console.error(error);
        res.status(500).send("Export failed");
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));