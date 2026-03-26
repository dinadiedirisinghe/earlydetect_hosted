export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: req.body.messages
          ? [{ parts: [
              req.body.messages[0].content.find(b => b.type === "image" || b.type === "document")
                ? { inline_data: { mime_type: req.body.messages[0].content.find(b => b.type !== "text").source.media_type, data: req.body.messages[0].content.find(b => b.type !== "text").source.data } }
                : null,
              { text: req.body.messages[0].content.find(b => b.type === "text").text }
            ].filter(Boolean) }]
          : req.body.contents,
        systemInstruction: { parts: [{ text: "Respond with pure raw JSON only. No markdown. Start with { end with }." }] },
        generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  res.json({ content: [{ type: "text", text }] });
}