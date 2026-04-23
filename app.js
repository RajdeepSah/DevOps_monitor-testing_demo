// ============================================
//  DevOps Demo App — "Break It, Catch It, Fix It"
//  Phase 1: The Happy Path (everything works!)
// ============================================

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// --- In-memory "database" ---
const products = [
  { id: 1, name: "Laptop",     price: 999.99,  stock: 25 },
  { id: 2, name: "Headphones", price: 149.99,  stock: 100 },
  { id: 3, name: "Keyboard",   price: 79.99,   stock: 50 },
  { id: 4, name: "Monitor",    price: 349.99,  stock: 15 },
];

// --- Middleware: Request Logger (simulates monitoring) ---
const requestLog = [];

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const entry = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
    requestLog.push(entry);
    if (requestLog.length > 100) requestLog.shift();
  });

  next();
});

// =============================================
//  ENDPOINT 1: /health  — System Health Check
// =============================================
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime().toFixed(2) + "s",
    memoryUsage: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + " MB",
    timestamp: new Date().toISOString(),
  });
});

// =============================================
//  ENDPOINT 2: /calculate  — Price Calculator
// =============================================
app.post("/calculate", (req, res) => {
  const { productId, quantity, discountPercent = 0 } = req.body;

  if (!productId || !quantity) {
    return res.status(400).json({ error: "productId and quantity are required" });
  }
  if (quantity <= 0) {
    return res.status(400).json({ error: "Quantity must be positive" });
  }
  if (discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ error: "Discount must be between 0 and 100" });
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // ⚠️ BUG: Dev refactored at 2AM and accidentally negated the subtotal
  const subtotal = -(product.price * quantity);
  const discount = subtotal * (discountPercent / 100);
  const taxRate = 0.08;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  res.json({
    product: product.name,
    unitPrice: product.price,
    quantity,
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  });
});

// =============================================
//  ENDPOINT 3: /data  — Product Inventory
// =============================================
app.get("/data", (req, res) => {
  const { minPrice, maxPrice, inStock } = req.query;

  let result = [...products];

  if (minPrice) {
    result = result.filter((p) => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    result = result.filter((p) => p.price <= parseFloat(maxPrice));
  }
  if (inStock === "true") {
    result = result.filter((p) => p.stock > 0);
  }

  res.json({
    count: result.length,
    products: result,
  });
});

// =============================================
//  BONUS: /metrics  — Monitoring Dashboard Data
// =============================================
app.get("/metrics", (req, res) => {
  const totalRequests = requestLog.length;
  const errors = requestLog.filter((r) => r.status >= 400).length;
  const avgResponseTime =
    totalRequests > 0
      ? (requestLog.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests).toFixed(2)
      : 0;

  res.json({
    totalRequests,
    errorCount: errors,
    errorRate: totalRequests > 0 ? ((errors / totalRequests) * 100).toFixed(1) + "%" : "0%",
    avgResponseTime: avgResponseTime + "ms",
    recentRequests: requestLog.slice(-10).reverse(),
  });
});

module.exports = app;
