import nodemailer from "nodemailer";
import { initDb, saveOtp } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();

  const { email } = req.body;
  if (!email?.includes("@")) return res.status(400).json({ error: "Invalid email" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await saveOtp(email, otp);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: `"EarlyDetect" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your EarlyDetect verification code",
    html: `<div style="font-family:sans-serif;padding:32px;background:#f0f7ff;border-radius:16px;max-width:480px">
      <h2 style="color:#0d1f3c">Early<span style="color:#14a6a5">Detect</span></h2>
      <p>Your verification code is:</p>
      <div style="font-size:42px;font-weight:700;letter-spacing:12px;color:#0e7c7b">${otp}</div>
      <p style="color:#94a3b8;font-size:13px">Expires in 10 minutes.</p>
    </div>`,
  });

  res.json({ success: true });
}