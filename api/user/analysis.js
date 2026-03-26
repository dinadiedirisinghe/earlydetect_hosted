import { initDb, saveAnalysis } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/analysis",
      userId: req.body?.userId,
    }),
  );

  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, result } = req.body;

    if (!userId) {
      console.log("analysis: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    await saveAnalysis(userId, result);
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/analysis",
        msg: "saved",
        userId,
      }),
    );
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/analysis",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to save analysis." });
  }
}
