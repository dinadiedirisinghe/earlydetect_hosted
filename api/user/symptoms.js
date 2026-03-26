import { initDb, saveSymptoms } from "../../lib/db.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();
  const { userId, selected, details } = req.body;
  await saveSymptoms(userId, { selected, details });
  res.json({ success: true });
}