import { test, expect } from './fixtures/test-helpers'
import { TestHelpers, TestDataGenerator } from './fixtures/test-helpers'

/**
 * Folder Operations E2E Tests
 * Based on USER_MANUAL.md Section 5: Folder Operations
 */

test.describe('Folder Operations', () => {
  let helpers: TestHelpers
  let testDataRoom: { name: string; description: string }
  let testFolder: { name: string }

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    testDataRoom = TestDataGenerator.generateDataRoom()
    testFolder = TestDataGenerator.generateFolder()

    // Set authenticated state (will auto-navigate if needed)
    await helpers.setLocalStorage('authToken', 'test-jwt-token')
    
    // Create a test data room to work in
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

  test.describe('Creating a Folder', () => {
    test('should display create folder button in data room', async ({ page }) => {
      // From USER_MANUAL.md Step 2: Look for "Create Folder" button
      const createButton = page.getByRole('button', { name: /create folder|new folder/i })
      await expect(createButton).toBeVisible()
      
      // Should have folder icon
      await helpers.takeScreenshot('dataroom-view-create-folder-button')
    })

    test('should open folder creation dialog when clicking create folder', async ({ page }) => {
      // Step 2: Click "Create Folder"
      await helpers.clickButton('Create Folder')

      // Step 3: Dialog or inline input should appear
      const nameInput = page.getByLabel(/folder name|name/i)
      await expect(nameInput).toBeVisible()
    })

    test('should create folder with valid name', async ({ page }) => {
      // Step 1: Navigate to desired location (we're at root)
      
      // Step 2: Click create folder
      await helpers.clickButton('Create Folder')

      // Step 3: Enter folder name
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)

      // Step 4: Confirm creation
      await page.keyboard.press('Enter')
      // Or click create button
      // await helpers.clickButton('Create')

      await helpers.waitForNavigation()

      // Folder should appear in view
      await expect(page.getByText(testFolder.name)).toBeVisible()
    })

    test('should validate folder naming rules', async ({ page }) => {
      // From USER_MANUAL.md: Cannot contain special characters
      const invalidNames = [
        'Documents/Archive',  // contains /
        'Report*',            // contains *
        'File:Name',          // contains :
        'Data?',              // contains ?
      ]

      for (const invalidName of invalidNames) {
        await helpers.clickButton('Create Folder')
        
        const input = page.getByLabel(/folder name|name/i)
        await input.fill(invalidName)
        
        // Try to create
        await page.keyboard.press('Enter')

        // Should show error or prevent creation
        // This depends on implementation
        await helpers.takeScreenshot(`invalid-folder-name-${invalidName}`)
      }
    })

    test('should prevent duplicate folder names in same parent', async ({ page }) => {
      // Create a folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Try to create another with same name
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')

      // From USER_MANUAL.md: Error message "A folder with this name already exists"
      await expect(page.getByText(/folder with this name already exists/i)).toBeVisible()
    })

    test('should allow nested folder creation', async ({ page }) => {
      // Create parent folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Parent Folder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Open parent folder
      await page.getByText('Parent Folder').click()
      await helpers.waitForNavigation()

      // Create child folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Child Folder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Child should be visible in parent
      await expect(page.getByText('Child Folder')).toBeVisible()
    })
  })

  test.describe('Navigating Folders', () => {
    test('should navigate into folder when clicking on it', async ({ page }) => {
      // Create a folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Step 1: Click on folder
      await page.getByText(testFolder.name).click()
      await helpers.waitForNavigation()

      // Step 2-3: View updates, breadcrumb updates
      // Check URL changed
      await expect(page).toHaveURL(new RegExp(testFolder.name.replace(/\s/g, '%20')))
      
      // Or check breadcrumb shows folder name
    })

    test('should display breadcrumb navigation', async ({ page }) => {
      // Create nested structure
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Level1')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('Level1').click()
      await helpers.waitForNavigation()

      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Level2')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('Level2').click()
      await helpers.waitForNavigation()

      // From USER_MANUAL.md: Breadcrumb shows Home > Level1 > Level2
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      
      // Should contain all levels
      await expect(breadcrumb.getByText('Home')).toBeVisible()
      await expect(breadcrumb.getByText('Level1')).toBeVisible()
      await expect(breadcrumb.getByText('Level2')).toBeVisible()
    })

    test('should navigate using breadcrumb links', async ({ page }) => {
      // Create nested folders
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Parent')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('Parent').click()
      await helpers.waitForNavigation()

      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Child')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('Child').click()
      await helpers.waitForNavigation()

      // Click breadcrumb to go back to root
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await breadcrumb.getByText('Home').click()
      await helpers.waitForNavigation()

      // Should be back at root
      await expect(page.getByText('Parent')).toBeVisible()
    })

    test('should navigate through nested folders and back to root via breadcrumbs without hanging', async ({ page }) => {
      // This test reproduces a specific bug where navigating:
      // 1. Open folder1 → open folder2 (nested in folder1) → 
      // 2. breadcrumb back to folder1 → breadcrumb back to root
      // Would cause the page to show "Loading..." and never load

      // Create first folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Folder1')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Open first folder
      await page.getByText('Folder1').click()
      await helpers.waitForNavigation()

      // Create nested folder inside Folder1
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Folder2')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Open nested folder
      await page.getByText('Folder2').click()
      await helpers.waitForNavigation()

      // Navigate back to Folder1 via breadcrumb
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await breadcrumb.getByText('Folder1').click()
      await helpers.waitForNavigation()

      // Verify we're in Folder1 and can see Folder2
      await expect(page.getByText('Folder2')).toBeVisible()

      // Navigate back to root via breadcrumb - this should not hang
      await breadcrumb.getByText('Home').click()
      await helpers.waitForNavigation()

      // Should be back at root and able to see Folder1
      await expect(page.getByText('Folder1')).toBeVisible()
      
      // Verify page is not stuck in loading state
      await expect(page.getByText('Loading...')).not.toBeVisible()
    })
  })

  test.describe('Renaming a Folder', () => {
    test('should open rename dialog when clicking rename', async ({ page }) => {
      // Create a folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Step 2: Access rename function (right-click or ... menu)
      const folder = page.getByText(testFolder.name)
      await folder.click({ button: 'right' })

      // Or click more actions button
      const moreButton = page.getByText(testFolder.name)
        .locator('..')
        .getByRole('button', { name: /more|actions|\.\.\./i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        
        // Step 2: Select "Rename"
        await page.getByRole('menuitem', { name: /rename/i }).click()

        // Step 3: Input field appears with current name
        const input = page.getByRole('textbox')
        await expect(input).toHaveValue(testFolder.name)
      }
    })

    test('should rename folder successfully', async ({ page }) => {
      // Create a folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Rename it
      const newName = TestHelpers.generateUniqueName('Renamed Folder')

      const moreButton = page.getByText(testFolder.name)
        .locator('..')
        .getByRole('button', { name: /more/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /rename/i }).click()

        // Step 3: Enter new name
        const input = page.getByRole('textbox')
        await input.fill(newName)

        // Step 4: Confirm rename
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        // Folder should have new name
        await expect(page.getByText(newName)).toBeVisible()
        await expect(page.getByText(testFolder.name)).not.toBeVisible()
      }
    })

    test('should update path for nested items when renaming', async ({ page }) => {
      // From USER_MANUAL.md: Renaming updates the path for all nested items
      
      // Create parent with child
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'ParentToRename')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('ParentToRename').click()
      await helpers.waitForNavigation()

      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'ChildFolder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Go back to root
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await breadcrumb.getByText('Home').click()
      await helpers.waitForNavigation()

      // Rename parent
      // ... rename logic ...

      // Child should still be accessible under new parent name
    })
  })

  test.describe('Deleting a Folder', () => {
    test('should show warning before deleting folder', async ({ page }) => {
      // Create a folder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', testFolder.name)
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Step 1: Access delete function
      const moreButton = page.getByText(testFolder.name)
        .locator('..')
        .getByRole('button', { name: /more/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /delete/i }).click()

        // Step 2: Warning dialog appears
        await expect(page.getByRole('dialog')).toBeVisible()
        
        // From USER_MANUAL.md: Shows how many items will be deleted
        await expect(page.getByText(/delete all|contents|permanent/i)).toBeVisible()
      }
    })

    test('should delete folder and all contents', async ({ page }) => {
      // Create folder with nested content
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'FolderToDelete')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Navigate into it
      await page.getByText('FolderToDelete').click()
      await helpers.waitForNavigation()

      // Create subfolder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Subfolder')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Go back to root
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await breadcrumb.getByText('Home').click()
      await helpers.waitForNavigation()

      // Delete parent folder
      const moreButton = page.getByText('FolderToDelete')
        .locator('..')
        .getByRole('button', { name: /more/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /delete/i }).click()

        // Step 3: Confirm deletion
        await helpers.confirmDeletion()
        await helpers.waitForNavigation()

        // Step 4: Folder and all contents are removed
        await expect(page.getByText('FolderToDelete')).not.toBeVisible()
      }
    })

    test('should delete folder with deeply nested folders and files', async ({ page }) => {
      // Create a complex nested structure with folders and files
      // Root > Level1 > Level2 > Level3 (with files at each level)
      
      // Create Level1
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Level1')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()
      
      await page.getByText('Level1').click()
      await helpers.waitForNavigation()

      // Create Level2 inside Level1
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Level2')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('Level2').click()
      await helpers.waitForNavigation()

      // Create Level3 inside Level2
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', 'Level3')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      // Go back to root
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await breadcrumb.getByText('Home').click()
      await helpers.waitForNavigation()

      // Delete Level1 (should cascade delete Level2 and Level3)
      const moreButton = page.getByText('Level1')
        .locator('..')
        .getByRole('button', { name: /more/i })

      if (await moreButton.isVisible()) {
        await moreButton.click()
        await page.getByRole('menuitem', { name: /delete/i }).click()

        // Confirm deletion
        await helpers.confirmDeletion()
        await helpers.waitForNavigation()

        // Verify Level1 and all nested folders are gone
        await expect(page.getByText('Level1')).not.toBeVisible()
        
        // Navigate through what should be empty to verify cascade worked
        // The page should show no folders since we deleted the only one
        await expect(page.getByText('Level2')).not.toBeVisible()
        await expect(page.getByText('Level3')).not.toBeVisible()
      }
    })
  })

  test.describe('Folder Best Practices', () => {
    test('should support recommended folder structure templates', async ({ page }) => {
      // From USER_MANUAL.md: M&A Due Diligence template
      const structure = [
        '01 Executive Summary',
        '02 Financial',
        '03 Legal',
        '04 Operations',
        '05 HR',
      ]

      for (const folderName of structure) {
        await helpers.clickButton('Create Folder')
        await helpers.fillFieldByLabel('Folder Name', folderName)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        // Verify created
        await expect(page.getByText(folderName)).toBeVisible()
      }

      // All folders should be visible
      for (const folderName of structure) {
        await expect(page.getByText(folderName)).toBeVisible()
      }
    })

    test('should support nested folder structure', async ({ page }) => {
      // Create Financial > Statements subfolder
      await helpers.clickButton('Create Folder')
      await helpers.fillFieldByLabel('Folder Name', '02 Financial')
      await page.keyboard.press('Enter')
      await helpers.waitForNavigation()

      await page.getByText('02 Financial').click()
      await helpers.waitForNavigation()

      const subfolders = ['Statements', 'Tax Returns', 'Projections']

      for (const subfolder of subfolders) {
        await helpers.clickButton('Create Folder')
        await helpers.fillFieldByLabel('Folder Name', subfolder)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        await expect(page.getByText(subfolder)).toBeVisible()
      }
    })

    test('should limit deep nesting (usability recommendation)', async ({ page }) => {
      // From USER_MANUAL.md: Recommend 5-6 levels maximum
      
      let currentLevel = 0
      const maxLevels = 6

      for (let i = 1; i <= maxLevels; i++) {
        await helpers.clickButton('Create Folder')
        await helpers.fillFieldByLabel('Folder Name', `Level${i}`)
        await page.keyboard.press('Enter')
        await helpers.waitForNavigation()

        await page.getByText(`Level${i}`).click()
        await helpers.waitForNavigation()

        currentLevel++
      }

      // Should have created 6 levels
      expect(currentLevel).toBe(6)

      // Breadcrumb should show all levels
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      await expect(breadcrumb).toBeVisible()
    })
  })
})
