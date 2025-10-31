// /api/_cors.js
export function cors(req, res, options = {}) {
  // ✅ Define allowed origins
  const allowedOrigins = options.origins || [
    "https://incdrops.com",
    "https://www.incdrops.com",
    "http://localhost:5173",
    "http://localhost:8080"
  ];

  const origin = req.headers.origin || "";

  // ✅ Apply CORS headers if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    // Always include this header to avoid browser caching mismatched origins
    res.setHeader("Access-Control-Allow-Origin", "https://incdrops.com");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ✅ Handle preflight requests quickly
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true; // Stop processing for OPTIONS
  }

  return false; // Continue for GET/POST
}
