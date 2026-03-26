export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt }] }],
        systemInstruction: { parts: [{ text: "Respond with pure raw JSON only. No markdown. Start with { end with }." }] },
        generationConfig: { temperature: 0.1, maxOutputTokens: 8000 },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  res.json({ content: [{ type: "text", text }] });
}