const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey",
    pass: process.env.SENDGRID_API_KEY,
  },
});

async function sendMail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.response);
    return info;
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}

module.exports = sendMail;