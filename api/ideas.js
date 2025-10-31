// /api/ideas.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cors } from "./_cors";

export default async function handler(req, res) {
  // Run CORS first — stops preflight issues
  if (cors(req, res)) return;

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY in environment" });
  }

  // Extract inputs from request
  const { industry, targetAudience, services, contentType } = req.body || {};

  if (!industry || !targetAudience) {
    return res.status(400).json({ error: "Missing required fields: industry and targetAudience" });
  }

  try {
    // Initialize Gemini client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the prompt dynamically
    const prompt = `
      You are a marketing strategist AI. 
      Generate 5 creative ${contentType || "social media"} content ideas for a business in the ${industry} industry, 
      targeting ${targetAudience}. The business offers ${services || "various services"}.

      Each idea should include:
      - A catchy title
      - A short description (1–2 sentences)
      - 2–3 suggested hashtags
      - 1–2 ideal platforms (like Instagram, Twitter, LinkedIn, YouTube)
    `;

    // Generate content
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse Gemini output (rough structure)
    const ideas = text
      .split(/\d+\.\s+/)
      .filter(Boolean)
      .map((idea, i) => ({
        id: i + 1,
        title: idea.split("\n")[0].trim(),
        description: idea.replace(/^[^\n]+\n/, "").trim(),
      }));

    // Send result
    return res.status(200).json({ ideas });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({
      error: "Failed to generate ideas",
      details: err.message || err,
    });
  }
}
