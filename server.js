const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/send-email', async (req, res) => {
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <onboarding@resend.dev>',
        to: process.env.MAIL_TO,
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${email}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to send.');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});