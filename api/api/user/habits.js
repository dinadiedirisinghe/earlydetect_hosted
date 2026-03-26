import { initDb, saveHabits } from "../../lib/db.js";
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();
  const { userId, ...data } = req.body;
  await saveHabits(userId, data);
  res.json({ success: true });
}