import { sql } from "@vercel/postgres";

// Creates all tables if they don't exist yet.
// Call this at the start of any API route that needs the DB.
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id     TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      first_name  TEXT,
      last_name   TEXT,
      birthday    TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS otp_store (
      email      TEXT PRIMARY KEY,
      otp        TEXT NOT NULL,
      expires_at BIGINT NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS profiles (
      user_id    TEXT PRIMARY KEY REFERENCES users(user_id),
      sex        TEXT,
      height_cm  REAL,
      weight_kg  REAL,
      blood_type TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS habits (
      user_id        TEXT PRIMARY KEY REFERENCES users(user_id),
      exercise_freq  TEXT,
      exercise_types TEXT,
      smoking        TEXT,
      cig_per_day    TEXT,
      years_smoke    TEXT,
      drinking       TEXT,
      drugs          TEXT,
      drugs_freq     TEXT,
      diet           TEXT,
      sleep_hours    REAL,
      stress         TEXT,
      occupation     TEXT,
      location       TEXT,
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS medical (
      user_id        TEXT PRIMARY KEY REFERENCES users(user_id),
      meds           TEXT,
      family_history TEXT,
      updated_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS reports (
      user_id    TEXT PRIMARY KEY REFERENCES users(user_id),
      cards      TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS symptoms (
      user_id    TEXT PRIMARY KEY REFERENCES users(user_id),
      selected   TEXT,
      details    TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS analysis (
      user_id    TEXT PRIMARY KEY REFERENCES users(user_id),
      result     TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function findUserByEmail(email) {
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] ?? null;
}

export async function createUser(email) {
  const userId = "usr_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  await sql`INSERT INTO users (user_id, email) VALUES (${userId}, ${email})`;
  return findUserByEmail(email);
}

export async function getUserById(userId) {
  const { rows } = await sql`SELECT * FROM users WHERE user_id = ${userId}`;
  return rows[0] ?? null;
}

export async function updateUserBasicInfo(userId, firstName, lastName, birthday) {
  await sql`
    UPDATE users SET first_name=${firstName}, last_name=${lastName},
    birthday=${birthday}, updated_at=NOW() WHERE user_id=${userId}
  `;
}

// ── OTP (stored in DB instead of memory) ─────────────────────────────────────

export async function saveOtp(email, otp) {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  await sql`
    INSERT INTO otp_store (email, otp, expires_at) VALUES (${email}, ${otp}, ${expiresAt})
    ON CONFLICT (email) DO UPDATE SET otp=${otp}, expires_at=${expiresAt}
  `;
}

export async function verifyOtp(email, otp) {
  const { rows } = await sql`SELECT * FROM otp_store WHERE email=${email}`;
  const stored = rows[0];
  if (!stored)                      return { error: "No OTP found. Please request a new one." };
  if (Date.now() > stored.expires_at) {
    await sql`DELETE FROM otp_store WHERE email=${email}`;
    return { error: "Code expired. Please request a new one." };
  }
  if (stored.otp !== otp)           return { error: "Incorrect code. Please try again." };
  await sql`DELETE FROM otp_store WHERE email=${email}`;
  return { success: true };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function saveProfile(userId, { sex, height, weight, bloodType }) {
  await sql`
    INSERT INTO profiles (user_id, sex, height_cm, weight_kg, blood_type)
    VALUES (${userId}, ${sex}, ${parseFloat(height)||null}, ${parseFloat(weight)||null}, ${bloodType})
    ON CONFLICT (user_id) DO UPDATE SET
      sex=${sex}, height_cm=${parseFloat(height)||null},
      weight_kg=${parseFloat(weight)||null}, blood_type=${bloodType}, updated_at=NOW()
  `;
}

export async function loadProfile(userId) {
  const { rows } = await sql`SELECT * FROM profiles WHERE user_id=${userId}`;
  return rows[0] ?? null;
}

// ── Habits ────────────────────────────────────────────────────────────────────

export async function saveHabits(userId, h) {
  const types = JSON.stringify(h.exerciseTypes || []);
  await sql`
    INSERT INTO habits (user_id, exercise_freq, exercise_types, smoking, cig_per_day,
      years_smoke, drinking, drugs, drugs_freq, diet, sleep_hours, stress, occupation, location)
    VALUES (${userId}, ${h.exerciseFreq||null}, ${types}, ${h.smoking||null},
      ${h.cigPerDay||null}, ${h.yearsSmoke||null}, ${h.drinking||null}, ${h.drugs||null},
      ${h.drugsFreq||null}, ${h.diet||null}, ${h.sleep||null}, ${h.stress||null},
      ${h.occupation||null}, ${h.location||null})
    ON CONFLICT (user_id) DO UPDATE SET
      exercise_freq=${h.exerciseFreq||null}, exercise_types=${types},
      smoking=${h.smoking||null}, cig_per_day=${h.cigPerDay||null},
      years_smoke=${h.yearsSmoke||null}, drinking=${h.drinking||null},
      drugs=${h.drugs||null}, drugs_freq=${h.drugsFreq||null}, diet=${h.diet||null},
      sleep_hours=${h.sleep||null}, stress=${h.stress||null},
      occupation=${h.occupation||null}, location=${h.location||null}, updated_at=NOW()
  `;
}

export async function loadHabits(userId) {
  const { rows } = await sql`SELECT * FROM habits WHERE user_id=${userId}`;
  if (!rows[0]) return null;
  return { ...rows[0], exerciseTypes: JSON.parse(rows[0].exercise_types || "[]") };
}

// ── Medical ───────────────────────────────────────────────────────────────────

export async function saveMedical(userId, { meds, family }) {
  const m = JSON.stringify(meds || []);
  const f = JSON.stringify(family || {});
  await sql`
    INSERT INTO medical (user_id, meds, family_history) VALUES (${userId}, ${m}, ${f})
    ON CONFLICT (user_id) DO UPDATE SET meds=${m}, family_history=${f}, updated_at=NOW()
  `;
}

export async function loadMedical(userId) {
  const { rows } = await sql`SELECT * FROM medical WHERE user_id=${userId}`;
  if (!rows[0]) return null;
  return { meds: JSON.parse(rows[0].meds || "[]"), family: JSON.parse(rows[0].family_history || "{}") };
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function saveReports(userId, { cards }) {
  const c = JSON.stringify((cards||[]).map(card => ({
    fileName: card.fileName, mimeType: card.mimeType, extraction: card.extraction
  })));
  await sql`
    INSERT INTO reports (user_id, cards) VALUES (${userId}, ${c})
    ON CONFLICT (user_id) DO UPDATE SET cards=${c}, updated_at=NOW()
  `;
}

export async function loadReports(userId) {
  const { rows } = await sql`SELECT * FROM reports WHERE user_id=${userId}`;
  if (!rows[0]) return null;
  return { cards: JSON.parse(rows[0].cards || "[]") };
}

// ── Symptoms ──────────────────────────────────────────────────────────────────

export async function saveSymptoms(userId, { selected, details }) {
  const s = JSON.stringify(selected || []);
  const d = JSON.stringify(details || {});
  await sql`
    INSERT INTO symptoms (user_id, selected, details) VALUES (${userId}, ${s}, ${d})
    ON CONFLICT (user_id) DO UPDATE SET selected=${s}, details=${d}, updated_at=NOW()
  `;
}

export async function loadSymptoms(userId) {
  const { rows } = await sql`SELECT * FROM symptoms WHERE user_id=${userId}`;
  if (!rows[0]) return null;
  return { selected: JSON.parse(rows[0].selected || "[]"), details: JSON.parse(rows[0].details || "{}") };
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export async function saveAnalysis(userId, result) {
  const r = JSON.stringify(result);
  await sql`
    INSERT INTO analysis (user_id, result) VALUES (${userId}, ${r})
    ON CONFLICT (user_id) DO UPDATE SET result=${r}, updated_at=NOW()
  `;
}

export async function loadAnalysis(userId) {
  const { rows } = await sql`SELECT * FROM analysis WHERE user_id=${userId}`;
  if (!rows[0]) return null;
  return JSON.parse(rows[0].result || "null");
}

// ── Load everything for a user ────────────────────────────────────────────────

export async function loadFullUserData(userId) {
  const [user, profile, habits, medical, reports, symptoms, analysis] = await Promise.all([
    getUserById(userId),
    loadProfile(userId),
    loadHabits(userId),
    loadMedical(userId),
    loadReports(userId),
    loadSymptoms(userId),
    loadAnalysis(userId),
  ]);
  return { user, profile, habits, medical, reports, symptoms, analysis };
}