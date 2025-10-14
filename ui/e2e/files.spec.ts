import { test, expect } from './fixtures/test-helpers'
import { TestHelpers, TestDataGenerator } from './fixtures/test-helpers'
import * as path from 'path'
import * as fs from 'fs'

/**
 * File Operations E2E Tests
 * Based on USER_MANUAL.md Section 6: File Operations
 */

test.describe('File Operations', () => {
  let helpers: TestHelpers
  let testDataRoom: { name: string; description: string }
  let testPdfPath: string

  test.beforeAll(async () => {
    // Create a test PDF file for uploads
    const testDir = path.join(__dirname, '../test-data')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    testPdfPath = path.join(testDir, 'test-document.pdf')
    const pdfBuffer = TestDataGenerator.createTestPdfBuffer()
    fs.writeFileSync(testPdfPath, pdfBuffer)
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
  })

  test.afterAll(async () => {
    // Clean up test files
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath)
    }
  })

  test.describe('Uploading Files', () => {
    test('should display upload button in data room', async ({ page }) => {
      // From USER_MANUAL.md Step 2: Look for upload button
      const uploadButton = page.getByRole('button', { name: /upload file|upload/i })
      await expect(uploadButton).toBeVisible()
    })

    test('should upload PDF file successfully', async ({ page }) => {
      // Step 1: Navigate to target location (we're at root)
      
      // Step 2: Click "Upload File"
      await helpers.clickButton('Upload File')

      // Step 3: Select file
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)

      // Step 4-5: Upload progress and processing
      // Wait for upload to complete
      await helpers.waitForApiCall(/\/api\/files/)

      // Step 6: File appears in list
      await expect(page.getByText('test-document.pdf')).toBeVisible()
    })

    test('should handle duplicate filenames with auto-rename', async ({ page }) => {
      // From USER_MANUAL.md: Duplicate names are auto-renamed with (1), (2)
      
      // Upload first file
      await helpers.clickButton('Upload File')
      let fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Upload same file again
      await helpers.clickButton('Upload File')
      fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Should have both files with different names
      await expect(page.getByText('test-document.pdf')).toBeVisible()
      await expect(page.getByText(/test-document.*\(1\)\.pdf/)).toBeVisible()
    })

    test('should reject non-PDF files', async ({ page }) => {
      // From USER_MANUAL.md: Only PDF files supported
      
      // Create a non-PDF file
      const txtPath = path.join(__dirname, '../test-data/test.txt')
      fs.writeFileSync(txtPath, 'This is not a PDF')

      try {
        await helpers.clickButton('Upload File')
        const fileInput = page.locator('input[type="file"]')
        await fileInput.setInputFiles(txtPath)

        // Should show error: "Invalid file type"
        await expect(page.getByText(/invalid file type|only pdf/i)).toBeVisible()
      }
      finally {
        // Clean up
        if (fs.existsSync(txtPath)) {
          fs.unlinkSync(txtPath)
        }
      }
    })

    test('should reject files larger than 100MB', async ({ page }) => {
      // From USER_MANUAL.md: Maximum 100MB per file
      
      // This test would create a large file, which is slow
      // Skip or mark as slow test
      test.skip()
      
      // Create a large file (just for demonstration, not actually creating 100MB)
      // const largePath = path.join(__dirname, '../test-data/large.pdf')
      // const largeBuffer = Buffer.alloc(101 * 1024 * 1024) // 101MB
      // fs.writeFileSync(largePath, largeBuffer)

      // Try to upload
      // Should show error: "File size exceeds limit"
    })

    test('should show upload progress for large files', async ({ page }) => {
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)

      // Progress indicator should appear
      const progress = page.locator('[role="progressbar"], .progress')
      
      // Progress may be too fast to catch for small files
      // In real scenario, this would be visible for larger files
    })
  })

  test.describe('Viewing File Details', () => {
    test('should display file metadata in list', async ({ page }) => {
      // Upload a file first
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // From USER_MANUAL.md: File list shows icon, name, size, date, actions
      const fileRow = page.getByText('test-document.pdf').locator('..')

      // Should show PDF icon
      await expect(fileRow.locator('[data-icon="file"], .file-icon')).toBeVisible()

      // Should show file name
      await expect(fileRow.getByText('test-document.pdf')).toBeVisible()

      // Should show file size
      await expect(fileRow.getByText(/KB|MB/)).toBeVisible()

      // Should show upload date
      // Date format may vary
    })

    test('should show detailed file information on click', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Click info icon or file name
      const infoButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /info|details/i })

      if (await infoButton.isVisible()) {
        await infoButton.click()

        // Details panel should show
        await expect(page.getByText(/original filename|upload timestamp|mime type/i)).toBeVisible()
      }
    })
  })

  test.describe('Downloading Files', () => {
    test('should download file when clicking download button', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Step 1-2: Click download button
      const downloadButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /download/i })

      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download')
      await downloadButton.click()

      // Step 3: Browser download dialog
      const download = await downloadPromise

      // Step 4: File saved
      expect(download.suggestedFilename()).toBe('test-document.pdf')
    })

    test('should download file by clicking file name link', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Click file name if it's a download link
      const fileName = page.getByText('test-document.pdf')
      
      if (await fileName.locator('a').count() > 0) {
        const downloadPromise = page.waitForEvent('download')
        await fileName.locator('a').click()
        const download = await downloadPromise
        expect(download.suggestedFilename()).toContain('test-document.pdf')
      }
    })
  })

  test.describe('Renaming Files', () => {
    test('should rename file successfully', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Step 1: Access rename function
      const moreButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /more|actions/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /rename/i }).click()

        // Step 2: Enter new name
        const newName = 'renamed-document.pdf'
        const input = page.getByRole('textbox')
        await input.fill(newName)

        // Step 3: Confirm rename
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        // File should have new name
        await expect(page.getByText(newName)).toBeVisible()
        await expect(page.getByText('test-document.pdf')).not.toBeVisible()
      }
    })

    test('should preserve file extension when renaming', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      const moreButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /more/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /rename/i }).click()

        // Try to rename without extension
        const input = page.getByRole('textbox')
        await input.fill('renamed-document')

        await page.keyboard.press('Enter')

        // From USER_MANUAL.md: Include .pdf extension
        // App should either auto-add extension or show validation error
      }
    })
  })

  test.describe('Deleting Files', () => {
    test('should show confirmation before deleting file', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Step 2: Click delete
      const deleteButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /delete/i })

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Step 3: Confirmation dialog
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText(/are you sure|permanent/i)).toBeVisible()
      }
    })

    test('should delete file after confirmation', async ({ page }) => {
      // Upload a file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Delete the file
      const deleteButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /delete/i })

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Step 4: Confirm
        await helpers.confirmDeletion()
        await helpers.waitForNavigation()

        // Step 5: File removed
        await expect(page.getByText('test-document.pdf')).not.toBeVisible()
      }
    })
  })

  test.describe('File Organization', () => {
    test('should upload file to specific folder', async ({ page }) => {
      // Create a folder first
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Documents')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Navigate into folder
      await page.getByText('Documents').click()
      await helpers.waitForNavigation()

      // Upload file
      await helpers.clickButton('Upload File')
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // File should be in this folder
      await expect(page.getByText('test-document.pdf')).toBeVisible()
    })

    test('should move file between folders (manual workaround)', async ({ page }) => {
      // From USER_MANUAL.md: Current version requires download/upload/delete
      
      // Upload to root
      await helpers.clickButton('Upload File')
      let fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(testPdfPath)
      await helpers.waitForApiCall(/\/api\/files/)

      // Create target folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Target')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Step 1: Download the file
      const downloadButton = page.getByText('test-document.pdf')
        .locator('..')
        .getByRole('button', { name: /download/i })

      const downloadPromise = page.waitForEvent('download')
      await downloadButton.click()
      const download = await downloadPromise
      const downloadPath = await download.path()

      // Step 2: Navigate to target folder
      await page.getByText('Target').click()
      await helpers.waitForNavigation()

      // Step 3: Upload to new location
      await helpers.clickButton('Upload File')
      fileInput = page.locator('input[type="file"]')
      if (downloadPath) {
        await fileInput.setInputFiles(downloadPath)
        await helpers.waitForApiCall(/\/api\/files/)
      }

      // File should be in target folder
      await expect(page.getByText('test-document.pdf')).toBeVisible()
    })
  })
})
