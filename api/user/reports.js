import { initDb, saveReports } from "../../lib/db.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();
  const { userId, cards } = req.body;
  await saveReports(userId, { cards });
  res.json({ success: true });
}