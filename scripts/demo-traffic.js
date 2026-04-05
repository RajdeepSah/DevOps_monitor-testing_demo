/**
 * Same requests as test-traffic.sh — works on Windows (PowerShell) without Bash/curl.
 * Requires: API running on http://localhost:3000 (npm start or Docker).
 */
const base = process.env.API_BASE || "http://localhost:3000";

async function req(method, path, body) {
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const opts = { method };
  if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const text = await res.text();
  console.log(res.status, text.slice(0, 500) + (text.length > 500 ? "…" : ""));
}

async function main() {
  console.log("Generating traffic for the dashboard…\n");

  console.log("1) GET /health");
  await req("GET", "/health");
  console.log("");

  console.log("2) POST /calculate (Laptop x2)");
  await req("POST", "/calculate", { productId: 1, quantity: 2 });
  console.log("");

  console.log("3) POST /calculate (Keyboard, 10% off)");
  await req("POST", "/calculate", {
    productId: 3,
    quantity: 1,
    discountPercent: 10,
  });
  console.log("");

  console.log("4) GET /data");
  await req("GET", "/data");
  console.log("");

  console.log("5) GET /data?maxPrice=100");
  await req("GET", "/data?maxPrice=100");
  console.log("");

  console.log("6) POST /calculate (bad request — empty body)");
  await req("POST", "/calculate", {});
  console.log("");

  console.log("Done. Refresh dashboard.html if needed.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
