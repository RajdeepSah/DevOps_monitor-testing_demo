#!/bin/bash
# ==========================================
#  🔥 Stress Traffic Generator
#  Hits all endpoints repeatedly so the dashboard shows live reactions
#  Run this WHILE the server is running to populate the monitoring view
#
#  Usage: bash stress.sh [rounds]
#  Default: 5 rounds
# ==========================================

ROUNDS=${1:-5}
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}🔥 Stress Test — $ROUNDS rounds hitting all endpoints${NC}"
echo -e "   Watch the dashboard while this runs!"
echo ""

for i in $(seq 1 $ROUNDS); do
  echo -e "${YELLOW}── Round $i/$ROUNDS ──${NC}"

  # Hit /health
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
  TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/health)
  if [ "$STATUS" -lt 400 ]; then
    echo -e "  /health      ${GREEN}$STATUS${NC}  ${TIME}s"
  else
    echo -e "  /health      ${RED}$STATUS${NC}  ${TIME}s"
  fi

  # Hit /calculate
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/calculate \
    -H "Content-Type: application/json" \
    -d '{"productId": 1, "quantity": 2}')
  TIME=$(curl -s -o /dev/null -w "%{time_total}" -X POST http://localhost:3000/calculate \
    -H "Content-Type: application/json" \
    -d '{"productId": 1, "quantity": 2}')
  if [ "$STATUS" -lt 400 ]; then
    echo -e "  /calculate   ${GREEN}$STATUS${NC}  ${TIME}s"
  else
    echo -e "  /calculate   ${RED}$STATUS${NC}  ${TIME}s"
  fi

  # Hit /data
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:3000/data)
  TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 http://localhost:3000/data)
  if [ "$STATUS" -lt 400 ]; then
    echo -e "  /data        ${GREEN}$STATUS${NC}  ${TIME}s"
  else
    echo -e "  /data        ${RED}$STATUS${NC}  ${TIME}s"
  fi

  echo ""
  sleep 1
done

echo -e "${CYAN}✅ Stress test complete. Check the dashboard!${NC}"
echo ""
