// database.js
// ─────────────────────────────────────────────────────────────────────────────
// Sets up the SQLite database and exports helper functions used by server.js.
//
// The database file (earlydetect.db) is created automatically the first time
// the server starts. You will see it appear in your project folder.
//
// TABLE STRUCTURE:
//   users          — one row per registered user (userId, email, timestamps)
//   profiles       — body stats: sex, height, weight, blood type
//   habits         — lifestyle data: exercise, smoking, drinking, etc.
//   medical        — medications list + family history (stored as JSON)
//   reports        — uploaded lab report extraction results (JSON)
//   symptoms       — selected symptoms + details (JSON)
//   analysis       — AI analysis result (JSON)
//
// All health data tables have a foreign key to users.userId so every piece
// of data is always linked back to the correct user.
// ─────────────────────────────────────────────────────────────────────────────

import Database from "better-sqlite3";
import { randomUUID } from "crypto"; // built into Node.js — no extra package needed

// Open (or create) the database file.
// The file is placed in the project root folder.
const db = new Database("earlydetect.db");

// ── Performance setting ──────────────────────────────────────────────────────
// WAL mode makes reads and writes faster and allows concurrent access.
// This is the recommended mode for almost all SQLite applications.
db.pragma("journal_mode = WAL");

// ── Create all tables (only runs if they don't already exist) ─────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    userId      TEXT PRIMARY KEY,          -- e.g. "usr_a1b2c3d4"
    email       TEXT UNIQUE NOT NULL,      -- the verified email address
    firstName   TEXT,
    lastName    TEXT,
    birthday    TEXT,                      -- stored as "YYYY-MM-DD" string
    createdAt   TEXT DEFAULT (datetime('now')),
    updatedAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    userId      TEXT PRIMARY KEY REFERENCES users(userId),
    sex         TEXT,
    heightCm    REAL,
    weightKg    REAL,
    bloodType   TEXT,
    updatedAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS habits (
    userId        TEXT PRIMARY KEY REFERENCES users(userId),
    exerciseFreq  TEXT,
    exerciseTypes TEXT,   -- stored as JSON array string: '["Cardio","Walking"]'
    smoking       TEXT,
    cigPerDay     TEXT,
    yearsSmoke    TEXT,
    drinking      TEXT,
    drugs         TEXT,
    drugsFreq     TEXT,
    diet          TEXT,
    sleepHours    REAL,
    stress        TEXT,
    occupation    TEXT,
    location      TEXT,
    updatedAt     TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS medical (
    userId          TEXT PRIMARY KEY REFERENCES users(userId),
    meds            TEXT,   -- JSON array of medication objects
    familyHistory   TEXT,   -- JSON object: { diabetes, heart, cancer, hypertension, other }
    updatedAt       TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    userId    TEXT PRIMARY KEY REFERENCES users(userId),
    cards     TEXT,   -- JSON array of extracted report card objects
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS symptoms (
    userId    TEXT PRIMARY KEY REFERENCES users(userId),
    selected  TEXT,   -- JSON array of symptom strings
    details   TEXT,   -- JSON object: { duration, severity, notes }
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS analysis (
    userId    TEXT PRIMARY KEY REFERENCES users(userId),
    result    TEXT,   -- full JSON analysis result from Gemini
    updatedAt TEXT DEFAULT (datetime('now'))
  );
`);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// Each function maps to one operation the server needs to do.
// All functions are synchronous (better-sqlite3 is sync by design).
// ─────────────────────────────────────────────────────────────────────────────

// ── Users ────────────────────────────────────────────────────────────────────

/**
 * Find a user by email. Returns the user row or undefined.
 */
export function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

/**
 * Create a new user after OTP verification.
 * Generates a unique userId automatically.
 * Returns the newly created user object.
 */
export function createUser(email) {
  const userId = "usr_" + randomUUID().replace(/-/g, "").slice(0, 12);
  db.prepare(`
    INSERT INTO users (userId, email) VALUES (?, ?)
  `).run(userId, email);
  return findUserByEmail(email);
}

/**
 * Get a user by their userId. Returns the user row or undefined.
 */
export function getUserById(userId) {
  return db.prepare("SELECT * FROM users WHERE userId = ?").get(userId);
}

/**
 * Update the user's name and birthday (from RegScreen).
 */
export function updateUserBasicInfo(userId, { firstName, lastName, birthday }) {
  db.prepare(`
    UPDATE users
    SET firstName = ?, lastName = ?, birthday = ?, updatedAt = datetime('now')
    WHERE userId = ?
  `).run(firstName, lastName, birthday, userId);
}

// ── Profile (body stats) ──────────────────────────────────────────────────────

/**
 * Save or update the user's body stats.
 * Uses INSERT OR REPLACE so it works for both first-time and updates.
 */
export function saveProfile(userId, { sex, height, weight, bloodType }) {
  db.prepare(`
    INSERT INTO profiles (userId, sex, heightCm, weightKg, bloodType, updatedAt)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      sex       = excluded.sex,
      heightCm  = excluded.heightCm,
      weightKg  = excluded.weightKg,
      bloodType = excluded.bloodType,
      updatedAt = datetime('now')
  `).run(userId, sex, parseFloat(height) || null, parseFloat(weight) || null, bloodType);
}

/**
 * Load the user's profile. Returns the profile row or undefined.
 */
export function loadProfile(userId) {
  return db.prepare("SELECT * FROM profiles WHERE userId = ?").get(userId);
}

// ── Health Habits ─────────────────────────────────────────────────────────────

export function saveHabits(userId, habits) {
  db.prepare(`
    INSERT INTO habits (
      userId, exerciseFreq, exerciseTypes, smoking, cigPerDay, yearsSmoke,
      drinking, drugs, drugsFreq, diet, sleepHours, stress, occupation, location, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      exerciseFreq  = excluded.exerciseFreq,
      exerciseTypes = excluded.exerciseTypes,
      smoking       = excluded.smoking,
      cigPerDay     = excluded.cigPerDay,
      yearsSmoke    = excluded.yearsSmoke,
      drinking      = excluded.drinking,
      drugs         = excluded.drugs,
      drugsFreq     = excluded.drugsFreq,
      diet          = excluded.diet,
      sleepHours    = excluded.sleepHours,
      stress        = excluded.stress,
      occupation    = excluded.occupation,
      location      = excluded.location,
      updatedAt     = datetime('now')
  `).run(
    userId,
    habits.exerciseFreq   || null,
    JSON.stringify(habits.exerciseTypes || []),
    habits.smoking        || null,
    habits.cigPerDay      || null,
    habits.yearsSmoke     || null,
    habits.drinking       || null,
    habits.drugs          || null,
    habits.drugsFreq      || null,
    habits.diet           || null,
    habits.sleep          || null,
    habits.stress         || null,
    habits.occupation     || null,
    habits.location       || null,
  );
}

export function loadHabits(userId) {
  const row = db.prepare("SELECT * FROM habits WHERE userId = ?").get(userId);
  if (!row) return null;
  // Parse the JSON array back to a real array before returning
  return { ...row, exerciseTypes: JSON.parse(row.exerciseTypes || "[]") };
}

// ── Medical (medications + family history) ────────────────────────────────────

export function saveMedical(userId, { meds, family }) {
  db.prepare(`
    INSERT INTO medical (userId, meds, familyHistory, updatedAt)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      meds          = excluded.meds,
      familyHistory = excluded.familyHistory,
      updatedAt     = datetime('now')
  `).run(userId, JSON.stringify(meds || []), JSON.stringify(family || {}));
}

export function loadMedical(userId) {
  const row = db.prepare("SELECT * FROM medical WHERE userId = ?").get(userId);
  if (!row) return null;
  return {
    meds:   JSON.parse(row.meds          || "[]"),
    family: JSON.parse(row.familyHistory || "{}"),
  };
}

// ── Lab Reports ───────────────────────────────────────────────────────────────

export function saveReports(userId, { cards }) {
  // Strip out base64Data from each card before saving — those are large binary
  // blobs that don't need to be in the database. We keep the extracted values.
  const cardsToSave = (cards || []).map(card => ({
    fileName:   card.fileName,
    mimeType:   card.mimeType,
    extraction: card.extraction,
    // base64Data intentionally omitted
  }));

  db.prepare(`
    INSERT INTO reports (userId, cards, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      cards     = excluded.cards,
      updatedAt = datetime('now')
  `).run(userId, JSON.stringify(cardsToSave));
}

export function loadReports(userId) {
  const row = db.prepare("SELECT * FROM reports WHERE userId = ?").get(userId);
  if (!row) return null;
  return { cards: JSON.parse(row.cards || "[]") };
}

// ── Symptoms ──────────────────────────────────────────────────────────────────

export function saveSymptoms(userId, { selected, details }) {
  db.prepare(`
    INSERT INTO symptoms (userId, selected, details, updatedAt)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      selected  = excluded.selected,
      details   = excluded.details,
      updatedAt = datetime('now')
  `).run(userId, JSON.stringify(selected || []), JSON.stringify(details || {}));
}

export function loadSymptoms(userId) {
  const row = db.prepare("SELECT * FROM symptoms WHERE userId = ?").get(userId);
  if (!row) return null;
  return {
    selected: JSON.parse(row.selected || "[]"),
    details:  JSON.parse(row.details  || "{}"),
  };
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export function saveAnalysis(userId, result) {
  db.prepare(`
    INSERT INTO analysis (userId, result, updatedAt)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(userId) DO UPDATE SET
      result    = excluded.result,
      updatedAt = datetime('now')
  `).run(userId, JSON.stringify(result));
}

export function loadAnalysis(userId) {
  const row = db.prepare("SELECT * FROM analysis WHERE userId = ?").get(userId);
  if (!row) return null;
  return JSON.parse(row.result || "null");
}

/**
 * Load ALL data for a user in one call.
 * Used by App.jsx on login to restore the full app state.
 */
export function loadFullUserData(userId) {
  const user     = getUserById(userId);
  const profile  = loadProfile(userId);
  const habits   = loadHabits(userId);
  const medical  = loadMedical(userId);
  const reports  = loadReports(userId);
  const symptoms = loadSymptoms(userId);
  const analysis = loadAnalysis(userId);
  return { user, profile, habits, medical, reports, symptoms, analysis };
}

export default db;