// Ultra-clear CORS for browser + preflight
export function cors(req, res) {
  // Allow EXACT origins you serve from (include www!)
  const allowed = new Set([
    "https://incdrops.com",
    "https://www.incdrops.com",
    "http://localhost:5173",
    "http://localhost:8080"
  ]);

  const origin = req.headers.origin || "";

  if (allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    // If you ever need cookies/Authorization across origins, also:
    // res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Stripe-Signature"
  );

  // IMPORTANT: answer preflight early
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true; // handled
  }
  return false; // continue
}
