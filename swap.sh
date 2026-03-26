#!/bin/bash
# ==========================================
#  🔄 Demo Swap Script
#  Quickly switch between clean and bugged app versions
#
#  Usage:
#    bash swap.sh clean    — Restore the working version
#    bash swap.sh bug1     — Activate Bug 1: Bad Logic (negative prices)
#    bash swap.sh bug2     — Activate Bug 2: Server Crash (null reference)
#    bash swap.sh bug3     — Activate Bug 3: Performance Bomb (5s delay)
# ==========================================

set -e

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
  clean)
    cp "$SCRIPT_DIR/bugs/app-clean.js" "$SCRIPT_DIR/app.js"
    echo ""
    echo -e "${GREEN}✅ CLEAN VERSION RESTORED${NC}"
    echo -e "   All endpoints working correctly."
    echo -e "   Run ${CYAN}npm test${NC} to show 14/14 green."
    echo ""
    ;;
  bug1)
    cp "$SCRIPT_DIR/bugs/app-bug1-logic.js" "$SCRIPT_DIR/app.js"
    echo ""
    echo -e "${RED}🐛 BUG 1 ACTIVATED — Bad Logic${NC}"
    echo -e "   ${YELLOW}What broke:${NC} /calculate returns NEGATIVE prices"
    echo -e "   ${YELLOW}Scenario:${NC}  A dev refactored at 2AM and accidentally negated the subtotal"
    echo -e "   ${YELLOW}Caught by:${NC} Unit tests (Expected 1999.98, got -1999.98)"
    echo -e "   ${YELLOW}NOT caught by:${NC} Monitoring — the server is running fine!"
    echo ""
    echo -e "   👉 Run ${CYAN}npm test${NC} to see the failures"
    echo ""
    ;;
  bug2)
    cp "$SCRIPT_DIR/bugs/app-bug2-crash.js" "$SCRIPT_DIR/app.js"
    echo ""
    echo -e "${RED}🐛 BUG 2 ACTIVATED — Server Crash${NC}"
    echo -e "   ${YELLOW}What broke:${NC} /data crashes with TypeError (null reference)"
    echo -e "   ${YELLOW}Scenario:${NC}  Dev added a 'featured product' feature but forgot to handle missing data"
    echo -e "   ${YELLOW}Caught by:${NC} Integration tests AND monitoring (500 errors, dashboard turns red)"
    echo ""
    echo -e "   👉 Run ${CYAN}npm test${NC} to see test failures"
    echo -e "   👉 Start server with ${CYAN}npm start${NC}, then hit ${CYAN}curl http://localhost:3000/data${NC}"
    echo -e "   👉 Watch the dashboard go RED"
    echo ""
    ;;
  bug3)
    cp "$SCRIPT_DIR/bugs/app-bug3-slow.js" "$SCRIPT_DIR/app.js"
    echo ""
    echo -e "${RED}🐛 BUG 3 ACTIVATED — Performance Bomb${NC}"
    echo -e "   ${YELLOW}What broke:${NC} /data takes 5 SECONDS to respond"
    echo -e "   ${YELLOW}Scenario:${NC}  Dev added a 'cache warm-up' that blocks every request"
    echo -e "   ${YELLOW}Caught by:${NC} Performance tests (timeout) AND monitoring (response time spike)"
    echo -e "   ${YELLOW}Tricky:${NC}    The data is CORRECT — it's just painfully slow!"
    echo ""
    echo -e "   👉 Run ${CYAN}npm test${NC} — /data tests will TIMEOUT (5s > Jest's default)"
    echo -e "   👉 Start server with ${CYAN}npm start${NC}, then hit ${CYAN}curl http://localhost:3000/data${NC}"
    echo -e "   👉 Watch the dashboard response time spike from green → ${RED}RED${NC}"
    echo ""
    ;;
  *)
    echo ""
    echo -e "${CYAN}🔄 DevOps Demo — Version Swapper${NC}"
    echo ""
    echo "  Usage: bash swap.sh [version]"
    echo ""
    echo "  Versions:"
    echo -e "    ${GREEN}clean${NC}  — Restore working version (Phase 1)"
    echo -e "    ${RED}bug1${NC}   — Bad Logic: negative prices"
    echo -e "    ${RED}bug2${NC}   — Server Crash: null reference in /data"
    echo -e "    ${RED}bug3${NC}   — Performance Bomb: 5-second delay on /data"
    echo ""
    ;;
esac
