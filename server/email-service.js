// This is just for reference - the email functionality is already included in server/index.js
const nodemailer = require('nodemailer');

// This would be in your .env file
// EMAIL_USER=your_email@gmail.com
// EMAIL_PASS=your_app_specific_password
// YOUR_EMAIL=your_personal_email@example.com

module.exports = {
    sendRedeemEmail: async (giftName) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.YOUR_EMAIL,
            subject: 'Gift Redemption Notification',
            text: `Kiersten has redeemed the gift: ${giftName}!`,
            html: `<h2>Gift Redemption Notification</h2>
                   <p>Kiersten has redeemed the gift: <strong>${giftName}</strong>!</p>`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Redeem email sent successfully');
            return true;
        } catch (error) {
            console.error('Error sending redeem email:', error);
            return false;
        }
    }
};