import { initDb, saveMedical } from "../../lib/db.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();
  const { userId, meds, family } = req.body;
  await saveMedical(userId, { meds, family });
  res.json({ success: true });
}