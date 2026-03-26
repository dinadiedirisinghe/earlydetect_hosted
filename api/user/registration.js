import { initDb, updateUserBasicInfo } from "../../lib/db.js";

export default async function handler(req, res) {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      route: "POST /api/user/registration",
      userId: req.body?.userId,
    }),
  );
  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { userId, firstName, lastName, birthday } = req.body;

    if (!userId) {
      console.log("registration: missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    await updateUserBasicInfo(userId, firstName, lastName, birthday);
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/registration",
        msg: "saved",
        userId,
      }),
    );
    res.json({ success: true });
  } catch (e) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        route: "user/registration",
        error: e.message,
        stack: e.stack,
      }),
    );
    res.status(500).json({ error: "Failed to register." });
  }
}
