// ============================================
//  DevOps Demo — Test Suite
//  "The Happy Path" — All tests should PASS ✅
// ============================================

const request = require("supertest");
const app = require("./app");

// ─────────────────────────────────────────────
//  TEST GROUP 1: /health — System Health Check
// ─────────────────────────────────────────────
describe("GET /health", () => {
  test("should return healthy status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("healthy");
  });

  test("should include uptime and memory info", async () => {
    const res = await request(app).get("/health");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("memoryUsage");
    expect(res.body).toHaveProperty("timestamp");
  });
});

// ─────────────────────────────────────────────
//  TEST GROUP 2: /calculate — Price Calculator
// ─────────────────────────────────────────────
describe("POST /calculate", () => {
  test("should calculate total correctly without discount", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ productId: 1, quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(1999.98);       // 999.99 * 2
    expect(res.body.discount).toBe(0);
    expect(res.body.tax).toBe(160.0);               // 1999.98 * 0.08
    expect(res.body.total).toBe(2159.98);            // 1999.98 + 160.00
  });

  test("should apply discount correctly", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ productId: 3, quantity: 1, discountPercent: 10 });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(79.99);
    expect(res.body.discount).toBe(8.0);             // 79.99 * 0.10

    // CRITICAL: A discounted total MUST be less than subtotal + full tax
    // If discount makes the price go UP, something is very wrong!
    const fullPriceWithTax = 79.99 * 1.08;           // 86.39 without discount
    expect(res.body.total).toBeLessThan(fullPriceWithTax);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test("should return all positive values (no negative prices!)", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ productId: 2, quantity: 5, discountPercent: 50 });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBeGreaterThan(0);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.tax).toBeGreaterThanOrEqual(0);
  });

  test("should reject missing fields", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test("should reject invalid quantity", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ productId: 1, quantity: -3 });

    expect(res.status).toBe(400);
  });

  test("should return 404 for unknown product", async () => {
    const res = await request(app)
      .post("/calculate")
      .send({ productId: 999, quantity: 1 });

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
//  TEST GROUP 3: /data — Product Inventory
// ─────────────────────────────────────────────
describe("GET /data", () => {
  test("should return all products", async () => {
    const res = await request(app).get("/data");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(4);
    expect(res.body.products).toHaveLength(4);
  });

  test("should filter by minPrice", async () => {
    const res = await request(app).get("/data?minPrice=200");
    expect(res.status).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(200);
    });
  });

  test("should filter by maxPrice", async () => {
    const res = await request(app).get("/data?maxPrice=100");
    expect(res.status).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.price).toBeLessThanOrEqual(100);
    });
  });

  test("should filter in-stock products", async () => {
    const res = await request(app).get("/data?inStock=true");
    expect(res.status).toBe(200);
    res.body.products.forEach((p) => {
      expect(p.stock).toBeGreaterThan(0);
    });
  });

  test("should return correct count after filtering", async () => {
    const res = await request(app).get("/data?minPrice=300");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(res.body.products.length);
  });
});

// ─────────────────────────────────────────────
//  TEST GROUP 4: /metrics — Monitoring Endpoint
// ─────────────────────────────────────────────
describe("GET /metrics", () => {
  test("should return monitoring data", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalRequests");
    expect(res.body).toHaveProperty("errorCount");
    expect(res.body).toHaveProperty("errorRate");
    expect(res.body).toHaveProperty("avgResponseTime");
  });
});
