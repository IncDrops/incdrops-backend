export function cors(req, res, options = {}) {
  const allowed = options.origins || [
    "https://incdrops.com",
    "https://www.incdrops.com",
    "http://localhost:5173"
  ];

  const origin = req.headers.origin || "";
  if (allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }

  return false;
}
