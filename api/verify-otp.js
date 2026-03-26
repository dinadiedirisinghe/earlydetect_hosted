import { initDb, verifyOtp, findUserByEmail, createUser, loadFullUserData } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  await initDb();

  const { email, otp } = req.body;
  const result = await verifyOtp(email, otp);
  if (result.error) return res.status(400).json({ error: result.error });

  let user = await findUserByEmail(email);
  if (!user) user = await createUser(email);

  const existingData = await loadFullUserData(user.user_id);
  res.json({ success: true, userId: user.user_id, existingData });
}