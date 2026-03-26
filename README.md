# 🎯 DevOps Demo — "Break It, Catch It, Fix It"

A live classroom demo showing how **testing** and **monitoring** work together in DevOps.

## Quick Start

```bash
npm install
npm test          # 14/14 green ✅
npm start         # Server on http://localhost:3000
# Open dashboard.html in browser
bash stress.sh    # Generate traffic for the dashboard
```

## Project Structure

```
devops-demo/
├── app.js              ← Main Express app (currently active version)
├── server.js           ← Server entry point
├── app.test.js         ← Jest test suite (14 tests)
├── dashboard.html      ← Live monitoring dashboard (open in browser)
├── swap.sh             ← 🔄 Swap between clean and bugged versions
├── test-traffic.sh     ← Light traffic generator
├── stress.sh           ← Heavy traffic generator (for bug demos)
├── bugs/
│   ├── app-clean.js    ← Clean working version (backup)
│   ├── app-bug1-logic.js   ← Bug 1: Negative prices
│   ├── app-bug2-crash.js   ← Bug 2: /data crashes (500)
│   └── app-bug3-slow.js    ← Bug 3: /data takes 5 seconds
└── package.json
```

## Endpoints

| Method | Path         | Description              |
|--------|-------------|--------------------------|
| GET    | `/health`    | System health check      |
| POST   | `/calculate` | Price calculator with tax |
| GET    | `/data`      | Product inventory list   |
| GET    | `/metrics`   | Monitoring metrics       |

---

## 🟢 PHASE 1 — The Happy Path (5 min)

**Goal:** Show the class what DevOps looks like when everything works.

### Steps:
1. Run `npm test` → show 14/14 green tests
2. Run `npm start` in one terminal
3. Open `dashboard.html` in browser → show the dashboard (all green)
4. Run `bash test-traffic.sh` in another terminal → dashboard lights up with requests
5. Say: *"This is what DevOps looks like when everything works. Boring, right? Now let's break things."*

---

## 🔴 PHASE 2 — Break It (3 rounds × 5 min = 15 min)

**How it works:** For each round:
1. Stop the server (Ctrl+C)
2. Run `bash swap.sh bugN` to inject the bug
3. Ask the class: *"What test or monitor would catch this?"*
4. Run `npm test` and/or start the server to prove it
5. Debrief: what layer of defense caught it?

### Cheat Sheet:

```bash
bash swap.sh bug1     # Activate bad logic
bash swap.sh bug2     # Activate server crash
bash swap.sh bug3     # Activate performance bomb
bash swap.sh clean    # Restore working version
```

---

### 🐛 Round 1 — Bad Logic (Unit Tests Catch It)

**The bug:** `/calculate` returns NEGATIVE prices (subtotal is negated)

**Demo steps:**
```bash
bash swap.sh bug1
npm test
```

**What the class sees:**
```
POST /calculate
  ✕ should calculate total correctly    Expected: 1999.98, Received: -1999.98
  ✕ should apply discount correctly     Expected: 79.99,   Received: -79.99
  ✕ should return all positive values   Expected: > 0,     Received: -749.95
```

**Key teaching point:**
> "The server is running perfectly fine. The dashboard is all green.
> But customers are getting charged NEGATIVE prices — they're getting
> paid to buy things! Only UNIT TESTS caught this. Monitoring alone
> would miss this until a customer reports it — or until you're bankrupt."

**Restore:** `bash swap.sh clean`

---

### 🐛 Round 2 — Server Crash (Integration Tests + Monitoring Catch It)

**The bug:** `/data` crashes with a TypeError (null reference)

**Demo steps:**
```bash
bash swap.sh bug2
npm test                    # Shows /data tests → 500 errors
npm start                   # Start the server
bash stress.sh 3            # In another terminal — hit endpoints
# Watch dashboard turn RED  # Error count spikes, status bar flips
```

**What the class sees:**
- `npm test`: all /data tests fail with `Expected: 200, Received: 500`
- Dashboard: error count jumps, error rate spikes, status bar turns RED
- /health and /calculate still work perfectly

**Key teaching point:**
> "This time BOTH testing AND monitoring caught it. The integration
> tests show 500 errors. The dashboard shows the error rate spiking.
> This is DEFENSE IN DEPTH — multiple layers of protection.
> If the tests didn't catch it before deploy, monitoring would catch
> it in production."

**Restore:** `bash swap.sh clean`

---

### 🐛 Round 3 — Performance Bomb (Performance Tests + Monitoring Catch It)

**The bug:** `/data` takes 5 SECONDS to respond (artificial delay)

**Demo steps:**
```bash
bash swap.sh bug3
npm test                    # /data tests TIMEOUT at 5001ms each
npm start                   # Start the server
bash stress.sh 3            # In another terminal
# Watch dashboard response time spike from green → RED
```

**What the class sees:**
- `npm test`: /data tests show "Exceeded timeout of 5000 ms" (vs normal 3-7ms)
- Dashboard: average response time jumps to 5000ms+, turns YELLOW then RED
- The data is CORRECT — it's just painfully slow!

**Key teaching point:**
> "This is the sneaky one. The app didn't crash. The data is correct.
> But every request takes 5 seconds instead of 5 milliseconds.
> In production, your users would be staring at loading spinners.
> Only PERFORMANCE TESTS and MONITORING catch this. This is why
> DevOps teams set response time alerts — not just error alerts."

**Restore:** `bash swap.sh clean`

---

## 🧩 PHASE 3 — Debrief (5 min)

**Tie it all together:**

| Round | Bug Type     | Testing Caught It? | Monitoring Caught It? |
|-------|-------------|--------------------|-----------------------|
| 1     | Bad Logic    | ✅ Unit tests       | ❌ Server looked fine  |
| 2     | Crash        | ✅ Integration tests | ✅ Error rate spiked   |
| 3     | Slow         | ✅ Timeout/perf tests| ✅ Response time spike  |

**Ask the class:** *"If we had all these layers automated in a CI/CD pipeline,
would any of these bugs reach a real user?"* → Answer: **none of them would.**

**The punchline:**
> "Testing catches bugs BEFORE deployment. Monitoring catches them AFTER.
> DevOps is about having BOTH — so nothing slips through."
