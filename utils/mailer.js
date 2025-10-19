
// mailer.js

const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// 1️⃣ Set your API key (from environment variables)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 2️⃣ Function to send email
async function sendMail(to, subject, html) {
  const msg = {
    to,
    from: process.env.EMAIL_FROM, // must be a verified sender in SendGrid
    subject,
    html,
  };

  try {
    // Send email through HTTPS request
    const response = await sgMail.send(msg);
    console.log("✅ Email sent successfully:", response[0].statusCode);
    return response;
  } catch (err) {
    // Check for detailed SendGrid errors
    if (err.response) {
      console.error("❌ Error sending email:", err.response.body.errors);
    } else {
      console.error("❌ Error sending email:", err);
    }
    throw err;
  }
}

module.exports= sendMail;

