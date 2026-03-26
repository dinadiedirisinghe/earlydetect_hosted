export default async function handler(req, res) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), route: "POST /api/analyse", hasMessages: !!req.body?.messages, hasContents: !!req.body?.contents }));

  if (req.method !== "POST") return res.status(405).end();

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;

    // Build parts depending on which screen sent the request
    let parts = [];
    if (req.body.messages) {
      const content = req.body.messages[0].content;
      const fileBlock = content.find(b => b.type === "image" || b.type === "document");
      const textBlock = content.find(b => b.type === "text");
      if (fileBlock) parts.push({ inline_data: { mime_type: fileBlock.source.media_type, data: fileBlock.source.data } });
      if (textBlock) parts.push({ text: textBlock.text });
      console.log(JSON.stringify({ ts: new Date().toISOString(), route: "analyse", msg: "file + text request", hasFile: !!fileBlock }));
    } else if (req.body.contents) {
      parts = req.body.contents[0].parts;
      console.log(JSON.stringify({ ts: new Date().toISOString(), route: "analyse", msg: "text-only request" }));
    }

    console.log(JSON.stringify({ ts: new Date().toISOString(), route: "analyse", msg: "calling Gemini API" }));

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: "Respond with pure raw JSON only. No markdown. Start with { end with }." }] },
        generationConfig: { temperature: 0.1, maxOutputTokens: 4000 },
      }),
    });

    const data = await response.json();
    console.log(JSON.stringify({
      ts: new Date().toISOString(), route: "analyse",
      msg: "Gemini response received",
      finishReason: data.candidates?.[0]?.finishReason,
      promptTokens: data.usageMetadata?.promptTokenCount,
      outputTokens: data.usageMetadata?.candidatesTokenCount,
    }));

    if (!response.ok) {
      console.error(JSON.stringify({ ts: new Date().toISOString(), route: "analyse", msg: "Gemini API error", status: response.status, data }));
      return res.status(502).json({ error: "Gemini API error", details: data });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    res.json({ content: [{ type: "text", text }] });

  } catch (e) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), route: "analyse", error: e.message, stack: e.stack }));
    res.status(500).json({ error: "Analysis failed. Please try again." });
  }
}