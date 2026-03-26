import { initDb, saveAnalysis } from "../../lib/db.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();
  const { userId, result } = req.body;
  await saveAnalysis(userId, result);
  res.json({ success: true });
}