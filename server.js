import express from "express";
import cors from "cors";
import {
  findUserByEmail,
  createUser,
  updateUserBasicInfo,
  saveProfile,
  loadProfile,
  saveHabits,
  loadHabits,
  saveMedical,
  loadMedical,
  saveReports,
  loadReports,
  saveSymptoms,
  loadSymptoms,
  saveAnalysis,
  loadAnalysis,
  loadFullUserData,
} from "./database.js";

const app = express();

app.use(express.json({ limit: "20mb" }));
app.use(cors({ origin: "http://localhost:5173" }));

app.post("/api/analyse", async (req, res) => {
  try {
    // ── THIS is the fix: check which screen sent the request FIRST,
    // before trying to read anything from req.body ──────────────────
    let parts = [];

    if (req.body.messages) {
      // ReportsScreen — sends Anthropic-style messages array with file + text
      const userContent = req.body.messages[0].content;

      const fileBlock = userContent.find(
        (b) => b.type === "image" || b.type === "document",
      );
      const textBlock = userContent.find((b) => b.type === "text");

      if (fileBlock) {
        parts.push({
          inline_data: {
            mime_type: fileBlock.source.media_type,
            data: fileBlock.source.data,
          },
        });
      }
      if (textBlock) {
        parts.push({ text: textBlock.text });
      }
    } else if (req.body.contents) {
      // SymptomsScreen — sends Gemini-native contents array directly
      parts = req.body.contents[0].parts;
    }

    const response = await fetch(
      // `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          // systemInstruction: {
          //   parts: [{
          //     text: "You are a medical analysis assistant. Always respond with pure raw JSON only. Never use markdown code fences, never use ```json, never add any text before or after the JSON object. Start your response with { and end with }.",
          //   }],
          // },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8000,
          },
        }),
      },
    );

    const data = await response.json();
    console.log("response:" + JSON.stringify(data));

    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    res.json({
      content: [{ type: "text", text: geminiText }],
    });
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Failed to reach Gemini API" });
  }
});

// Add this AFTER your existing /api/analyse route, before app.listen
app.post("/api/analyse-combined", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(
      // `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // systemInstruction: {
          //   parts: [
          //     {
          //       text: "You are a medical analysis assistant. Always respond with pure raw JSON only. Never use markdown code fences. Start with { and end with }.",
          //     },
          //   ],
          // },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8000,
          },
        }),
      },
    );

    const data = await response.json();
    console.log("response: " + JSON.stringify(data));
    const geminiText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    res.json({ content: [{ type: "text", text: geminiText }] });
  } catch (error) {
    console.error("Combined analysis error:", error);
    res.status(500).json({ error: "Failed to reach Gemini API" });
  }
});

import nodemailer from "nodemailer";

// ── In-memory OTP store ────────────────────────────────────────────────────
// Stores { otp, expiresAt } keyed by email address.
// In a production app you would use Redis or a database instead.
// OTPs expire after 10 minutes.
const otpStore = new Map();

// ── Configure Gmail SMTP transporter ──────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465 (SSL)
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Route 1: Send OTP ──────────────────────────────────────────────────────
// React calls this when the user submits their email address.
// The server generates a 6-digit code, stores it with a 10-minute expiry,
// and emails it to the user.
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // Generate a random 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store it with a 10-minute expiry
  otpStore.set(email, {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
  });

  try {
    await transporter.sendMail({
      from: `"EarlyDetect" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your EarlyDetect verification code",
      // Plain text fallback
      text: `Your EarlyDetect verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
      // HTML version
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f0f7ff; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0d1f3c; font-size: 24px; margin: 0;">Early<span style="color: #14a6a5;">Detect</span></h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px;">Health Intelligence for Young Adults</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; text-align: center;">
            <p style="color: #0d1f3c; font-size: 15px; margin-bottom: 20px;">
              Your verification code is:
            </p>
            <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #0e7c7b; margin: 16px 0;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">
              If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    res.status(500).json({ error: "Failed to send email. Please try again." });
  }
});

// ── Route 2: Verify OTP ────────────────────────────────────────────────────
// React calls this when the user submits the 6-digit code.
// The server checks it matches and hasn't expired, then deletes it.
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore.get(email);

  // Not found
  if (!stored) {
    return res
      .status(400)
      .json({
        error: "No OTP found for this email. Please request a new one.",
      });
  }

  // Expired
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return res
      .status(400)
      .json({ error: "This code has expired. Please request a new one." });
  }

  // Wrong code
  if (stored.otp !== otp) {
    return res
      .status(400)
      .json({ error: "Incorrect code. Please check and try again." });
  }

  // Find existing user or create a new one
  let user = findUserByEmail(email);
  if (!user) user = createUser(email);

  // Load all their existing data from the database
  const existingData = loadFullUserData(user.userId);

  res.json({ success: true, userId: user.userId, existingData });

  // Success — delete the OTP so it can't be reused
  otpStore.delete(email);
  res.json({ success: true });
});

// ── Registration data ─────────────────────────────────────────────────────
app.post("/api/user/registration", (req, res) => {
  const { userId, firstName, lastName, birthday } = req.body;
  updateUserBasicInfo(userId, { firstName, lastName, birthday });
  res.json({ success: true });
});

// ── Profile (body stats) ──────────────────────────────────────────────────
app.post("/api/user/profile", (req, res) => {
  const { userId, ...profileData } = req.body;
  saveProfile(userId, profileData);
  res.json({ success: true });
});

// ── Habits ────────────────────────────────────────────────────────────────
app.post("/api/user/habits", (req, res) => {
  const { userId, ...habits } = req.body;
  saveHabits(userId, habits);
  res.json({ success: true });
});

// ── Medical ───────────────────────────────────────────────────────────────
app.post("/api/user/medical", (req, res) => {
  const { userId, meds, family } = req.body;
  saveMedical(userId, { meds, family });
  res.json({ success: true });
});

// ── Reports ───────────────────────────────────────────────────────────────
app.post("/api/user/reports", (req, res) => {
  const { userId, cards } = req.body;
  saveReports(userId, { cards });
  res.json({ success: true });
});

// ── Symptoms ──────────────────────────────────────────────────────────────
app.post("/api/user/symptoms", (req, res) => {
  const { userId, selected, details } = req.body;
  saveSymptoms(userId, { selected, details });
  res.json({ success: true });
});

// ── Analysis ──────────────────────────────────────────────────────────────
app.post("/api/user/analysis", (req, res) => {
  const { userId, result } = req.body;
  saveAnalysis(userId, result);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log("✅ EarlyDetect proxy server running at http://localhost:3001");
});
