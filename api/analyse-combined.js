export default async function handler(req, res) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), route: "POST /api/analyse-combined", promptLength: req.body?.prompt?.length }));

  if (req.method !== "POST") return res.status(405).end();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "analyse-combined", msg: "calling Gemini API" }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: req.body.prompt }] }],
        systemInstruction: { parts: [{ text: "Respond with pure raw JSON only. No markdown. Start with { end with }." }] },
        generationConfig: { temperature: 0.1, maxOutputTokens: 8000 },
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify({
      ts: new Date().toISOString(), route: "analyse-combined",
      msg: "Gemini response received",
      finishReason: data.candidates?.[0]?.finishReason,
      promptTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount,
    }));

    if (!response.ok) {
      console.error(JSON.stringify({ ts: new Date().toISOString(), route: "analyse-combined", msg: "Gemini API error", status: response.status, data }));
      return res.status(502).json({ error: "Gemini API error", details: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    res.json({ content: [{ type: "text", text }] });

  } catch (e) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), route: "analyse-combined", error: e.message, stack: e.stack }));
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}