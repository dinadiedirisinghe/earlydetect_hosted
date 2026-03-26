import { initDb, saveSymptoms } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/symptoms",
      userId: req.body?.userId,
    }),
  );

  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, selected, details } = req.body;

    if (!userId) {
      console.log("symptoms: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    await saveSymptoms(userId, { selected, details });
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/symptoms",
        msg: "saved",
        userId,
      }),
    );
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/symptoms",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to save symptoms." });
  }
}
