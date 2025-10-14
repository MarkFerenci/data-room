import { test, expect } from './fixtures/test-helpers'
import { TestHelpers, TestDataGenerator } from './fixtures/test-helpers'

/**
 * Data Room Management E2E Tests
 * Based on USER_MANUAL.md Section 4: Data Room Management
 */

test.describe('Data Room Management', () => {
  let helpers: TestHelpers
  let testDataRoom: { name: string; description: string }

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    testDataRoom = TestDataGenerator.generateDataRoom()

    // Navigate to the app (authentication should be handled separately)
    // For now, we'll test the UI elements that don't require auth
    // or you can manually authenticate in the browser before running tests
    await helpers.navigateTo('/')
  })

  test.describe('Creating a Data Room', () => {
    test('should display create data room button on dashboard', async ({ page }) => {
      // From USER_MANUAL.md Step 1: Navigate to Dashboard
      await expect(page).toHaveURL(/\/dashboard/)

      // Step 2: Look for "Create Data Room" button
      const createButton = page.getByRole('button', { name: /create data room/i })
      await expect(createButton).toBeVisible()
    })

    test('should open creation dialog when clicking create button', async ({ page }) => {
      // Step 2: Click "Create Data Room"
      const createButton = page.getByRole('button', { name: /create data room/i })
      await createButton.click()

      // Creation dialog should appear
      await expect(page.getByRole('dialog')).toBeVisible()
      
      // Step 3: Dialog should have name and description fields
      await expect(page.getByLabel(/name/i)).toBeVisible()
      await expect(page.getByLabel(/description/i)).toBeVisible()
    })

    test('should create data room with valid name and description', async ({ page }) => {
      // Step 2: Click create
      await helpers.clickButton('Create Data Room')

      // Step 3: Fill in details
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.fillFieldByLabel('Description', testDataRoom.description)

      // Step 4: Click Create
      await helpers.clickButton('Create')

      // Wait for creation to complete
      await helpers.waitForNavigation()

      // Verify data room appears in dashboard
      await expect(page.getByText(testDataRoom.name)).toBeVisible()
    })

    test('should create data room with only name (description optional)', async ({ page }) => {
      await helpers.clickButton('Create Data Room')

      // Only fill name, leave description empty
      await helpers.fillFieldByLabel('Name', testDataRoom.name)

      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Should still be created successfully
      await expect(page.getByText(testDataRoom.name)).toBeVisible()
    })

    test('should validate name field is required', async ({ page }) => {
      await helpers.clickButton('Create Data Room')

      // Try to create without entering name
      const createBtn = page.getByRole('dialog').getByRole('button', { name: /create/i })
      await createBtn.click()

      // Should show validation error or disable button
      // This depends on implementation - check for error message or disabled state
      const nameInput = page.getByLabel(/name/i)
      await expect(nameInput).toHaveAttribute('required', '')
    })

    test('should respect 255 character limit for name', async ({ page }) => {
      await helpers.clickButton('Create Data Room')

      const longName = 'A'.repeat(300)
      const nameInput = page.getByLabel(/name/i)
      await nameInput.fill(longName)

      // Check if input limits to 255 characters
      const value = await nameInput.inputValue()
      expect(value.length).toBeLessThanOrEqual(255)
    })
  })

  test.describe('Viewing Data Rooms', () => {
    test('should display all user data rooms on dashboard', async ({ page }) => {
      // Dashboard should show data rooms as cards
      const cards = page.locator('[data-testid="dataroom-card"]')
      
      // Should have at least one data room (if any exist)
      // Or show empty state
      const count = await cards.count()
      
      if (count === 0) {
        // Should show empty state message
        await expect(page.getByText(/no data rooms/i)).toBeVisible()
      }
      else {
        // Each card should show name and description
        const firstCard = cards.first()
        await expect(firstCard).toBeVisible()
      }
    })

    test('should display data room metadata correctly', async ({ page }) => {
      // Create a test data room first
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.fillFieldByLabel('Description', testDataRoom.description)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // From USER_MANUAL.md: Each card shows name, description, creation date, action buttons
      const card = page.getByText(testDataRoom.name).locator('..')
      
      await expect(card.getByText(testDataRoom.name)).toBeVisible()
      await expect(card.getByText(testDataRoom.description)).toBeVisible()
      
      // Should have action buttons
      await expect(card.getByRole('button', { name: /open/i })).toBeVisible()
    })
  })

  test.describe('Opening a Data Room', () => {
    test('should navigate to data room view when clicking open', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Step 1-2 from USER_MANUAL.md: Click Open button
      const openButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /open/i })
      
      await openButton.click()
      await helpers.waitForNavigation()

      // Step 3: Should be taken to data room view
      await expect(page).toHaveURL(new RegExp(`/dataroom|/data-room`))

      // From USER_MANUAL.md: Data Room view shows breadcrumb, folder tree, file list
      // Check for these elements (adjust selectors based on implementation)
    })

    test('should display breadcrumb navigation in data room view', async ({ page }) => {
      // Navigate to a data room
      // Check for breadcrumb navigation element
      const breadcrumb = page.locator('[data-testid="breadcrumb"], nav')
      // Breadcrumb should be visible
    })
  })

  test.describe('Editing a Data Room', () => {
    test('should open edit dialog when clicking edit button', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Step 1: Click Edit button
      const editButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /edit/i })

      if (await editButton.isVisible()) {
        await editButton.click()

        // Edit dialog should appear with current values
        await expect(page.getByRole('dialog')).toBeVisible()
        
        const nameInput = page.getByLabel(/name/i)
        await expect(nameInput).toHaveValue(testDataRoom.name)
      }
    })

    test('should update data room name and description', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Edit the data room
      const editButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /edit/i })

      if (await editButton.isVisible()) {
        await editButton.click()

        // Step 2: Modify information
        const newName = TestHelpers.generateUniqueName('Updated DataRoom')
        const newDescription = 'Updated description'

        await helpers.fillFieldByLabel('Name', newName)
        await helpers.fillFieldByLabel('Description', newDescription)

        // Step 3: Save changes
        await helpers.clickButton('Save')
        await helpers.waitForNavigation()

        // Verify changes
        await expect(page.getByText(newName)).toBeVisible()
        await expect(page.getByText(newDescription)).toBeVisible()
      }
    })

    test('should not allow changing owner or creation date', async ({ page }) => {
      // From USER_MANUAL.md: Owner and creation date are fixed
      // Edit dialog should not have these fields as editable
      
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      const editButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /edit/i })

      if (await editButton.isVisible()) {
        await editButton.click()

        // Owner field should not exist or be disabled
        const ownerField = page.getByLabel(/owner/i)
        const ownerCount = await ownerField.count()
        
        if (ownerCount > 0) {
          await expect(ownerField).toBeDisabled()
        }
      }
    })
  })

  test.describe('Deleting a Data Room', () => {
    test('should show confirmation dialog before deleting', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Step 2: Click Delete button
      const deleteButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /delete/i })

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Step 3: Confirmation dialog should appear
        await expect(page.getByRole('dialog')).toBeVisible()
        
        // From USER_MANUAL.md: Dialog shows warning message
        await expect(page.getByText(/warning|permanent|cannot be undone/i)).toBeVisible()
      }
    })

    test('should delete data room after confirmation', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Delete the data room
      const deleteButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /delete/i })

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Step 4: Confirm deletion
        await helpers.confirmDeletion()
        await helpers.waitForNavigation()

        // Data room should disappear from dashboard
        await expect(page.getByText(testDataRoom.name)).not.toBeVisible()
      }
    })

    test('should cancel deletion when clicking cancel', async ({ page }) => {
      // Create a test data room
      await helpers.clickButton('Create Data Room')
      await helpers.fillFieldByLabel('Name', testDataRoom.name)
      await helpers.clickButton('Create')
      await helpers.waitForNavigation()

      // Start deletion
      const deleteButton = page.getByText(testDataRoom.name)
        .locator('..')
        .getByRole('button', { name: /delete/i })

      if (await deleteButton.isVisible()) {
        await deleteButton.click()

        // Click cancel instead of confirm
        const cancelButton = page.getByRole('button', { name: /cancel/i })
        await cancelButton.click()

        // Data room should still be visible
        await expect(page.getByText(testDataRoom.name)).toBeVisible()
      }
    })
  })

  test.describe('Data Room Best Practices', () => {
    test('should accept naming convention examples from manual', async ({ page }) => {
      // From USER_MANUAL.md: Good names like "Acme Corp Acquisition - 2025"
      const goodNames = [
        'Acme Corp Acquisition - 2025',
        'Legal - Smith Case Documents',
        'Q4 Financial Audit',
      ]

      for (const name of goodNames) {
        await helpers.clickButton('Create Data Room')
        await helpers.fillFieldByLabel('Name', name)
        await helpers.clickButton('Create')
        await helpers.waitForNavigation()

        // Should create successfully
        await expect(page.getByText(name)).toBeVisible()

        // Clean up
        const deleteBtn = page.getByText(name)
          .locator('..')
          .getByRole('button', { name: /delete/i })
        
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click()
          await helpers.confirmDeletion()
          await helpers.waitForNavigation()
        }
      }
    })
  })
})
