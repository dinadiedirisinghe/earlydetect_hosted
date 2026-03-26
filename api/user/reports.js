import { initDb, saveReports } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/reports",
      userId: req.body?.userId,
    }),
  );

  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, cards } = req.body;

    if (!userId) {
      console.log("reports: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    await saveReports(userId, { cards });
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/reports",
        msg: "saved",
        userId,
      }),
    );
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/reports",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to save reports." });
  }
}
