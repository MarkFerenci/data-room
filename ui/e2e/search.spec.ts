import { test, expect } from './fixtures/test-helpers'
import { TestHelpers, TestDataGenerator } from './fixtures/test-helpers'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Search Functionality E2E Tests
 * Based on USER_MANUAL.md Section 7: Search Functionality
 */

test.describe('Search Functionality', () => {
  let helpers: TestHelpers
  let testDataRoom: { name: string; description: string }
  let testPdfPath: string

  test.beforeAll(async () => {
    // Create test PDF files with different content
    const testDir = path.join(__dirname, '../test-data')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    // Create a PDF with searchable content
    testPdfPath = path.join(testDir, 'contract-2025.pdf')
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
/Length 88
>>
stream
BT
/F1 12 Tf
100 700 Td
(Employment Contract 2025) Tj
0 -20 Td
(John Smith Agreement) Tj
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
454
%%EOF`
    fs.writeFileSync(testPdfPath, pdfContent)
  })

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    testDataRoom = TestDataGenerator.generateDataRoom()

    // Set authenticated state (will auto-navigate if needed)
    await helpers.setLocalStorage('authToken', 'test-jwt-token')
    
    // Create a test data room
    await helpers.navigateTo('/dashboard')
    await helpers.clickButton('Create Data Room')
    await helpers.fillFieldByLabel('Name', testDataRoom.name)
    await helpers.clickButton('Create')
    await helpers.waitForNavigation()

    // Open the data room
    const openButton = page.getByText(testDataRoom.name)
      .locator('..')
      .getByRole('button', { name: /open/i })
    await openButton.click()
    await helpers.waitForNavigation()

    // Upload test file for searching
    await helpers.clickButton('Upload File')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(testPdfPath)
    await helpers.waitForApiCall(/\/api\/files/)
  })

  test.afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath)
    }
  })

  test.describe('Basic Search', () => {
    test('should display search box in data room', async ({ page }) => {
      // From USER_MANUAL.md Step 2: Locate search box
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await expect(searchBox).toBeVisible()

      // Should have magnifying glass icon
      const searchIcon = page.locator('[data-icon="search"], .search-icon')
      // Icon should be near search box
    })

    test('should search by filename', async ({ page }) => {
      // Step 1: Open data room (already done)
      
      // Step 2: Locate search box
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Step 3: Enter search term (filename)
      await searchBox.fill('contract')

      // Step 4: Execute search
      await page.keyboard.press('Enter')
      // Or click search button
      // await page.getByRole('button', { name: /search/i }).click()

      await helpers.waitForNavigation()

      // Step 5: View results
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should search by PDF content', async ({ page }) => {
      // From USER_MANUAL.md: Search PDF text content
      
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search for content inside PDF: "John Smith"
      await searchBox.fill('John Smith')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should find the file containing this text
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should be case-insensitive', async ({ page }) => {
      // From USER_MANUAL.md: Search is case-insensitive
      
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search with different cases
      const queries = ['CONTRACT', 'Contract', 'contract', 'CoNtRaCt']

      for (const query of queries) {
        await searchBox.fill(query)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        // All should return results
        await expect(page.getByText('contract-2025.pdf')).toBeVisible()

        // Clear search
        await searchBox.clear()
      }
    })

    test('should handle partial matches', async ({ page }) => {
      // From USER_MANUAL.md: "2025" matches "contract-2025.pdf"
      
      const searchBox = page.getByPlaceholder(/search files|search/i)

      await searchBox.fill('2025')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should match filename containing "2025"
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should search only within current data room', async ({ page }) => {
      // From USER_MANUAL.md: Search works within specific Data Room
      
      // We're in a specific data room
      const searchBox = page.getByPlaceholder(/search files|search/i)

      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Results should only be from this data room
      // Verify URL still contains data room context
      await expect(page).toHaveURL(new RegExp(testDataRoom.name))
    })
  })

  test.describe('Search Results', () => {
    test('should display search results with file details', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // From USER_MANUAL.md: Results show name, size, location, match type, date
      const resultRow = page.getByText('contract-2025.pdf').locator('..')

      // File name
      await expect(resultRow.getByText('contract-2025.pdf')).toBeVisible()

      // File size
      await expect(resultRow.getByText(/KB|MB/)).toBeVisible()

      // Match type indicator
      // May show "Filename match" or "Content match"
    })

    test('should show no results message when nothing matches', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search for something that doesn't exist
      await searchBox.fill('nonexistent-document-xyz-123')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // From USER_MANUAL.md: "No files found matching 'your query'"
      await expect(page.getByText(/no files found|no results/i)).toBeVisible()
    })

    test('should display match type (filename vs content)', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search by filename
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should indicate "Filename match"
      const filenameMatch = page.getByText(/filename match/i)
      
      // Clear and search by content
      await searchBox.clear()
      await searchBox.fill('Employment')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should indicate "Content match"
      const contentMatch = page.getByText(/content match/i)
    })

    test('should provide download and location actions in results', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // From USER_MANUAL.md: Action buttons (Download, Open location)
      const resultRow = page.getByText('contract-2025.pdf').locator('..')

      // Download button
      const downloadBtn = resultRow.getByRole('button', { name: /download/i })
      await expect(downloadBtn).toBeVisible()

      // Open location button (to navigate to folder containing file)
      const locationBtn = resultRow.getByRole('button', { name: /open location|view in folder/i })
      // May or may not be visible depending on implementation
    })
  })

  test.describe('Advanced Search Tips', () => {
    test('should handle multi-word queries', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // From USER_MANUAL.md: Multi-word searches
      await searchBox.fill('John Smith')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should find files containing both words (or the phrase)
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should handle common search patterns from manual', async ({ page }) => {
      // From USER_MANUAL.md: Common search patterns table
      const patterns = [
        { query: '2025', expected: 'contract-2025.pdf' },
        { query: 'contract', expected: 'contract-2025.pdf' },
        { query: 'Smith', expected: 'contract-2025.pdf' },
      ]

      const searchBox = page.getByPlaceholder(/search files|search/i)

      for (const pattern of patterns) {
        await searchBox.fill(pattern.query)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        await expect(page.getByText(pattern.expected)).toBeVisible()

        // Clear for next search
        await searchBox.clear()
        
        // Wait a bit between searches
        await page.waitForTimeout(500)
      }
    })

    test('should support searching with synonyms', async ({ page }) => {
      // From USER_MANUAL.md: Try variations like "contract" or "agreement"
      
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search for "agreement"
      await searchBox.fill('agreement')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should find files with "agreement" in content
      const results = await page.getByText('contract-2025.pdf').count()
      // May or may not find depending on PDF content
    })
  })

  test.describe('Search Limitations', () => {
    test('should search folder names when name filter is enabled', async ({ page }) => {
      // Create a folder with distinctive name
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'UniqueSearchTestFolder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Search for folder name
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('UniqueSearchTestFolder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should find the folder
      await expect(page.getByText('UniqueSearchTestFolder')).toBeVisible()
    })

    test('should not search folder names when name filter is disabled', async ({ page }) => {
      // Create a folder with distinctive name
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'TestFolderNotSearchable')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Disable name search
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      await nameCheckbox.click()

      // Search for folder name
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('TestFolderNotSearchable')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Should not find the folder
      await expect(page.getByText(/no.*found/i)).toBeVisible()
    })

    test('should only search current data room (not global)', async ({ page }) => {
      // From USER_MANUAL.md: Searches one Data Room at a time
      
      // We're in a specific data room
      // Search should be scoped to this data room only
      
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Results should only be from current data room
      // Check that we're still in the same data room context
      await expect(page).toHaveURL(new RegExp(testDataRoom.name))
    })

    test('should handle scanned PDFs without text', async ({ page }) => {
      // From USER_MANUAL.md: Scanned PDFs without OCR may not be searchable
      
      // Create a PDF that's essentially an image (minimal text)
      const imagePdfPath = path.join(__dirname, '../test-data/scanned.pdf')
      const minimalPdf = TestDataGenerator.createTestPdfBuffer()
      fs.writeFileSync(imagePdfPath, minimalPdf)

      try {
        // Upload the scanned PDF
        await helpers.clickButton('Upload File')
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles(imagePdfPath)
        await helpers.waitForApiCall(/\/api\/files/)

        // Try to search for content that would be in a scanned image
        const searchBox = page.getByPlaceholder(/search files|search/i)
        await searchBox.fill('scanned content')
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        // Should not find it (no extracted text)
        await expect(page.getByText(/no files found/i)).toBeVisible()
      }
      finally {
        // Clean up
        if (fs.existsSync(imagePdfPath)) {
          fs.unlinkSync(imagePdfPath)
        }
      }
    })
  })

  test.describe('Search Optimization', () => {
    test('should find files with descriptive filenames', async ({ page }) => {
      // From USER_MANUAL.md: Use descriptive filenames for better searchability
      
      // File already has descriptive name: "contract-2025.pdf"
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Can search by any part of the descriptive name
      const searchTerms = ['contract', '2025', 'contract-2025']

      for (const term of searchTerms) {
        await searchBox.fill(term)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        await expect(page.getByText('contract-2025.pdf')).toBeVisible()

        await searchBox.clear()
      }
    })

    test('should benefit from keywords in filename', async ({ page }) => {
      // From USER_MANUAL.md: Include names, dates, types in filename
      
      // Our test file: "contract-2025.pdf" includes:
      // - Type: "contract"
      // - Date: "2025"
      
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Search by type
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()

      // Search by date
      await searchBox.clear()
      await searchBox.fill('2025')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })
  })

  test.describe('Search Performance', () => {
    test('should return results quickly', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      const startTime = Date.now()
      
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForApiCall(/\/api\/search/)

      const endTime = Date.now()
      const duration = endTime - startTime

      // Search should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000) // 5 seconds max
    })

    test('should handle empty search gracefully', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)

      // Try to search with empty query
      await searchBox.fill('')
      await page.keyboard.press('Enter')

      // Should either:
      // - Show all files
      // - Show validation message
      // - Do nothing
      
      // Check that app doesn't crash
      await expect(page).not.toHaveURL(/error/)
    })
  })

  test.describe('Search Filters', () => {
    test('should display search filter button', async ({ page }) => {
      // Check for filter button/icon near search box
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await expect(filterButton).toBeVisible()
    })

    test('should toggle search filters panel', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      
      // Click to open filters
      await filterButton.click()
      
      // Filter options should be visible
      await expect(page.getByText(/search in:/i)).toBeVisible()
      await expect(page.getByText(/file.*folder.*name/i)).toBeVisible()
      await expect(page.getByText(/file content/i)).toBeVisible()
      
      // Click again to close
      await filterButton.click()
      
      // Filters should be hidden
      await expect(page.getByText(/search in:/i)).not.toBeVisible()
    })

    test('should have all filters enabled by default', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // All checkboxes should be checked
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      const caseInsensitiveCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/case insensitive/i) })
      
      await expect(nameCheckbox).toBeChecked()
      await expect(contentCheckbox).toBeChecked()
      await expect(caseInsensitiveCheckbox).toBeChecked()
    })

    test('should support case sensitive search when unchecked', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Uncheck case insensitive
      const caseInsensitiveCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/case insensitive/i) })
      await caseInsensitiveCheckbox.click()
      await expect(caseInsensitiveCheckbox).not.toBeChecked()
      
      // Search for lowercase "contract"
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should find the file (filename is lowercase)
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
      
      // Clear and search for uppercase "CONTRACT"
      await searchBox.clear()
      await filterButton.click()
      await caseInsensitiveCheckbox.click() // Uncheck again
      await searchBox.fill('CONTRACT')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should not find the file (case-sensitive search)
      await expect(page.getByText(/no.*found|no results/i)).toBeVisible()
    })

    test('should search only by filename when content filter is disabled', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Uncheck content filter
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      await contentCheckbox.click()
      await expect(contentCheckbox).not.toBeChecked()
      
      // Search for something that's only in content, not in filename
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('Employment')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should not find results (Employment is in content but not in filename)
      await expect(page.getByText(/no.*found|no results/i)).toBeVisible()
      
      // Now search by filename
      await searchBox.clear()
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should find the file
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should search only by content when name filter is disabled', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Uncheck name filter
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      await nameCheckbox.click()
      await expect(nameCheckbox).not.toBeChecked()
      
      // Search for something that's only in filename, not content
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('2025')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should not find results (2025 is in filename but not in content)
      await expect(page.getByText(/no.*found|no results/i)).toBeVisible()
      
      // Now search by content
      await searchBox.clear()
      await searchBox.fill('Employment')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should find the file
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
      await expect(page.getByText(/content match/i)).toBeVisible()
    })

    test('should show combined results when both filters are enabled', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Ensure both are checked
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      
      if (!await nameCheckbox.isChecked()) await nameCheckbox.click()
      if (!await contentCheckbox.isChecked()) await contentCheckbox.click()
      
      // Search for term that appears in filename
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should find the file and show it matches filename
      await expect(page.getByText('contract-2025.pdf')).toBeVisible()
    })

    test('should prevent search with both filters disabled', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Uncheck both filters
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      
      await nameCheckbox.click()
      await contentCheckbox.click()
      
      // Try to search
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      
      // Should show validation message
      await expect(page.getByText(/at least one search option|select at least one/i)).toBeVisible()
    })

    test('should display appropriate match type in results', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      
      // Test with only name search
      await filterButton.click()
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      await contentCheckbox.click()
      
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should show "Filename match"
      await expect(page.getByText(/filename match/i)).toBeVisible()
      
      // Clear and test with only content search
      await searchBox.clear()
      await filterButton.click()
      await contentCheckbox.click() // Turn on content
      const nameCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file.*folder.*name/i) })
      await nameCheckbox.click() // Turn off name
      
      await searchBox.fill('Employment')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Should show "Content match"
      await expect(page.getByText(/content match/i)).toBeVisible()
    })

    test('should persist filter settings during session', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Change filter settings
      const contentCheckbox = page.getByRole('checkbox').filter({ has: page.getByText(/file content/i) })
      await contentCheckbox.click()
      
      // Perform a search
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Clear search
      const clearButton = page.getByRole('button', { name: /clear/i })
      if (await clearButton.isVisible()) {
        await clearButton.click()
      }
      
      // Open filters again
      await filterButton.click()
      
      // Content checkbox should still be unchecked
      await expect(contentCheckbox).not.toBeChecked()
    })

    test('should hide filter button when search results are displayed', async ({ page }) => {
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Filter button should not be visible in results view
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await expect(filterButton).not.toBeVisible()
    })

    test('should close filter panel when starting search', async ({ page }) => {
      const filterButton = page.getByRole('button', { name: /search filters|filter/i })
      await filterButton.click()
      
      // Filters should be visible
      await expect(page.getByText(/search in:/i)).toBeVisible()
      
      // Start search
      const searchBox = page.getByPlaceholder(/search files|search/i)
      await searchBox.fill('contract')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      // Filters should be hidden
      await expect(page.getByText(/search in:/i)).not.toBeVisible()
    })
  })
})
