/**
 * Same idea as stress.sh — repeated hits while the server runs (for the dashboard).
 * Usage: node scripts/demo-stress.js [rounds]   (default rounds: 5)
 */
const base = process.env.API_BASE || "http://127.0.0.1:3000";
const rounds = Math.max(1, parseInt(process.argv[2] || "5", 10) || 5);

async function hit(method, path, body) {
  const url = `${base}${path}`;
  const start = Date.now();
  const opts = { method };
  if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    const ms = Date.now() - start;
    await res.text().catch(() => {});
    return { status: res.status, ms };
  } catch (e) {
    const ms = Date.now() - start;
    return { status: 0, ms, err: e.name === "AbortError" ? "timeout" : "error" };
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  console.log(`Stress: ${rounds} round(s) → ${base}\n`);

  for (let i = 1; i <= rounds; i++) {
    console.log(`── Round ${i}/${rounds} ──`);

    let r = await hit("GET", "/health");
    console.log(`  /health      ${r.status || r.err}  ${(r.ms / 1000).toFixed(3)}s`);

    r = await hit("POST", "/calculate", { productId: 1, quantity: 2 });
    console.log(`  /calculate   ${r.status || r.err}  ${(r.ms / 1000).toFixed(3)}s`);

    r = await hit("GET", "/data");
    console.log(`  /data        ${r.status || r.err}  ${(r.ms / 1000).toFixed(3)}s`);

    console.log("");
    if (i < rounds) await new Promise((res) => setTimeout(res, 1000));
  }

  console.log("Done. Check the dashboard.");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
