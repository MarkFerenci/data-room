import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration for Data Room Application
 * 
 * This configuration supports two modes:
 * 1. Remote Browser Mode (default): Uses connectOverCDP to connect to Chrome on port 9222
 *    - Best for regular test runs (npm run test:e2e)
 *    - Requires: ./start-test-browser.sh to be running
 *    - Connects via CDP and reuses existing browser context
 * 
 * 2. UI Mode: Uses Playwright's built-in Chromium
 *    - Best for interactive debugging (npm run test:e2e:ui)
 *    - Requires: npx playwright install chromium (one-time setup)
 *    - Set USE_REMOTE_BROWSER=false to skip remote connection
 * 
 * To start the browser for remote mode:
 * cd ui && ./start-test-browser.sh
 * 
 * Note: Browser connection is now handled in e2e/fixtures/test-helpers.ts
 * using chromium.connectOverCDP() for better compatibility
 */

// Determine if we should use remote browser or local Playwright browser
const useRemoteBrowser = process.env.USE_REMOTE_BROWSER !== 'false'

export default defineConfig({
  // Directory containing test files
  testDir: './e2e',
  
  // Run tests in files in parallel
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:5000',
    
    // Collect trace on first retry
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Browser connection is now handled in test fixtures via connectOverCDP
  },

  // Configure projects for major browsers
  projects: [
    {
      name: useRemoteBrowser ? 'chromium-remote-cdp' : 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Browser connection handled in test fixtures
      },
    },
  ],

  // Run your local dev server before starting the tests
  // Uncomment if you want Playwright to start the servers
  // webServer: [
  //   {
  //     command: 'cd ../backend && uv run python app.py',
  //     url: 'http://localhost:5001/api/auth/login',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  //   {
  //     command: 'npm run dev',
  //     url: 'http://localhost:5000',
  //     timeout: 120 * 1000,
  //     reuseExistingServer: !process.env.CI,
  //   },
  // ],
})
