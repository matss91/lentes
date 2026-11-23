
const dominiosPermitidos = [
  "https://espacioarte.vercel.app",
  "https://lentes-mocha.vercel.app",
];

const esTuVercel = /^https:\/\/[a-z0-9-]+-matss91s-projects\.vercel\.app$/.test(
  req.headers.origin || ""
);

const origin = req.headers.origin;

if (
  origin &&
  (dominiosPermitidos.includes(origin) || esTuVercel)
) {
  res.setHeader("Access-Control-Allow-Origin", origin);
}

res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
res.setHeader("Vary", "Origin");

if (req.method === "OPTIONS") {
  return res.status(204).end();
}