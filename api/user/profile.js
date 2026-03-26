import { initDb, saveProfile } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/profile",
      userId: req.body?.userId,
    }),
  );

  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, ...data } = req.body;

    if (!userId) {
      console.log("profile: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    await saveProfile(userId, data);
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/profile",
        msg: "saved",
        userId,
      }),
    );
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/profile",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to save profile." });
  }
}
