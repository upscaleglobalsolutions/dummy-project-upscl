require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve your complete website
app.use(express.static(__dirname));

// Basic email validation
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Decode Base64 SMTP password
function decodeBase64(value) {
  if (!value) return value;

  try {
    return Buffer.from(value, "base64").toString("utf8");
  } catch {
    return value;
  }
}

const smtpPass = decodeBase64(process.env.SMTP_PASS);

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: smtpPass,
  },
});

// Contact form API
app.post("/api/contact", async (req, res) => {
  const { name, email, company, phone, service, message } = req.body || {};

  // Required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      error: "Name, email, and message are required.",
    });
  }

  // Email validation
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: "Please provide a valid email address.",
    });
  }

  // Message length
  if (message.length > 5000) {
    return res.status(400).json({
      error: "Message is too long.",
    });
  }

  try {
    await transporter.sendMail({
      from: `"Upscale Global Solutions Contact Form" <${process.env.SMTP_USER}>`,

      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,

      replyTo: email,

      subject: `New Contact Form Message from ${name}`,

      text: `
Name: ${name}
Email: ${email}
Company: ${company || "Not provided"}
Phone: ${phone || "Not provided"}
Service: ${service || "Not selected"}

Message:
${message}
      `,

      html: `
        <h2>New Contact Form Submission</h2>

        <p>
          <strong>Name:</strong>
          ${escapeHtml(name)}
        </p>

        <p>
          <strong>Email:</strong>
          ${escapeHtml(email)}
        </p>

        <p>
          <strong>Company:</strong>
          ${escapeHtml(company || "Not provided")}
        </p>

        <p>
          <strong>Phone:</strong>
          ${escapeHtml(phone || "Not provided")}
        </p>

        <p>
          <strong>Service:</strong>
          ${escapeHtml(service || "Not selected")}
        </p>

        <p>
          <strong>Message:</strong>
        </p>

        <p>
          ${escapeHtml(message).replace(/\n/g, "<br>")}
        </p>
      `,
    });

    res.json({
      success: true,
      message: "Your message has been sent successfully.",
    });
  } catch (error) {
    console.error("Failed to send email:", error);

    res.status(500).json({
      error: "Failed to send message. Please try again later.",
    });
  }
});

// HTML escaping
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
