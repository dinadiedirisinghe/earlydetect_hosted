import { initDb, verifyOtp, findUserByEmail, createUser, loadFullUserData } from "../lib/db.js";

export default async function handler(req, res) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), route: "POST /api/verify-otp", body: { email: req.body?.email } }));

  if (req.method !== "POST") return res.status(405).end();

  try {
    await initDb();
    const { email, otp } = req.body;

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", msg: "verifying OTP", email }));
    const result = await verifyOtp(email, otp);

    if (result.error) {
      console.log(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", msg: "verification failed", reason: result.error }));
      return res.status(400).json({ error: result.error });
    }

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", msg: "OTP valid, finding/creating user", email }));
    let user = await findUserByEmail(email);
    const isNewUser = !user;
    if (!user) user = await createUser(email);

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", msg: "user ready", userId: user.user_id, isNewUser }));

    const existingData = await loadFullUserData(user.user_id);

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", msg: "login complete", userId: user.user_id }));
    res.json({ success: true, userId: user.user_id, existingData });

  } catch (e) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), route: "verify-otp", error: e.message, stack: e.stack }));
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
}