import { initDb, saveHabits } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/habits",
      userId: req.body?.userId,
    }),
  );
  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, ...data } = req.body;

    if (!userId) {
      console.log("habits: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/habits",
        msg: "saved",
        userId,
      }),
    );
    await saveHabits(userId, data);
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/habits",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to save habits." });
  }
}
