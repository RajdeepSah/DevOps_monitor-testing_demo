#!/bin/bash
# ==========================================
#  Demo Traffic Generator
#  Run this to populate the monitoring dashboard
# ==========================================

echo "🔥 Generating traffic to populate the dashboard..."
echo ""

echo "1️⃣  Hitting /health..."
curl -s http://localhost:3000/health
echo ""
echo ""

echo "2️⃣  Hitting /calculate (Laptop x2, no discount)..."
curl -s -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": 2}'
echo ""
echo ""

echo "3️⃣  Hitting /calculate (Keyboard x1, 10% off)..."
curl -s -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{"productId": 3, "quantity": 1, "discountPercent": 10}'
echo ""
echo ""

echo "4️⃣  Hitting /data (all products)..."
curl -s http://localhost:3000/data
echo ""
echo ""

echo "5️⃣  Hitting /data (under $100 only)..."
curl -s "http://localhost:3000/data?maxPrice=100"
echo ""
echo ""

echo "6️⃣  Hitting /calculate (bad request — missing fields)..."
curl -s -X POST http://localhost:3000/calculate \
  -H "Content-Type: application/json" \
  -d '{}'
echo ""
echo ""

echo "✅ Done! Check the dashboard at dashboard.html"