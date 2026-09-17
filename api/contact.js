// ═══════════════════════════════════════════════════
//  Vercel Serverless Function — Contact Form Handler
//  Route: POST /api/contact
//  Sends email via Gmail SMTP using Nodemailer
// ═══════════════════════════════════════════════════
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // ── Only allow POST ──────────────────────────────
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  // ── Basic server-side validation ─────────────────
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // ── Create SMTP Transporter ───────────────────────
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,  // Your Gmail address
      pass: process.env.EMAIL_PASS,  // Gmail App Password (NOT your real password)
    },
  });

  // ── Email to YOU (notification) ───────────────────
  const toYouOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,   // Replying goes directly to the sender
    subject: `📬 New Portfolio Message from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Portfolio Message</h1>
        </div>
        <div style="background: #0f172a; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #1e293b;">
          <table style="width: 100%; color: #e2e8f0;">
            <tr>
              <td style="padding: 10px 0; color: #94a3b8; width: 100px;"><strong>From:</strong></td>
              <td style="padding: 10px 0; color: #f1f5f9;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8;"><strong>Email:</strong></td>
              <td style="padding: 10px 0;">
                <a href="mailto:${email}" style="color: #7c3aed;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #94a3b8; vertical-align: top;"><strong>Message:</strong></td>
              <td style="padding: 10px 0; color: #f1f5f9; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; color: #64748b; font-size: 12px;">
            Sent from your portfolio at ms-portfolio-bice.vercel.app
          </div>
        </div>
      </div>
    `,
  };

  // ── Auto-reply to the sender ──────────────────────
  const autoReplyOptions = {
    from: `"Muhammad Sufyan" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Got your message! — Muhammad Sufyan`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">&lt;MS/&gt;</h1>
          <p style="color: #c4b5fd; margin: 8px 0 0 0;">Muhammad Sufyan · Software Engineer</p>
        </div>
        <div style="background: #0f172a; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #1e293b; color: #e2e8f0;">
          <p style="font-size: 18px;">Hi <strong style="color: #a78bfa;">${name}</strong>,</p>
          <p style="line-height: 1.7; color: #cbd5e1;">
            Thanks for reaching out! I've received your message and I'll get back to you 
            as soon as possible — usually within 24 hours.
          </p>
          <p style="line-height: 1.7; color: #cbd5e1;">
            In the meantime, feel free to check out my work on 
            <a href="https://github.com/sufyanfiverr2-sketch" style="color: #7c3aed;">GitHub</a> 
            or connect with me on 
            <a href="https://www.linkedin.com/in/muhammad-sufyan-919677406/" style="color: #3b82f6;">LinkedIn</a>.
          </p>
          <div style="margin-top: 24px; padding: 16px; background: #1e293b; border-radius: 8px; border-left: 3px solid #7c3aed;">
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">Your message:</p>
            <p style="margin: 8px 0 0 0; color: #e2e8f0; font-style: italic;">"${message}"</p>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #1e293b;">
            <p style="margin: 0; color: #64748b;">Best regards,</p>
            <p style="margin: 4px 0 0 0; color: #a78bfa; font-weight: bold; font-size: 18px;">Muhammad Sufyan</p>
            <p style="margin: 2px 0; color: #64748b; font-size: 13px;">BS Software Engineering · GIKI · Class of 2029</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(toYouOptions),
      transporter.sendMail(autoReplyOptions),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully!',
    });

  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(500).json({
      error: 'Failed to send email. Please try again or contact directly.',
    });
  }
};
