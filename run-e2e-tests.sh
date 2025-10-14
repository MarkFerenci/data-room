#!/bin/bash

# Run all E2E tests with full setup
# This script starts all required services and runs the test suite

set -e

echo "🎭 Data Room E2E Test Runner"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
check_service() {
    local url=$1
    local name=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is running"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not running"
        return 1
    fi
}

# Check database
echo "Checking services..."
echo ""

if ! podman ps | grep -q postgres; then
    echo -e "${YELLOW}⚠${NC} PostgreSQL is not running"
    echo "  Starting database..."
    cd backend
    ./start-postgres.sh > /dev/null 2>&1 &
    sleep 5
    cd ..
fi

check_service "http://localhost:5433" "PostgreSQL (port 5433)" || true

# Check backend
if ! check_service "http://localhost:5001/api/auth/login" "Backend (port 5001)"; then
    echo -e "${YELLOW}⚠${NC} Backend not running. Please start it:"
    echo "  cd backend && uv run python app.py"
    echo ""
    read -p "Press Enter when backend is ready..."
fi

# Check frontend
if ! check_service "http://localhost:5000" "Frontend (port 5000)"; then
    echo -e "${YELLOW}⚠${NC} Frontend not running. Please start it:"
    echo "  cd ui && npm run dev"
    echo ""
    read -p "Press Enter when frontend is ready..."
fi

# Check remote browser
if ! curl -sf "http://127.0.0.1:9222/json/version" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Remote browser not running. Please start it:"
    echo "  cd ui && ./start-test-browser.sh"
    echo ""
    read -p "Press Enter when browser is ready..."
fi

echo ""
echo -e "${GREEN}All services ready!${NC}"
echo ""

# Run tests
echo "Running E2E tests..."
echo "===================================="
echo ""

cd ui

# Run tests with options
if [ "$1" == "--ui" ]; then
    npm run test:e2e:ui
elif [ "$1" == "--debug" ]; then
    npm run test:e2e:debug
elif [ "$1" == "--headed" ]; then
    npm run test:e2e:headed
else
    npm run test:e2e
fi

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
echo "===================================="

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "View the HTML report:"
    echo "  npm run test:e2e:report"
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "View the HTML report for details:"
    echo "  npm run test:e2e:report"
fi

echo ""

exit $TEST_EXIT_CODE
