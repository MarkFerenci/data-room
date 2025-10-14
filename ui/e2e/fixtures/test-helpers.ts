import { test as base, Page, expect, chromium, Browser, BrowserContext } from '@playwright/test'

/**
 * Test helper utilities for Data Room E2E tests
 * Based on USER_MANUAL.md workflows and best practices
 */

/**
 * Custom fixtures for connecting to existing Chrome browser via CDP
 */
type CDPFixtures = {
  browser: Browser
  context: BrowserContext
  page: Page
}

export const test = base.extend<CDPFixtures>({
  browser: async ({}, use) => {
    const useRemoteBrowser = process.env.USE_REMOTE_BROWSER !== 'false'
    
    if (useRemoteBrowser) {
      // Connect to existing Chrome browser via CDP
      const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
      await use(browser)
      await browser.close()
    } else {
      // Use default Playwright browser
      const browser = await chromium.launch()
      await use(browser)
      await browser.close()
    }
  },

  context: async ({ browser }, use) => {
    const useRemoteBrowser = process.env.USE_REMOTE_BROWSER !== 'false'
    
    if (useRemoteBrowser) {
      // Get the default context from the connected browser
      const contexts = browser.contexts()
      const defaultContext = contexts.length > 0 ? contexts[0] : await browser.newContext()
      await use(defaultContext)
      // Don't close the default context - it's from the external browser
    } else {
      // Create a new isolated context for testing
      const context = await browser.newContext()
      await use(context)
      await context.close()
    }
  },

  page: async ({ context }, use) => {
    const useRemoteBrowser = process.env.USE_REMOTE_BROWSER !== 'false'
    
    if (useRemoteBrowser) {
      // Always create a new page/tab for each test (better isolation)
      const page = await context.newPage()
      await use(page)
      // Close the test page when done to keep browser clean
      await page.close()
    } else {
      // Create a fresh page for each test
      const page = await context.newPage()
      await use(page)
      await page.close()
    }
  },
})

export { expect } from '@playwright/test'

export class TestHelpers {
  constructor(public readonly page: Page) {}

  /**
   * Generate a unique test name with timestamp to avoid collisions
   */
  static generateUniqueName(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if user is authenticated by looking for logout button or user profile
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Wait briefly for auth elements to appear
      await this.page.waitForSelector('[data-testid="user-profile"], [data-testid="logout-button"], text=Logout', {
        timeout: 2000,
      })
      return true
    }
    catch {
      return false
    }
  }

  /**
   * Navigate to a specific route
   */
  async navigateTo(path: string) {
    // Ensure we use the full URL for the root path to avoid about:blank
    const url = path === '/' ? 'http://localhost:5000/' : path
    await this.page.goto(url)
    await this.waitForNavigation()
  }

  /**
   * Take a screenshot with a descriptive name
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    })
  }

  /**
   * Fill a form field by label
   */
  async fillFieldByLabel(label: string, value: string) {
    const field = this.page.getByLabel(label)
    await field.fill(value)
  }

  /**
   * Click a button by text or role
   */
  async clickButton(text: string) {
    await this.page.getByRole('button', { name: text }).click()
  }

  /**
   * Wait for a toast/notification message
   */
  async waitForToast(message?: string) {
    if (message) {
      await expect(this.page.getByText(message)).toBeVisible()
    }
    else {
      // Wait for any toast/notification
      await this.page.waitForSelector('[role="alert"], .toast, .notification', {
        timeout: 5000,
      })
    }
  }

  /**
   * Confirm a deletion dialog
   */
  async confirmDeletion() {
    // Look for confirmation dialog and confirm button
    await this.page.getByRole('button', { name: /delete|confirm/i }).click()
  }

  /**
   * Get count of items in a list
   */
  async getItemCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count()
  }

  /**
   * Check if an element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0
  }

  /**
   * Wait for an API call to complete
   */
  async waitForApiCall(urlPattern: string | RegExp) {
    await this.page.waitForResponse(urlPattern)
  }

  /**
   * Get localStorage item
   */
  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((k) => localStorage.getItem(k), key)
  }

  /**
   * Set localStorage item
   * Ensures page is loaded on a valid origin before accessing localStorage
   */
  async setLocalStorage(key: string, value: string) {
    // Ensure we're on a valid page (not about:blank)
    const url = this.page.url()
    if (!url || url === 'about:blank' || !url.startsWith('http')) {
      // Navigate to the app first
      await this.page.goto('http://localhost:5000/')
      await this.page.waitForLoadState('domcontentloaded')
    }
    
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value },
    )
  }

  /**
   * Clear localStorage
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear())
  }
}

/**
 * Test data generators
 */
export class TestDataGenerator {
  /**
   * Generate a test Data Room
   */
  static generateDataRoom() {
    return {
      name: TestHelpers.generateUniqueName('Test DataRoom'),
      description: 'E2E test data room created by Playwright automated tests',
    }
  }

  /**
   * Generate a test folder
   */
  static generateFolder() {
    return {
      name: TestHelpers.generateUniqueName('Test Folder'),
    }
  }

  /**
   * Generate test file metadata
   */
  static generateFileMetadata() {
    return {
      name: `test-document-${Date.now()}.pdf`,
      size: 1024 * 50, // 50KB
    }
  }

  /**
   * Create a simple test PDF file buffer
   */
  static createTestPdfBuffer(): Buffer {
    // Minimal valid PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`
    return Buffer.from(pdfContent, 'utf-8')
  }
}

/**
 * API helpers for direct backend interaction
 */
export class ApiHelpers {
  constructor(
    private readonly baseUrl: string = 'http://localhost:5001',
  ) {}

  /**
   * Make an authenticated API request
   */
  async authenticatedRequest(
    token: string,
    method: string,
    endpoint: string,
    body?: any,
  ) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      if (body instanceof FormData) {
        options.body = body
      }
      else {
        headers['Content-Type'] = 'application/json'
        options.body = JSON.stringify(body)
      }
    }

    const response = await fetch(url, options)
    return response
  }

  /**
   * Clean up test data via API
   */
  async cleanupDataRoom(token: string, dataroomId: number) {
    await this.authenticatedRequest(
      token,
      'DELETE',
      `/api/datarooms/${dataroomId}`,
    )
  }
}
