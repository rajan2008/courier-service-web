const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendEmail = async (email, subject, text, html) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    text: text,
    html: html
  };

  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${email}`);
    } else {
      console.log(`⚠️ SMTP not configured. Logged Email to ${email} | Subject: ${subject}`);
    }
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

module.exports = {
  sendEmail
};
