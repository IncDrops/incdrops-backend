// incdrops-backend/api/ideas.js
import { cors } from "./_cors.js";

const MODEL = "gemini-2.0-flash-exp";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export default async function handler(req, res) {
  // 1) CORS FIRST — handles preflight (OPTIONS) and sets ACAO on all paths
  if (cors(req, res)) return;

  // 2) Friendly hint on GET so opening in a browser doesn't look like an error
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      hint: "POST JSON to this endpoint with { industry, targetAudience, services?, contentType? }"
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server missing GEMINI_API_KEY" });
  }

  const { industry, targetAudience, services = "", contentType = "social" } = req.body || {};
  if (!industry || !targetAudience) {
    return res.status(400).json({ error: "industry and targetAudience are required" });
  }

  const prompt = `You are a professional content strategist. Generate 10 ${contentType} content ideas for a ${industry} business that targets ${targetAudience}.
${services ? `Their products/services include: ${services}` : ""}

For each idea, provide:
- title (max 50 characters)
- description (max 150 characters)
- platforms (array of 2-3 social platforms)
- hashtags (array of 3-5 relevant hashtags with # symbol)

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": 1,
    "title": "...",
    "description": "...",
    "platforms": ["...", "..."],
    "hashtags": ["#...", "#..."]
  }
]

Make ideas specific, actionable, and engaging. Keep total response under 750 tokens.`;

  try {
    const r = await fetch(`${API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 750, temperature: 0.8, topP: 0.95 }
      })
    });

    if (!r.ok) {
      return res.status(r.status).json({ error: `Gemini API Error: ${r.status}` });
    }

    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

    // Strip code fences if model added them
    const unfenced = raw.replace(/```json\s*|\s*```/g, "").trim();

    // Parse robustly
    let ideas;
    try {
      ideas = JSON.parse(unfenced);
      if (!Array.isArray(ideas)) throw new Error("Not an array");
    } catch {
      const m = unfenced.match(/\[\s*{[\s\S]*}\s*\]/); // first JSON array substring
      if (!m) return res.status(502).json({ error: "Could not parse ideas JSON from Gemini" });
      ideas = JSON.parse(m[0]);
    }

    return res.status(200).json({ ideas });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Failed to generate ideas" });
  }
}
