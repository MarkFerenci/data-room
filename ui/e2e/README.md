# E2E Tests for Data Room Application

Comprehensive end-to-end tests using Playwright, based on the USER_MANUAL.md workflows and features.

## 📋 Overview

These tests cover all features documented in USER_MANUAL.md:

- ✅ **Authentication** - Sign in/out, session management, security
- ✅ **Data Room Management** - Create, view, edit, delete data rooms
- ✅ **Folder Operations** - Create, navigate, rename, delete folders
- ✅ **File Operations** - Upload, download, rename, delete files
- ✅ **Search Functionality** - Search by filename and PDF content

## 🏗️ Architecture

### Two Testing Modes

This test suite supports two modes of operation:

#### 1. Remote Browser Mode (Default - Recommended)

Uses a **running Chromium browser** with remote debugging on port 9222. This approach provides:

- **Persistent sessions** - Browser state maintained between test runs
- **Manual inspection** - Ability to inspect the browser during tests
- **Real browser debugging** - Connect Chrome DevTools for troubleshooting
- **Realistic testing** - Tests run in your actual browser environment

**Use for:**
- Regular test runs (`npm run test:e2e`)
- Headed mode (`npm run test:e2e:headed`)
- When you want to see tests in real-time in your browser

#### 2. Playwright Browser Mode

Uses Playwright's built-in Chromium for interactive UI and debug modes.

- **Interactive UI** - Best for test development and exploration
- **Debugger** - Step-by-step debugging with Playwright Inspector
- **No external browser needed** - Self-contained

**Use for:**
- UI mode (`npm run test:e2e:ui`)
- Debug mode (`npm run test:e2e:debug`)
- When developing new tests

### Test Structure

```
ui/e2e/
├── auth.spec.ts           # Authentication tests
├── dataroom.spec.ts       # Data Room management tests
├── folders.spec.ts        # Folder operations tests
├── files.spec.ts          # File operations tests
├── search.spec.ts         # Search functionality tests
├── fixtures/
│   └── test-helpers.ts    # Reusable test utilities
└── tsconfig.json          # TypeScript config for tests
```

## 🚀 Getting Started

### Prerequisites

1. **Backend server** running on `http://localhost:5001`
2. **Frontend dev server** running on `http://localhost:5000`
3. **PostgreSQL database** running

### Installation

```bash
cd ui
npm install

# For UI/Debug mode, install Playwright browsers (one-time)
npm run test:e2e:install
```

### Mode 1: Remote Browser (For Regular Test Runs)

**Step 1:** Start Chromium with remote debugging:

```bash
# Use the provided helper script
cd ui
./start-test-browser.sh

# Or manually:
# Linux/macOS
chromium --remote-debugging-port=9222 --user-data-dir=/tmp/playwright-browser

# Windows
chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\Temp\playwright-browser
```

**Important:** Keep this browser window open while running tests!

**Step 2:** Run tests:

```bash
# All tests
npm run test:e2e

# With headed mode (watch in the browser)
npm run test:e2e:headed

# Specific test file
npx playwright test e2e/auth.spec.ts
```

### Mode 2: Playwright Browser (For UI/Debug Mode)

**No browser setup needed!** Just run:

```bash
# Interactive UI mode
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug
```

### Running Tests

#### All Tests (Remote Browser)

```bash
npm run test:e2e
```

#### Interactive UI Mode (Playwright Browser)

```bash
npm run test:e2e:ui
```

#### Debug Mode (Playwright Browser)

```bash
npm run test:e2e:debug
```

#### Headed Mode (Remote Browser - Watch Tests Run)

```bash
npx playwright test --headed
```

## 📝 Test Configuration

Configuration is in `playwright.config.ts`:

```typescript
{
  baseURL: 'http://localhost:5000',
  connectOptions: {
    wsEndpoint: 'ws://127.0.0.1:9222',
  },
  // ... other options
}
```

### Key Settings

- **baseURL**: Frontend application URL
- **wsEndpoint**: Remote debugging WebSocket endpoint
- **trace**: Captured on first retry (for debugging failures)
- **screenshot**: Captured on failure
- **video**: Retained on failure

## 🧪 Writing Tests

### Using Test Helpers

```typescript
import { test } from '@playwright/test'
import { TestHelpers, TestDataGenerator } from './fixtures/test-helpers'

test('example test', async ({ page }) => {
  const helpers = new TestHelpers(page)
  const testData = TestDataGenerator.generateDataRoom()

  // Navigate
  await helpers.navigateTo('/dashboard')

  // Fill form
  await helpers.fillFieldByLabel('Name', testData.name)

  // Click button
  await helpers.clickButton('Create')

  // Wait for navigation
  await helpers.waitForNavigation()
})
```

### Test Data Generators

```typescript
// Generate unique test data
const dataRoom = TestDataGenerator.generateDataRoom()
// => { name: 'Test DataRoom-1234567890-abc123', description: '...' }

const folder = TestDataGenerator.generateFolder()
// => { name: 'Test Folder-1234567890-xyz789' }

const pdfBuffer = TestDataGenerator.createTestPdfBuffer()
// => Buffer containing valid PDF
```

### Authentication Setup

Most tests require authentication:

```typescript
test.beforeEach(async ({ page }) => {
  const helpers = new TestHelpers(page)
  
  // Set mock auth token
  await helpers.setLocalStorage('authToken', 'test-jwt-token')
  
  await helpers.navigateTo('/dashboard')
})
```

## 🔍 Test Coverage

### Authentication (auth.spec.ts)

- ✅ Display login page
- ✅ Redirect unauthenticated users
- ⏭️ OAuth flow (requires manual interaction)
- ✅ Session persistence
- ✅ Sign out functionality
- ✅ Security checks

### Data Rooms (dataroom.spec.ts)

- ✅ Create data room with name and description
- ✅ Validate required fields
- ✅ Character limits
- ✅ View all data rooms
- ✅ Open data room
- ✅ Edit data room
- ✅ Delete with confirmation
- ✅ Naming best practices

### Folders (folders.spec.ts)

- ✅ Create folder
- ✅ Naming validation
- ✅ Prevent duplicates
- ✅ Nested folder creation
- ✅ Navigate into folders
- ✅ Breadcrumb navigation
- ✅ Rename folder
- ✅ Delete folder and contents
- ✅ Folder structure templates

### Files (files.spec.ts)

- ✅ Upload PDF file
- ✅ Auto-rename duplicates
- ✅ Reject non-PDF files
- ✅ File size limits
- ✅ View file details
- ✅ Download files
- ✅ Rename files
- ✅ Delete files
- ✅ Upload to specific folder

### Search (search.spec.ts)

- ✅ Search by filename
- ✅ Search by PDF content
- ✅ Case-insensitive search
- ✅ Partial matches
- ✅ Data room scoped search
- ✅ Display results with metadata
- ✅ No results handling
- ✅ Multi-word queries
- ✅ Search limitations

## 📊 Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test results (passed/failed/skipped)
- Screenshots on failure
- Videos on failure
- Trace files for debugging

## 🐛 Debugging

### View Test in Browser

```bash
npx playwright test --debug
```

This opens the Playwright Inspector where you can:
- Step through tests
- View locators
- Edit tests live
- See network activity

### Connect DevTools

While tests are running, connect Chrome DevTools to the remote browser:

1. Open Chrome
2. Navigate to `chrome://inspect`
3. Click "Configure" and add `localhost:9222`
4. Click "inspect" under Remote Target

### Screenshots

Screenshots are saved in `test-results/screenshots/` when:
- Test fails
- `helpers.takeScreenshot('name')` is called

### Trace Viewer

For failed tests with traces:

```bash
npx playwright show-trace test-results/trace.zip
```

## 🔧 Troubleshooting

### Remote Browser Not Connecting

**Error:** `browserType.connect: connect ECONNREFUSED 127.0.0.1:9222`

**Solution:**
1. Ensure Chromium is running with `--remote-debugging-port=9222`
2. Check port 9222 is not blocked by firewall
3. Try restarting the browser

### Backend/Frontend Not Running

**Error:** Tests fail because app is not accessible

**Solution:**
1. Start backend: `cd backend && uv run python app.py`
2. Start frontend: `cd ui && npm run dev`
3. Verify URLs: `http://localhost:5001` (backend), `http://localhost:5000` (frontend)

### Database Connection Issues

**Error:** Backend shows database errors

**Solution:**
1. Start PostgreSQL: `cd backend && ./start-postgres.sh`
2. Verify connection: `podman ps | grep postgres`

### Authentication Tests Failing

**Error:** OAuth tests fail

**Solution:**
- OAuth tests marked with `test.skip()` require manual interaction
- For automated testing, implement OAuth mocking or use test credentials
- Current tests use mock tokens for authenticated state

### File Upload Tests Failing

**Error:** Cannot find test files

**Solution:**
- Test files are created automatically in `e2e/test-data/`
- Ensure write permissions for test directory
- Check `test.beforeAll()` creates files successfully

## 📚 Best Practices

### Test Independence

Each test should:
- Set up its own data (data rooms, folders, files)
- Clean up after itself (or use unique names to avoid conflicts)
- Not depend on other tests

### Selectors

Prefer stable selectors:
- ✅ `getByRole('button', { name: 'Create' })`
- ✅ `getByLabel('Name')`
- ✅ `getByText('Exact Text')`
- ⚠️ `locator('.class-name')` (can break if CSS changes)
- ❌ `locator('div > span:nth-child(2)')` (fragile)

### Waiting

Use built-in waits:
- ✅ `await expect(element).toBeVisible()`
- ✅ `await helpers.waitForNavigation()`
- ✅ `await helpers.waitForApiCall('/api/...')`
- ❌ `await page.waitForTimeout(5000)` (avoid fixed waits)

### Test Data

Use generators for unique data:
```typescript
const name = TestHelpers.generateUniqueName('Test DataRoom')
// Prevents conflicts between test runs
```

## 🚦 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: dataroom
          POSTGRES_USER: dataroom
          POSTGRES_PASSWORD: dataroom_dev_password
        ports:
          - 5433:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install uv
        run: pip install uv
      
      - name: Install backend dependencies
        run: cd backend && uv sync
      
      - name: Install frontend dependencies
        run: cd ui && npm ci
      
      - name: Install Playwright browsers
        run: cd ui && npx playwright install chromium
      
      - name: Start backend
        run: cd backend && uv run python app.py &
        
      - name: Start frontend
        run: cd ui && npm run dev &
      
      - name: Wait for services
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:5001; do sleep 1; done'
          timeout 60 bash -c 'until curl -f http://localhost:5000; do sleep 1; done'
      
      - name: Run Playwright tests
        run: cd ui && npx playwright test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: ui/playwright-report/
```

**Note:** For CI, modify `playwright.config.ts` to launch browser instead of connecting:
```typescript
// Remove connectOptions in CI
use: {
  ...(process.env.CI ? {} : {
    connectOptions: {
      wsEndpoint: 'ws://127.0.0.1:9222',
    },
  }),
}
```

## 📖 Resources

- [Playwright Documentation](https://playwright.dev/)
- [USER_MANUAL.md](../USER_MANUAL.md) - Feature documentation
- [README.md](../README.md) - Project setup
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## 🤝 Contributing

When adding new features:

1. Update USER_MANUAL.md with feature documentation
2. Write corresponding E2E tests based on manual workflows
3. Add test coverage to appropriate spec file
4. Update this README if needed
5. Ensure all tests pass before committing

---

**Happy Testing! 🎭**
