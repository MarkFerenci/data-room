# E2E Testing Quick Start Guide

Get started with Playwright E2E tests for the Data Room application in 5 minutes!

## 🚀 Quick Start

### 1. Install Dependencies (if not done)

```bash
cd ui
npm install

# For UI/Debug mode, install Playwright browsers (one-time)
npm run test:e2e:install
```

### 2. Start the Application Stack

**Terminal 1 - Database:**
```bash
cd backend
./start-postgres.sh
```

**Terminal 2 - Backend:**
```bash
cd backend
uv run python app.py
```

**Terminal 3 - Frontend:**
```bash
cd ui
npm run dev
```

### 3. Choose Your Testing Mode

#### Option A: Remote Browser Mode (Recommended)

**Terminal 4 - Test Browser:**
```bash
cd ui
./start-test-browser.sh
```

Keep this browser window open!

**Terminal 5 - Run Tests:**
```bash
cd ui
npm run test:e2e
```

#### Option B: UI/Debug Mode (No Browser Setup Needed)

**Terminal 4 - Run Tests:**
```bash
cd ui

# Interactive UI mode
npm run test:e2e:ui

# OR debug mode
npm run test:e2e:debug
```

## 📋 Test Scripts

| Command | Description | Mode |
|---------|-------------|------|
| `npm run test:e2e` | Run all E2E tests | Remote Browser |
| `npm run test:e2e:headed` | Watch tests run in browser | Remote Browser |
| `npm run test:e2e:ui` | Interactive UI mode | Playwright Browser |
| `npm run test:e2e:debug` | Debug mode with step-by-step | Playwright Browser |
| `npm run test:e2e:report` | View HTML test report | Both |
| `npm run test:e2e:install` | Install Playwright browsers | One-time setup |

## 🧪 Run Specific Tests

```bash
# Authentication tests only
npx playwright test e2e/auth.spec.ts

# Data room tests only
npx playwright test e2e/dataroom.spec.ts

# Folder tests only
npx playwright test e2e/folders.spec.ts

# File tests only
npx playwright test e2e/files.spec.ts

# Search tests only
npx playwright test e2e/search.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should create"
```

## 🎯 Test Coverage Map

Based on [USER_MANUAL.md](../../USER_MANUAL.md):

### Section 3: Authentication & Account Management
- ✅ `e2e/auth.spec.ts` - Login, logout, session, security

### Section 4: Data Room Management
- ✅ `e2e/dataroom.spec.ts` - Create, view, edit, delete data rooms

### Section 5: Folder Operations
- ✅ `e2e/folders.spec.ts` - Create, navigate, rename, delete folders

### Section 6: File Operations
- ✅ `e2e/files.spec.ts` - Upload, download, rename, delete files

### Section 7: Search Functionality
- ✅ `e2e/search.spec.ts` - Search by filename and content

## 🐛 Common Issues

### Browser Connection Failed

**Error:** `connect ECONNREFUSED 127.0.0.1:9222`

**Fix:**
```bash
# Restart the test browser
cd ui
./start-test-browser.sh
```

### Backend Not Running

**Error:** Tests timeout waiting for backend

**Fix:**
```bash
# Check backend is running
curl http://localhost:5001/api/auth/login

# If not, start it
cd backend
uv run python app.py
```

### Frontend Not Running

**Error:** Tests fail to load pages

**Fix:**
```bash
# Check frontend is running
curl http://localhost:5000

# If not, start it
cd ui
npm run dev
```

### Database Not Running

**Error:** Backend shows database connection errors

**Fix:**
```bash
# Check database is running
podman ps | grep postgres

# If not, start it
cd backend
./start-postgres.sh
```

## 📊 Understanding Results

After tests complete:

```bash
# View beautiful HTML report
npm run test:e2e:report
```

The report shows:
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- ⏭️ Skipped tests (yellow)
- 📸 Screenshots on failure
- 🎥 Videos on failure
- 🔍 Traces for debugging

## 🎓 Learning Path

1. **Read** [e2e/README.md](README.md) - Full documentation
2. **Study** [e2e/auth.spec.ts](auth.spec.ts) - Example test file
3. **Review** [e2e/fixtures/test-helpers.ts](fixtures/test-helpers.ts) - Helper utilities
4. **Write** your own tests based on USER_MANUAL.md

## 📖 Resources

- [Playwright Docs](https://playwright.dev/)
- [USER_MANUAL.md](../../USER_MANUAL.md) - What to test
- [e2e/README.md](README.md) - Detailed testing guide

---

**Questions?** Check the full [E2E Testing README](README.md)
