# DevOps demo — CI/CD testing focus

Small **Node.js + Express** API for teaching **DevOps with emphasis on CI/CD and automated testing**: what runs on every change, how tests block bad deploys, and how **Docker** produces a **deployable artefact**. A separate **HTML dashboard** illustrates **runtime observability** (errors, latency) that complements tests.

---

## How the project works (mental model)

There are **three separate things** that are easy to mix up:

| Piece | What it is | When it runs |
|--------|------------|--------------|
| **API (`app.js` + `server.js`)** | Express app with `/health`, `/calculate`, `/data`, `/metrics`. | When you run `npm start` **or** `docker run` (port 3000). |
| **Tests (`app.test.js`)** | Jest + Supertest call the app **in-process** (no real network server required for most checks). | Locally via `npm test` and in **GitHub Actions** on every push/PR. |
| **Dashboard (`dashboard.html`)** | A static web page opened in your browser. It **polls** `http://localhost:3000/metrics` every ~2 seconds. | Only when **you** open the file while the API is running. **Not** part of CI. |

**Data flow when you demo locally:**

1. Start the API (`npm start` or Docker).
2. Open `dashboard.html` (double-click or “Open with Live Server”). The browser calls `/metrics`.
3. The API logs each request in memory and `/metrics` returns counts, error rate, average latency, and a short **recent request** list.
4. Generate traffic in another terminal (`npm run demo:traffic` or `npm run demo:stress`) → dashboard numbers and the table update.

**Swapping versions:** **`swap.sh`** (Bash) or **`npm run demo:bug1`** / **`demo:clean`** etc. (Node, works in PowerShell) **replace `app.js`** on disk only. The process from **`npm start` does not reload files** — you must **stop it (Ctrl+C) and run `npm start` again** or you keep serving the old code. Tests always load whatever `app.js` is on disk when Jest starts.

**Dashboard after a bug:** the UI only updates when the API receives **new** HTTP requests. After restart, run **`npm run demo:traffic`** (or `demo:stress`) so `/data` etc. are hit; opening the dashboard alone does not generate traffic.

---

## Why we have a dashboard

The dashboard is **not** production monitoring. It is a **teaching stand-in** for “what you might see in Grafana / APM / logs after deploy”:

- **Bug 1 (wrong math):** the process stays “healthy” and may show **no errors** — good for arguing that **metrics alone** do not catch wrong business logic.
- **Bug 2 (500 errors):** **error count / error rate** and red status show up once traffic hits the broken route.
- **Bug 3 (slow `/data`):** **average response time** spikes even when status codes are 200.

So: **tests** = fast feedback in CI; **dashboard** = intuition for **runtime signals** teams use **in addition to** tests.

---

## What each bug does (cheat sheet)

| Variant | Command (npm / Bash) | What breaks | `npm test` | Dashboard (with traffic) |
|---------|----------------------|-------------|------------|---------------------------|
| **Clean** | `npm run demo:clean` or `bash swap.sh clean` | Nothing — intended behaviour. | All pass | Green / normal latency |
| **Bug 1** | `npm run demo:bug1` or `bash swap.sh bug1` | `/calculate` uses inverted subtotals → **negative** prices. | Fails on expected totals / positivity | Often still looks “fine” (200s, low errors) |
| **Bug 2** | `npm run demo:bug2` or `bash swap.sh bug2` | `/data` throws → **500** responses. | Fails (not 200) | Errors and red status |
| **Bug 3** | `npm run demo:bug3` or `bash swap.sh bug3` | `/data` **waits ~5s** before responding. | Fails (timeouts / very slow) | High average response time, red/yellow |

Generic: `npm run demo:swap -- clean` (same as `demo:clean`).

---

## CI vs CD — what this repo shows and what it does not

- **Continuous Integration (CI):** merge often; every change is **verified automatically**. Here: install dependencies, run **`npm test`** on GitHub’s Linux runner. If tests fail, the workflow fails → you treat the change as **not integrated**.
- **Continuous Delivery / Deployment (CD):** get a **verified** change to an environment or users (registry, Kubernetes, VM, PaaS, …). That usually includes **building a release artefact** and then **promoting** it.

This repository implements:

- **CI** — the **Test** job.
- **A CD building block** — the **Docker build** job produces the **same kind of image** many teams **deploy** (artefact). We do **not** run `docker push` or `kubectl apply` here, so you can say: *“The next step in a real CD pipeline would be push this image and roll it out to staging/production.”*

The workflow name in GitHub is **“CI — tests + container build (CD artefact)”** so “CD” appears as **intent** (what this image is *for*), not as a full deploy automation.

---

## Why we build Docker in CI but do not run tests inside Docker

This is deliberate and common:

- **Tests on the runner:** Jest runs quickly against the **source tree** with **devDependencies** (e.g. Jest, Supertest). Easy logs, fast feedback, simple caching.
- **Docker build after tests:** the **image** is what you would run in dev/stage/prod. Building it in CI proves **“the Dockerfile still produces a runnable image”** (no forgotten files, install step works). That step is **gated** on tests (`needs: test`).

**Alternative** teams use: multi-stage Dockerfile or a separate job that runs `docker run … npm test`. That is valid; we skip it here to keep the demo short and to show the **split** between **verify** (CI) and **package** (image as deploy artefact).

---

## How this maps to your presentation

| Topic | What in this repo |
|--------|-------------------|
| **CI/CD** | [GitHub Actions](.github/workflows/ci.yml): install → **Jest + Supertest** → **Docker build** (second stage only if tests pass). |
| **Testing in the pipeline** | `npm test` is the quality gate; broken logic, crashes, and slow endpoints show up as failures before you treat a build as “green.” |
| **Docker** | [Dockerfile](Dockerfile) builds a minimal runtime image; optional `docker run` for “same artifact everywhere.” |
| **Defense in depth** | Automated tests catch many issues **before** release; the dashboard shows what **monitoring-style** signals might look like **after** deploy. |

---

## Two ways to use this in class

### Option A — Presenter-led demo (no student setup)

**Goal:** You show the story from the front; learners watch.

1. **Pipeline (GitHub):** Open the repo on GitHub → **Actions** → open the latest **“CI — tests + container build (CD artefact)”** run. Walk through the **Test** job, then **Build container image**. Explain that a real **CD** step would **push** that image and **deploy** it; here you only **build** the artefact to keep the demo small.
2. **Local or Docker runtime:** Run the API (`npm start` or Docker below), open `dashboard.html` in a browser, run `npm run demo:traffic` or `npm run demo:stress` to animate metrics (works on Windows PowerShell too).
3. **Break / fix narrative:** Use `npm run demo:bug1` (etc.) and `npm run demo:clean`, or `bash swap.sh …` on Unix/Git Bash — tie it back to “this is what we want the pipeline to catch before production.”

**Requirements:** Your machine (or the classroom PC) with Node.js, optionally Docker; internet if you show GitHub Actions live.

---

### Option B — Interactive (students clone and try)

**Goal:** Everyone runs the same steps; you keep time-boxed tasks.

**Suggested flow (15–25 minutes):**

1. **Clone and test:** `git clone …`, `cd` into the repo, `npm install`, `npm test` (expect all tests passing on the clean tree).
2. **Optional — CI on their fork:** Students **fork** the repo, push a small change (e.g. edit a comment), open **Actions** on the fork and watch CI. (GitHub enables Actions on forks; they may need to approve workflow runs the first time.)
3. **Optional — Docker:** `docker build -t devops-demo:local .` then `docker run --rm -p 3000:3000 devops-demo:local` and hit `http://localhost:3000/health`.
4. **Guided experiment:** Ask them to run `npm run demo:bug1`, then `npm test` again, then `npm run demo:clean`. Discuss: *“Would this failing commit be allowed through a serious CI/CD process?”*

**Requirements:** Node.js 20+ recommended, Git. **Bash** is optional: use `npm run demo:*` for traffic and bug swaps on any OS; `swap.sh` / `test-traffic.sh` / `stress.sh` remain for Git Bash / Linux / macOS. See [Windows notes](#windows-powershell). Docker optional but recommended for one joint exercise.

**Presenter tips:** Publish a short “lab sheet” with exact commands; use a **time check** after `npm install`; pair students if machines vary.

---

## Quick start (local)

```bash
npm install
npm test          # automated API tests (Jest + Supertest)
npm start         # http://localhost:3000
# Open dashboard.html in the browser (file or via a static server)
npm run demo:traffic   # light traffic (works in PowerShell)
npm run demo:stress    # repeated rounds (optional: npm run demo:stress -- 10)

# Swap app.js (bugs demo) — works in PowerShell
npm run demo:clean
npm run demo:bug1
npm run demo:bug2
npm run demo:bug3
```

**Shell scripts (Git Bash / macOS / Linux):** `bash test-traffic.sh`, `bash stress.sh [rounds]`, and `bash swap.sh clean|bug1|bug2|bug3` mirror the `demo:*` npm scripts.

### Windows (PowerShell)

- **Traffic:** `npm run demo:traffic` / `demo:stress` — do **not** run `test-traffic.sh` directly (`.sh` needs Bash).
- **Bugs / restore clean:** `npm run demo:bug1`, `demo:bug2`, `demo:bug3`, `npm run demo:clean` — same behaviour as `swap.sh`.
- **Current directory:** PowerShell does not run `script.sh` from the current folder without `.\` and Bash; prefer the `npm run demo:*` commands above.
- **Optional:** [Git Bash](https://git-scm.com/downloads) still works for `bash swap.sh clean`, etc.

## Docker (optional but on-topic)

Build and run the same service the pipeline builds after tests succeed:

```bash
docker build -t devops-demo:local .
docker run --rm -p 3000:3000 devops-demo:local
```

The image runs **production dependencies only**; **tests stay on the host** (or in CI), which matches how many teams separate **test jobs** from **runtime images**.

## GitHub Actions workflow

File: [.github/workflows/ci.yml](.github/workflows/ci.yml). Display name on GitHub: **CI — tests + container build (CD artefact)**.

- **Triggers:** pushes and pull requests to `main` or `master`.
- **Job 1 — Test:** `npm install` → `npm test` (CI / verification).
- **Job 2 — Build container image:** `docker build` runs only if tests pass (`needs: test`) — produces the **image you would ship** in a CD pipeline (without actually deploying it here).

For class, compare a **red** run (e.g. commit after `swap.sh bug1` and push) vs **green** on clean `main`.

## Project structure

```
├── .github/workflows/ci.yml   ← GitHub Actions: tests + Docker build
├── Dockerfile                 ← Container image for the API
├── app.js                     ← Active application (swap scripts overwrite this)
├── server.js                  ← HTTP server entrypoint
├── app.test.js                ← Test suite run in CI
├── dashboard.html             ← Simple monitoring-style dashboard (browser)
├── swap.sh                    ← Switch clean / bug1 / bug2 / bug3
├── scripts/demo-traffic.js, demo-stress.js, swap-version.js ← `npm run demo:traffic|stress|clean|bug1|bug2|bug3`
├── test-traffic.sh, stress.sh, swap.sh ← Same behaviour via Bash (+ curl where needed)
├── bugs/                      ← Alternate app.js variants for demos
└── package.json
```

## API endpoints

| Method | Path         | Description |
|--------|--------------|-------------|
| GET    | `/health`    | Health check |
| POST   | `/calculate` | Price calculator (tax / discount) |
| GET    | `/data`      | Product list / filters |
| GET    | `/metrics`   | Recent request stats for the dashboard |

## Presenter script outline (CI/CD testing angle)

### Phase 1 — Green path (~5 min)

- Show **green** GitHub Actions run for `main`.
- `npm test` locally → all pass; start server; dashboard + light traffic.

### Phase 2 — Inject failures (~15 min)

Use `npm run demo:bug1` … `demo:bug3` and `npm run demo:clean`, or `bash swap.sh …` (see [swap.sh](swap.sh)). After each swap, run `npm test` and relate failures to **what CI would do** (block merge / block deploy). Use the dashboard where it helps for “runtime visibility.”

```bash
npm run demo:bug1     # bad business logic (tests catch; “server still up”)
npm run demo:bug2     # 500s (tests + dashboard)
npm run demo:bug3     # slow /data (timeouts + latency in UI)
npm run demo:clean    # restore
```

### Phase 3 — Debrief (~5 min)

- Tests → **early feedback** in **CI**.
- Docker → **repeatable** runtime for dev/stage/prod-style discussions.
- Dashboard → **observability** after deploy; not a substitute for tests.

**Closing question:** *If every push ran this pipeline and you only deployed green builds, which of these bugs would reach users?*

---

## License

ISC (see `package.json`).
