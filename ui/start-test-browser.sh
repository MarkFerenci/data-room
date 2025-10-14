#!/bin/bash

# Start Chromium with Remote Debugging for Playwright E2E Tests
# Based on USER_MANUAL.md testing requirements

set -e

PORT=9222
USER_DATA_DIR="/tmp/playwright-browser-$(date +%s)"

echo "🎭 Starting Chromium with Remote Debugging"
echo "================================================"
echo "Port: $PORT"
echo "User Data Dir: $USER_DATA_DIR"
echo ""
echo "This browser will be used by Playwright E2E tests."
echo "Keep this window open while running tests!"
echo ""
echo "To run tests in another terminal:"
echo "  cd ui"
echo "  npm run test:e2e"
echo ""
echo "Press Ctrl+C to stop the browser."
echo "================================================"
echo ""

# Detect which Chromium binary to use
if command -v chromium &> /dev/null; then
    BROWSER="chromium"
elif command -v google-chrome &> /dev/null; then
    BROWSER="google-chrome"
elif command -v chromium-browser &> /dev/null; then
    BROWSER="chromium-browser"
else
    echo "❌ Error: Chromium/Chrome not found!"
    echo ""
    echo "Please install Chromium:"
    echo "  Ubuntu/Debian: sudo apt install chromium-browser"
    echo "  Fedora: sudo dnf install chromium"
    echo "  macOS: brew install chromium"
    echo ""
    exit 1
fi

echo "Using browser: $BROWSER"
echo ""

# Start browser with remote debugging
$BROWSER \
  --remote-debugging-port=$PORT \
  --user-data-dir="$USER_DATA_DIR" \
  --no-first-run \
  --no-default-browser-check \
  about:blank

# Cleanup on exit
echo ""
echo "🧹 Cleaning up user data directory..."
rm -rf "$USER_DATA_DIR"
echo "✅ Done!"
