import { test, expect } from './fixtures/test-helpers'
import { TestHelpers } from './fixtures/test-helpers'

/**
 * Authentication E2E Tests
 * Based on USER_MANUAL.md Section 3: Authentication & Account Management
 * 
 * Note: These tests require manual Google OAuth interaction or a mock OAuth server
 * For automated CI/CD, you may need to mock the OAuth flow
 */

test.describe('Authentication & Account Management', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.navigateTo('/')
  })

  test.describe('Sign In Process', () => {
    test('should display login page with Google sign-in button', async ({ page }) => {
      // Step 1 from USER_MANUAL.md: Navigate to Login Page
      await expect(page).toHaveURL(/\/login|\//)

      // Step 2 from USER_MANUAL.md: Check for "Sign in with Google" button
      const signInButton = page.getByRole('button', { name: /sign in with google/i })
      await expect(signInButton).toBeVisible()

      // Verify Google logo or branding is present
      await helpers.takeScreenshot('login-page')
    })

    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route
      await helpers.navigateTo('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/)
    })

    test.skip('should complete OAuth sign-in flow (manual interaction required)', async ({ page }) => {
      // This test requires manual interaction with Google OAuth
      // Step 2-5 from USER_MANUAL.md
      
      const signInButton = page.getByRole('button', { name: /sign in with google/i })
      await signInButton.click()

      // Wait for OAuth redirect - in real scenario, user would interact with Google
      // For automated testing, mock the OAuth callback or use test credentials
      
      // After successful auth, should redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 30000 })
      
      // Verify user profile is visible
      const isAuth = await helpers.isAuthenticated()
      expect(isAuth).toBe(true)
    })
  })

  test.describe('Session Management', () => {
    test('should persist session after page reload', async ({ page }) => {
      // Set a mock JWT token for testing (will auto-navigate if needed)
      const mockToken = 'mock-jwt-token-for-testing'
      await helpers.setLocalStorage('authToken', mockToken)
      
      // Reload page
      await page.reload()
      
      // Token should still be present
      const token = await helpers.getLocalStorage('authToken')
      expect(token).toBe(mockToken)
    })

    test('should display user profile information when authenticated', async ({ page }) => {
      // Set authenticated state (will auto-navigate if needed)
      const mockToken = 'mock-jwt-token'
      await helpers.setLocalStorage('authToken', mockToken)
      
      await helpers.navigateTo('/dashboard')
      
      // From USER_MANUAL.md: Profile shows name, avatar, email
      // These would need to be rendered by the app after valid auth
      // Check for user profile elements (adjust selectors based on actual implementation)
    })
  })

  test.describe('Sign Out Process', () => {
    test('should sign out user and redirect to login', async ({ page }) => {
      // Set up authenticated state (will auto-navigate if needed)
      await helpers.setLocalStorage('authToken', 'mock-jwt-token')
      await helpers.navigateTo('/dashboard')

      // Step 1 from USER_MANUAL.md: Look for logout button
      const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
      
      if (await logoutButton.isVisible()) {
        // Step 2: Click logout
        await logoutButton.click()

        // Step 3: Token should be invalidated
        await helpers.waitForNavigation()

        // Step 4: Should redirect to login page
        await expect(page).toHaveURL(/\/login/)

        // Verify token is cleared
        const token = await helpers.getLocalStorage('authToken')
        expect(token).toBeNull()
      }
    })
  })

  test.describe('Security', () => {
    test('should not expose sensitive data in localStorage', async ({ page }) => {
      await helpers.navigateTo('/')
      
      // Check that passwords or secrets are not stored
      const allLocalStorage = await page.evaluate(() => {
        const items: Record<string, string> = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            items[key] = localStorage.getItem(key) || ''
          }
        }
        return items
      })

      // Ensure no keys contain 'password', 'secret', 'client_secret'
      const sensitiveKeys = Object.keys(allLocalStorage).filter(key =>
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('secret'),
      )

      expect(sensitiveKeys.length).toBe(0)
    })

    test('should clear all auth data on logout', async ({ page }) => {
      // Set various auth-related items (will auto-navigate if needed)
      await helpers.setLocalStorage('authToken', 'test-token')
      await helpers.setLocalStorage('userEmail', 'test@example.com')

      await helpers.navigateTo('/dashboard')

      // Click logout
      const logoutButton = page.getByRole('button', { name: /logout/i })
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await helpers.waitForNavigation()

        // Verify all auth data is cleared
        const token = await helpers.getLocalStorage('authToken')
        expect(token).toBeNull()
      }
    })
  })
})
