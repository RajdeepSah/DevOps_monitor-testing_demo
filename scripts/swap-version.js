/**
 * Cross-platform copy of bugs/*.js → app.js (same as swap.sh).
 * Usage: node scripts/swap-version.js <clean|bug1|bug2|bug3>
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "app.js");

const variants = {
  clean: "bugs/app-clean.js",
  bug1: "bugs/app-bug1-logic.js",
  bug2: "bugs/app-bug2-crash.js",
  bug3: "bugs/app-bug3-slow.js",
};

const hints = {
  clean:
    "Restored clean app.js. Run npm test (expect 14/14). After restart, optional: npm run demo:traffic for the dashboard.",
  bug1:
    "Bug 1: /calculate returns negative totals. Try npm test. Dashboard: run npm run demo:traffic — errors may still look “fine”.",
  bug2:
    "Bug 2: /data returns 500. After restart: npm run demo:traffic — then watch Error count / red status on the dashboard.",
  bug3:
    "Bug 3: /data ~5s slow. After restart: npm run demo:traffic — watch Avg response time on the dashboard.",
};

const arg = (process.argv[2] || "").toLowerCase();

if (!variants[arg]) {
  console.log(`
Usage: node scripts/swap-version.js <variant>

  clean   — working copy (from bugs/app-clean.js)
  bug1    — bad logic (negative prices on /calculate)
  bug2    — crash on /data (500)
  bug3    — slow /data (~5s)

Or: npm run demo:swap -- clean
    npm run demo:bug1
`);
  process.exit(arg ? 1 : 0);
}

const src = path.join(root, variants[arg]);
if (!fs.existsSync(src)) {
  console.error("Missing file:", src);
  process.exit(1);
}

fs.copyFileSync(src, dest);
console.log(`OK: ${variants[arg]} → app.js`);
console.log("");
console.log("------------------------------------------------------------------");
console.log("  RESTART the API or the dashboard will not change.");
console.log("  Node keeps the old app.js in memory until you stop and run");
console.log("  npm start again (Ctrl+C in that terminal, then npm start).");
console.log("------------------------------------------------------------------");
console.log("");
console.log(hints[arg]);
console.log("");
