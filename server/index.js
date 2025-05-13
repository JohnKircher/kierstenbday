require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../../bday/public')));

// Path to our redemption database
const REDEEMED_DB_PATH = path.join(__dirname, 'redeemed.json');

// Initialize redemption database if it doesn't exist
if (!fs.existsSync(REDEEMED_DB_PATH)) {
    fs.writeFileSync(REDEEMED_DB_PATH, JSON.stringify({ redeemedIds: [] }));
}

// Helper functions for redemption tracking
const getRedeemedGifts = () => {
    const data = fs.readFileSync(REDEEMED_DB_PATH);
    return JSON.parse(data).redeemedIds;
};

const addRedeemedGift = (giftId) => {
    const data = JSON.parse(fs.readFileSync(REDEEMED_DB_PATH));
    if (!data.redeemedIds.includes(giftId)) {
        data.redeemedIds.push(giftId);
        fs.writeFileSync(REDEEMED_DB_PATH, JSON.stringify(data, null, 2));
    }
};

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint for redeeming gifts
app.post('/api/redeem', (req, res) => {
    const { gift, giftId } = req.body;
    
    // Add to redeemed gifts
    addRedeemedGift(giftId);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.YOUR_EMAIL,
        subject: 'Gift Redemption Notification',
        text: `Kiersten has redeemed the gift: ${gift}!`,
        html: `<h2>Gift Redemption Notification</h2>
               <p>Kiersten has redeemed the gift: <strong>${gift}</strong>!</p>
               <p>Time of redemption: ${new Date().toLocaleString()}</p>`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, error: 'Failed to send notification' });
        }
        console.log('Email sent:', info.response);
        res.json({ 
            success: true, 
            message: 'Redeem notification sent successfully',
            redeemedId: giftId
        });
    });
});

// API endpoint to check redeemed gifts
// Add this BEFORE your app.get('*') route
app.get('/api/redeemed', (req, res) => {
    try {
        const redeemedGifts = getRedeemedGifts();
        res.json({ redeemedGifts });
    } catch (error) {
        console.error('Error fetching redeemed gifts:', error);
        res.status(500).json({ error: 'Failed to load redeemed gifts' });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../bday/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Redemption database: ${REDEEMED_DB_PATH}`);
});