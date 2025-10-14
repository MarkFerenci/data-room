# Data Room - User Manual

**Version:** 1.0  
**Last Updated:** October 20, 2025

Welcome to the Data Room application! This comprehensive guide will help you understand and use every feature of the application effectively.

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication & Account Management](#authentication--account-management)
4. [Data Room Management](#data-room-management)
5. [Folder Operations](#folder-operations)
6. [File Operations](#file-operations)
7. [Search Functionality](#search-functionality)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Frequently Asked Questions](#frequently-asked-questions)
11. [Keyboard Shortcuts](#keyboard-shortcuts)
12. [API Usage (Advanced)](#api-usage-advanced)

---

## Introduction

### What is Data Room?

Data Room is a secure document management application designed for due diligence, M&A transactions, and collaborative document sharing. Think of it as a specialized, secure version of Google Drive built specifically for handling sensitive business documents.

### Key Benefits

- **🔒 Secure**: OAuth 2.0 authentication with Google
- **📁 Organized**: Hierarchical folder structure with unlimited nesting
- **🔍 Searchable**: Full-text search across all PDF documents
- **🚀 Fast**: Modern React interface with instant feedback
- **💼 Professional**: Built for business use cases

### System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet**: Stable connection for OAuth and file uploads
- **Screen**: Minimum 1024x768 resolution (for responsive design)
- **Files**: PDF documents up to 100MB each

---

## Getting Started

### Accessing the Application

1. Open your web browser
2. Navigate to the application URL (default: `http://localhost:5000` for local development)
3. You'll see the login page with the "Sign in with Google" button

### First-Time Setup

Before you can use the application, your administrator must:
1. Set up Google OAuth credentials
2. Configure the backend server
3. Start the PostgreSQL database
4. Provide you with the application URL

If you're setting this up yourself, see the [README.md](README.md) for installation instructions.

---

## Authentication & Account Management

### Signing In

#### Step-by-Step Sign In Process

1. **Navigate to Login Page**
   - Open the application in your browser
   - You'll automatically be redirected to the login page if not authenticated

2. **Click "Sign in with Google"**
   - A button with the Google logo will be visible
   - Click this button to initiate OAuth authentication

3. **Google Account Selection**
   - A Google sign-in window will appear
   - Select the Google account you want to use
   - If you're not signed into Google, you'll need to enter your email and password

4. **Grant Permissions**
   - Google will show you what information the app will access:
     - Basic profile information (name, email)
     - Email address
   - Click "Allow" or "Continue" to proceed

5. **Automatic Redirect**
   - You'll be redirected back to the Data Room application
   - The authentication happens automatically
   - You'll land on the Dashboard page

#### Understanding Authentication

**What happens behind the scenes:**
- The application exchanges OAuth tokens with Google
- A JWT (JSON Web Token) is created for your session
- The token is stored securely in your browser
- All API requests use this token for authentication

**Token Expiration:**
- Your session token lasts for **7 days**
- After 7 days, you'll need to sign in again
- If you close your browser, you'll remain signed in (token persists)

### Your Profile

Once signed in, your profile information is displayed in the application header:
- **Name**: Your Google account name
- **Avatar**: Your Google profile picture
- **Email**: Your Google email address (visible in settings/profile area)

### Signing Out

**To sign out:**
1. Look for the "Logout" or profile menu button in the header
2. Click "Logout"
3. Your JWT token is invalidated
4. You'll be redirected to the login page

**Security Note:** Always sign out when using shared or public computers.

### Account Security

**Best Practices:**
- Use a strong Google account password
- Enable 2-factor authentication on your Google account
- Don't share your session tokens
- Sign out after finishing your work
- Report any suspicious activity immediately

---

## Data Room Management

Data Rooms are the top-level containers for organizing documents. Each Data Room is completely isolated from others.

### Understanding Data Rooms

**What is a Data Room?**
- A secure workspace for organizing documents
- Has a unique name and optional description
- Contains folders and files in a hierarchical structure
- Only accessible by the owner (you)

**Use Cases:**
- **M&A Transactions**: "Project Apollo - Due Diligence"
- **Legal Matters**: "Smith vs. Johnson - Case Files"
- **Client Projects**: "Acme Corp - 2025 Audit"
- **Internal Records**: "HR - Employee Contracts"

### Creating a Data Room

#### Step-by-Step Creation

1. **Navigate to Dashboard**
   - After signing in, you'll be on the Dashboard page
   - This shows all your existing Data Rooms

2. **Click "Create Data Room"**
   - Look for the button (usually top-right or center if no data rooms exist)
   - Click to open the creation dialog

3. **Fill in Details**
   - **Name** (required): Enter a descriptive name
     - Example: "Project Phoenix - Q4 2025"
     - Maximum 255 characters
     - Should be unique and identifiable
   
   - **Description** (optional): Add additional context
     - Example: "Due diligence documents for the Phoenix acquisition"
     - Maximum 1000 characters
     - Can include purpose, timeline, or notes

4. **Click "Create"**
   - The Data Room is created immediately
   - You'll see it appear in your Dashboard
   - The creation timestamp is recorded

#### Naming Best Practices

**Good Names:**
- ✅ "Acme Corp Acquisition - 2025"
- ✅ "Legal - Smith Case Documents"
- ✅ "Q4 Financial Audit"

**Avoid:**
- ❌ "New Folder" (not descriptive)
- ❌ "asdflkj" (meaningless)
- ❌ "Test" (use descriptive names even for testing)

### Viewing Your Data Rooms

**Dashboard View:**
- All your Data Rooms are displayed as cards
- Each card shows:
  - Data Room name
  - Description (if provided)
  - Creation date
  - Action buttons (Open, Edit, Delete)

**Sorting and Filtering:**
- Data Rooms are typically sorted by creation date (newest first)
- Future versions may include search and filtering

### Opening a Data Room

**To access a Data Room:**
1. From the Dashboard, locate the Data Room you want to open
2. Click the "Open" button or click on the card itself
3. You'll be taken to the Data Room view

**Data Room View shows:**
- Breadcrumb navigation (showing current location)
- Folder tree (left sidebar or top panel)
- File/folder list (main area)
- Action buttons (Upload, Create Folder, Search)

### Editing a Data Room

**To update Data Room details:**

1. **Access Edit Mode**
   - From Dashboard, click "Edit" button on the Data Room card
   - Or open the Data Room and look for "Settings" or "Edit" option

2. **Modify Information**
   - Update the name
   - Change the description
   - You cannot change the owner (always you)

3. **Save Changes**
   - Click "Save" or "Update"
   - Changes take effect immediately
   - All files and folders remain unchanged

**What You Can Change:**
- ✅ Name
- ✅ Description
- ❌ Owner (fixed)
- ❌ Creation date (fixed)

### Deleting a Data Room

**⚠️ Warning: This is a permanent action!**

Deleting a Data Room will:
- Delete all folders inside it
- Delete all files inside it
- Remove all file content from disk
- **This cannot be undone!**

**Step-by-Step Deletion:**

1. **Backup Important Files**
   - Download any files you want to keep
   - There is no recycle bin or undo function

2. **Access Delete Function**
   - From Dashboard, click "Delete" button on the Data Room card
   - You'll see a confirmation dialog

3. **Confirm Deletion**
   - The dialog will show a warning message
   - You may need to type the Data Room name to confirm
   - Click "Delete" or "Confirm"

4. **Deletion Process**
   - All nested folders are deleted (cascade)
   - All files are deleted
   - Physical files are removed from disk
   - Database records are removed
   - The Data Room disappears from your Dashboard

**Safety Tips:**
- Create backups before deleting
- Double-check you're deleting the correct Data Room
- Consider archiving instead of deleting

---

## Folder Operations

Folders help you organize files in a hierarchical structure within a Data Room.

### Understanding Folders

**Folder Hierarchy:**
- Folders can contain other folders (unlimited nesting)
- Each folder has a unique path within its Data Room
- Example: `/Legal/Contracts/2025/Q4`

**Folder Features:**
- Unique names within the same parent
- Can contain both files and subfolders
- Automatically track creation date
- Display full path for navigation

### Creating a Folder

#### Step-by-Step Folder Creation

1. **Navigate to Desired Location**
   - Open the Data Room
   - Navigate to the parent folder (or stay at root)
   - The folder will be created at your current location

2. **Click "Create Folder" or "New Folder"**
   - Look for the button in the toolbar
   - Usually has a folder icon (📁)

3. **Enter Folder Name**
   - A dialog or inline input will appear
   - Enter a descriptive name
   - Maximum 255 characters
   - Cannot contain special characters like `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`

4. **Confirm Creation**
   - Press Enter or click "Create"
   - The folder appears immediately in the current view
   - You can now open it and add content

#### Folder Naming Rules

**Valid Names:**
- ✅ "Contracts"
- ✅ "Financial Reports 2025"
- ✅ "Phase-1 Documents"
- ✅ "Q4 Review (Draft)"

**Invalid Names:**
- ❌ "Documents/Archive" (contains `/`)
- ❌ "Report*" (contains `*`)
- ❌ (empty name)

**Name Collision:**
- You cannot create two folders with the same name in the same parent
- Error message: "A folder with this name already exists"
- Solution: Use a different name or create in a different location

### Navigating Folders

#### Opening a Folder

1. **Click on folder name or folder icon**
2. The view updates to show folder contents
3. Breadcrumb navigation updates to show current path

**Example Navigation:**
- Start: `/` (root)
- Click "Legal" → Now at `/Legal`
- Click "Contracts" → Now at `/Legal/Contracts`

#### Breadcrumb Navigation

**What is Breadcrumb Navigation?**
- Shows your current path: `Home > Legal > Contracts > 2025`
- Each segment is clickable
- Click any segment to jump directly to that level

**Usage:**
- Click "Home" to return to Data Room root
- Click "Legal" to jump back to `/Legal`
- Faster than clicking "Back" multiple times

#### Using the Folder Tree (if available)

Some views include a folder tree sidebar:
- Shows entire folder structure
- Expand/collapse nodes with arrow icons
- Click any folder to navigate directly to it
- Current folder is highlighted

### Renaming a Folder

**To rename a folder:**

1. **Locate the Folder**
   - Navigate to the parent folder
   - Find the folder you want to rename

2. **Access Rename Function**
   - Right-click on folder (context menu)
   - Or click the "..." (more actions) button
   - Select "Rename"

3. **Enter New Name**
   - An input field appears with the current name
   - Type the new name
   - Follow naming rules (no special characters)

4. **Confirm Rename**
   - Press Enter or click "Save"
   - The folder name updates immediately
   - The path updates for all nested items

**Important Notes:**
- Renaming updates the folder path
- All nested items inherit the new path
- Files inside are not affected (only the folder metadata)
- You cannot rename to a name that already exists in the same parent

### Moving a Folder

**Current Version:** Direct drag-and-drop may not be available.

**To move a folder:**

1. **Manual Approach:**
   - Create the folder in the new location
   - Move or copy files to the new folder
   - Delete the old folder

2. **Future Enhancement:** Drag-and-drop is planned for future versions.

### Deleting a Folder

**⚠️ Warning: This deletes all contents!**

**What Gets Deleted:**
- The folder itself
- All subfolders inside (recursive)
- All files inside (recursive)
- Physical file content from disk

**Step-by-Step Deletion:**

1. **Access Delete Function**
   - Right-click on folder
   - Or click "..." (more actions) → "Delete"

2. **Confirm Deletion**
   - A warning dialog appears
   - Shows how many items will be deleted
   - "Delete folder 'Contracts' and all its contents? (5 files, 2 subfolders)"

3. **Confirm Action**
   - Click "Delete" or "Confirm"
   - The deletion is immediate and permanent

4. **Result**
   - Folder disappears from view
   - All nested content is removed
   - Disk space is freed

**Safety Tips:**
- Download important files before deleting
- Double-check you're deleting the correct folder
- Start with small folders to understand the behavior
- Consider moving files to an "Archive" folder instead of deleting

### Folder Best Practices

**Organizational Structure:**
```
Data Room: "Project Phoenix Acquisition"
├── 01 Financial
│   ├── Statements
│   ├── Tax Returns
│   └── Audits
├── 02 Legal
│   ├── Contracts
│   ├── Licenses
│   └── Litigation
├── 03 Operations
│   ├── Procedures
│   ├── HR
│   └── IT
└── 04 Marketing
    ├── Materials
    └── Analytics
```

**Naming Conventions:**
- Use numerical prefixes for sorting: `01 Financial`, `02 Legal`
- Keep names concise but descriptive
- Use consistent capitalization
- Avoid deep nesting (5-6 levels maximum for usability)

---

## File Operations

Files are the core content of your Data Room. The application currently supports PDF documents.

### Understanding File Storage

**Supported File Types:**
- ✅ PDF documents (`.pdf`)
- ❌ Other formats (not supported in current version)

**File Size Limits:**
- Maximum: 100MB per file
- Recommended: Under 50MB for faster uploads

**Storage Location:**
- Files are stored on disk in a secure upload directory
- Original filename is preserved for display
- Physical file uses UUID to prevent collisions
- Full-text content is extracted and indexed for search

### Uploading Files

#### Step-by-Step Upload Process

1. **Navigate to Target Location**
   - Open the Data Room
   - Navigate to the folder where you want to upload
   - Or stay at root to upload to Data Room root

2. **Click "Upload File" or "Upload" Button**
   - Look for the upload button (usually has an upload icon ⬆️)
   - Or drag-and-drop files (if supported)

3. **Select File(s)**
   - A file picker dialog opens
   - Browse to your PDF file
   - Select one or multiple files (if multiple upload is supported)
   - Click "Open"

4. **Upload Progress**
   - A progress indicator appears
   - Shows upload percentage
   - Large files may take several seconds

5. **Processing**
   - After upload, the server:
     - Validates file type (must be PDF)
     - Checks file size (max 100MB)
     - Extracts text content for search
     - Generates unique storage name
     - Saves file to disk
     - Creates database record

6. **Completion**
   - File appears in the file list
   - You can now download, search, or manage it

#### Handling Upload Errors

**Common Errors:**

1. **"File size exceeds limit"**
   - Your file is larger than 100MB
   - Solution: Compress the PDF or split it into smaller files

2. **"Invalid file type"**
   - You tried to upload a non-PDF file
   - Solution: Convert to PDF or use a different file

3. **"Upload failed"**
   - Network issue or server error
   - Solution: Check your connection and try again

4. **"Duplicate file name"**
   - A file with this name already exists in this location
   - Solution: The app automatically renames it with "(1)", "(2)", etc.

### File Naming and Duplicates

**How Duplicate Names Are Handled:**

When you upload a file that has the same name as an existing file:
- ✅ Upload succeeds (not blocked)
- ✅ New file is automatically renamed
- Example:
  - Existing: `Contract.pdf`
  - Upload: `Contract.pdf`
  - Result: `Contract (1).pdf`
  - Next: `Contract (2).pdf`

**Manual Renaming:**
- You can rename files after upload
- Follow the rename process (see below)

### Viewing File Details

**File List Display:**
Each file in the list shows:
- 📄 File icon (PDF icon)
- File name (clickable to download)
- File size (in KB, MB)
- Upload date/time
- Action buttons (Download, Rename, Delete)

**To view more details:**
- Some views may show a details panel
- Click the info icon or file name
- Shows:
  - Original filename
  - Upload timestamp
  - File size
  - MIME type
  - Text content preview (if extracted)

### Downloading Files

**To download a file:**

1. **Locate the File**
   - Navigate to the folder containing the file
   - Find the file in the list

2. **Click Download**
   - Click the "Download" button or link
   - Or click the file name (if it's a download link)
   - Or right-click and select "Download"

3. **Browser Download**
   - Your browser's download dialog appears
   - Choose save location (or use default Downloads folder)
   - Click "Save"

4. **File Saved**
   - The PDF is saved to your computer
   - Original filename is preserved
   - You can now open it with a PDF reader

**Bulk Downloads:**
- Current version: Download files one at a time
- Future enhancement: Multi-select and download as ZIP

### Renaming Files

**To rename a file:**

1. **Access Rename Function**
   - Click the "..." (more actions) button on the file
   - Or right-click the file
   - Select "Rename"

2. **Enter New Name**
   - An input field appears with current name
   - Type the new name
   - Include the `.pdf` extension
   - Example: `New Contract 2025.pdf`

3. **Confirm Rename**
   - Press Enter or click "Save"
   - The file is renamed immediately
   - Display name updates in the list

**Important Notes:**
- Renaming only changes the display name
- Physical file on disk is not renamed (uses UUID)
- You can rename to a name that already exists (auto-rename will apply)
- Text content and metadata are preserved

### Moving Files

**To move a file to a different folder:**

**Current Version Approach:**

1. **Download the file**
2. **Navigate to the target folder**
3. **Upload the file**
4. **Delete the original file** (if needed)

**Future Enhancement:**
- Drag-and-drop to move files
- "Move to..." context menu option
- Planned for future versions

### Deleting Files

**To delete a file:**

1. **Locate the File**
   - Navigate to the folder containing the file

2. **Click Delete**
   - Click the "Delete" button or trash icon
   - Or right-click and select "Delete"

3. **Confirm Deletion**
   - A confirmation dialog appears
   - "Are you sure you want to delete 'Contract.pdf'?"
   - This action is permanent

4. **Confirm Action**
   - Click "Delete" or "Confirm"
   - The file is removed immediately

5. **Result**
   - File disappears from the list
   - Physical file is deleted from disk
   - Database record is removed
   - **This cannot be undone**

**Safety Tips:**
- Download a backup before deleting
- Double-check you're deleting the correct file
- Consider archiving important files instead of deleting

---

## Search Functionality

Search allows you to find files quickly by filename or by text content inside PDF documents.

### Understanding Search

**What Can You Search?**
- ✅ File names (exact and partial matches)
- ✅ Folder names (when "File/Folder names" filter is enabled)
- ✅ PDF text content (full-text search)
- ❌ File metadata (not in current version)

**How Search Works:**
1. When you upload a PDF, text is automatically extracted
2. Text content is stored in the database
3. Search queries match against both filename and content
4. Results are returned instantly

### Using the Search Feature

#### Basic Search

**Step-by-Step:**

1. **Open a Data Room**
   - Search works within a specific Data Room
   - Navigate to the Data Room you want to search

2. **Locate the Search Box**
   - Usually in the top toolbar
   - Has a magnifying glass icon 🔍
   - Placeholder text: "Search files..."

3. **Configure Search Filters (Optional)**
   - Click the filter icon next to the search box
   - A collapsible panel will appear showing search options:
     - **File/Folder names**: Search in filenames and folder names
     - **File content**: Search in PDF text content
   - By default, both options are enabled
   - You can uncheck one to narrow your search:
     - Uncheck "File content" to search only by name
     - Uncheck "File/Folder names" to search only in content
   - At least one option must be selected

4. **Enter Your Query**
   - Type your search term
   - Example: "contract", "2025", "John Smith"
   - Search is case-insensitive

5. **Execute Search**
   - Press Enter or click the search button
   - Search runs against current Data Room only
   - Uses the selected filter options

6. **View Results**
   - Results appear in the main area
   - Shows matching files and folders
   - Indicates match type based on your filters:
     - "Filename match" - found in file/folder name
     - "Content match" - found in PDF content
     - "Filename & Content match" - found in both

#### Search Filters

**Filter Options:**

The search filter panel gives you precise control over where to search:

1. **File/Folder Names Only**
   - Use when you remember part of the filename
   - Faster results (no content scanning needed)
   - Example: Search "contract-2025" to find files with that name pattern
   - Includes folder names in results

2. **File Content Only**
   - Use when searching for specific text inside PDFs
   - Finds documents containing your search terms
   - Example: Search "John Smith" to find all contracts mentioning that person
   - Useful for finding documents by content rather than name

3. **Both (Default)**
   - Most comprehensive search
   - Finds matches in either filenames or content
   - Recommended for general searches
   - Results show where the match was found

#### Search Results

**Result Display:**
- File name
- File size
- Location (folder path)
- Match type: "Filename match" or "Content match"
- Upload date
- Action buttons (Download, Open location)

**No Results:**
- Message: "No files found matching 'your query'"
- Try different keywords
- Check spelling
- Try broader terms

### Advanced Search Tips

**Best Practices:**

1. **Use Search Filters Strategically**
   - When you know the filename: Disable "File content" for faster results
   - When searching for concepts: Disable "File/Folder names" to focus on content
   - When unsure: Keep both enabled (default)

2. **Use Specific Terms**
   - ✅ "acquisition agreement" (specific)
   - ❌ "document" (too broad)

3. **Try Variations**
   - If "contract" doesn't work, try "agreement" or "terms"
   - Use synonyms

4. **Partial Matches**
   - "2025" will match "Report_2025.pdf"
   - "Smith" will match "John_Smith_Contract.pdf"

5. **Multi-word Queries**
   - Current version: Searches for files containing the entire phrase
   - Future: Boolean operators (AND, OR, NOT)

6. **Case-Insensitive**
   - "CONTRACT" and "contract" return the same results

**Common Search Patterns:**

| What You Want | Search Query | Recommended Filter |
|---------------|--------------|-------------------|
| All 2025 files | `2025` | File/Folder names only |
| Contracts | `contract` or `agreement` | Both (default) |
| Files by person | `John Smith` | File content only |
| Financial docs | `financial` or `statement` | Both (default) |
| Specific term | `"due diligence"` | File content only |
| Files with naming pattern | `report_Q4` | File/Folder names only |

### Search Limitations

**Current Version:**
- Searches one Data Room at a time (not global)
- No fuzzy matching (exact substring match)
- No ranking by relevance
- Limited filters (name vs content only)

**Planned Enhancements:**
- Global search across all Data Rooms
- Fuzzy matching and typo tolerance
- Advanced filters (by date, size, folder)
- Search result ranking
- Search history

### PDF Text Extraction

**How It Works:**
- When you upload a PDF, the server uses PyPDF2 to extract text
- Text is stored in the `content_text` field
- This enables content search

**Limitations:**
- Scanned PDFs without OCR may have no extractable text
- Image-based PDFs won't be searchable by content
- Complex layouts may have garbled text extraction

**Tip:** If a PDF isn't searchable, ensure it's text-based (not a scanned image).

---

## Best Practices

### Organizational Strategies

#### 1. Consistent Naming Conventions

**For Data Rooms:**
```
[Project Code] - [Project Name] - [Year]
Example: "PHX-001 - Project Phoenix - 2025"
```

**For Folders:**
```
[Number] [Category]
Example: "01 Financial Documents"
         "02 Legal Agreements"
         "03 Technical Specifications"
```

**For Files:**
```
[Date]_[Type]_[Description]_[Version]
Example: "2025-10-15_Contract_Employment_v1.pdf"
         "2025-Q4_Report_Financial_FINAL.pdf"
```

#### 2. Folder Structure Templates

**M&A Due Diligence:**
```
Project Name Due Diligence/
├── 01 Executive Summary/
├── 02 Financial/
│   ├── Statements/
│   ├── Tax Returns/
│   └── Projections/
├── 03 Legal/
│   ├── Corporate/
│   ├── Contracts/
│   ├── IP/
│   └── Litigation/
├── 04 Operations/
│   ├── Facilities/
│   ├── IT Systems/
│   └── Procedures/
└── 05 HR/
    ├── Org Chart/
    ├── Key Employees/
    └── Compensation/
```

**Legal Case Management:**
```
Case Name/
├── 01 Pleadings/
├── 02 Discovery/
│   ├── Requests/
│   ├── Responses/
│   └── Depositions/
├── 03 Exhibits/
├── 04 Correspondence/
├── 05 Research/
└── 06 Filings/
```

#### 3. Access Control Strategy

**Current Version:**
- Each user can only see their own Data Rooms
- No sharing functionality yet

**Planning for Future Sharing:**
- Create clear ownership structure
- Document who should have access
- Keep sensitive documents in separate Data Rooms

### File Management Tips

#### Versioning Strategy

Since the app doesn't have built-in versioning:

**Filename Versioning:**
```
Contract_v1.pdf
Contract_v2.pdf
Contract_v3_FINAL.pdf
Contract_v3_FINAL_FINAL.pdf (avoid this!)
```

**Better Approach:**
```
2025-10-15_Contract_Draft.pdf
2025-10-20_Contract_Review.pdf
2025-10-22_Contract_Final.pdf
```

**Version Control Folder:**
```
Contracts/
├── Current/
│   └── Employment_Contract_v3.pdf
└── Archive/
    ├── Employment_Contract_v1.pdf
    └── Employment_Contract_v2.pdf
```

#### Backup Strategy

**Regular Backups:**
1. Download critical files weekly
2. Store backups in multiple locations
3. Use external hard drives or cloud storage
4. Test restore process periodically

**Before Major Changes:**
- Download all files before restructuring
- Keep old structure until new one is validated
- Document changes made

### Search Optimization

**Making Files More Searchable:**

1. **Use Descriptive Filenames**
   - ✅ "2025_Tax_Return_Federal.pdf"
   - ❌ "Document1.pdf"

2. **Include Keywords in Filename**
   - Include names, dates, types
   - Example: "Smith_John_Employment_Agreement_2025.pdf"

3. **Ensure PDFs Have Text**
   - Use text-based PDFs, not scanned images
   - If you have scans, use OCR (Optical Character Recognition) before uploading

4. **Consistent Terminology**
   - Choose one term and stick with it
   - "Agreement" vs "Contract" – pick one
   - "Q1" vs "First Quarter" – be consistent

### Performance Tips

**For Large Data Rooms:**

1. **Limit Folder Depth**
   - Keep nesting to 4-5 levels maximum
   - Deep nesting makes navigation harder

2. **Split Large Files**
   - If a PDF is near 100MB, consider splitting it
   - Smaller files upload and download faster

3. **Regular Cleanup**
   - Delete outdated files
   - Archive old versions
   - Remove duplicates

4. **Batch Operations**
   - Upload multiple files at once (if supported)
   - Organize folders before uploading

---

## Troubleshooting

### Authentication Issues

#### Problem: "Unable to Sign In"

**Symptoms:**
- Google sign-in fails
- Redirects back to login page
- Error message: "Authentication failed"

**Solutions:**

1. **Check Google OAuth Configuration**
   - Verify Client ID is correct in backend `.env`
   - Verify Client Secret is correct
   - Check redirect URI matches: `http://localhost:5000/auth/callback`

2. **Clear Browser Cache and Cookies**
   - Chrome: Settings → Privacy → Clear browsing data
   - Check "Cookies" and "Cached images"
   - Clear last 24 hours
   - Try signing in again

3. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Look for errors in Console tab
   - Share error messages with support

4. **Verify Backend is Running**
   - Backend should be running on port 5001
   - Check terminal for errors
   - Restart backend: `uv run python app.py`

#### Problem: "Token Expired"

**Symptoms:**
- You were signed in, now suddenly logged out
- Error: "Unauthorized" or "Token expired"

**Solution:**
- JWT tokens expire after 7 days
- Simply sign in again
- Your data is not lost

#### Problem: "Redirect URI Mismatch"

**Error Message:**
```
Error 400: redirect_uri_mismatch
```

**Solution:**
1. Go to Google Cloud Console
2. Navigate to Credentials
3. Edit your OAuth Client ID
4. Ensure Authorized Redirect URIs includes:
   ```
   http://localhost:5000/auth/callback
   ```
5. Save and try again

### File Upload Issues

#### Problem: "Upload Failed"

**Symptoms:**
- Upload button doesn't work
- File never appears in list
- Error message during upload

**Solutions:**

1. **Check File Size**
   - Maximum: 100MB
   - Solution: Compress PDF or split into smaller files

2. **Check File Type**
   - Only PDF files are supported
   - Check file extension: `.pdf`
   - Don't rename a different file type to `.pdf`

3. **Check Network Connection**
   - Ensure stable internet
   - Large files need reliable connection
   - Try smaller file first to test

4. **Check Disk Space**
   - Server may be out of disk space
   - Contact administrator

5. **Check Backend Logs**
   - Look at terminal running backend
   - Check for errors during upload
   - Share error messages with support

#### Problem: "File Not Searchable"

**Symptoms:**
- File uploaded successfully
- But search doesn't find it by content

**Causes:**
- Scanned PDF without OCR
- Image-based PDF
- Text extraction failed

**Solutions:**
1. **Use OCR Tool**
   - Run the PDF through an OCR tool first
   - Adobe Acrobat Pro has OCR
   - Free online tools available

2. **Verify File Has Text**
   - Open PDF in a reader
   - Try to select and copy text
   - If you can't, it's likely image-based

3. **Re-upload After OCR**
   - Delete the old file
   - Upload the OCR'd version

#### Problem: "Duplicate File Names"

**Symptoms:**
- Uploaded a file, but name has "(1)" or "(2)" appended

**Explanation:**
- This is expected behavior
- Prevents overwriting existing files

**If You Want to Replace:**
1. Delete the old file
2. Upload the new file
3. It will take the original name

### Folder Issues

#### Problem: "Cannot Create Folder"

**Error:** "A folder with this name already exists"

**Solution:**
- Choose a different name
- Or create in a different location
- Folder names must be unique within the same parent

#### Problem: "Folder Tree Not Loading"

**Symptoms:**
- Folder structure doesn't appear
- Blank screen or loading spinner forever

**Solutions:**

1. **Refresh the Page**
   - Press F5 or Ctrl+R
   - Often resolves temporary glitches

2. **Check Network**
   - Ensure you're connected
   - Check browser console for errors

3. **Clear Cache**
   - Clear browser cache
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

4. **Check Backend**
   - Verify backend is running
   - Check for errors in backend terminal

### Search Issues

#### Problem: "Search Returns No Results"

**When You Expect Results:**

**Troubleshooting Steps:**

1. **Check Spelling**
   - Try alternative spellings
   - Use broader terms

2. **Check Data Room**
   - Search only works within current Data Room
   - Switch to correct Data Room

3. **Try Filename Search**
   - Search for part of the filename
   - Example: If file is "Report_2025.pdf", search "2025"

4. **Check File Content**
   - If searching by content, ensure PDF has text
   - Open the PDF and verify text is selectable

5. **Check Case Sensitivity**
   - Search should be case-insensitive
   - If not working, try lowercase

### Performance Issues

#### Problem: "Application is Slow"

**Symptoms:**
- Pages load slowly
- Uploads take forever
- Navigation is laggy

**Solutions:**

1. **Check Network Speed**
   - Run a speed test
   - Ensure stable connection
   - Close bandwidth-heavy applications

2. **Check Browser**
   - Try a different browser
   - Update your browser to latest version
   - Clear cache and cookies

3. **Check Server Load**
   - Server may be under heavy load
   - Contact administrator
   - Try during off-peak hours

4. **Reduce Data Room Size**
   - Large Data Rooms (1000+ files) may be slower
   - Consider splitting into multiple Data Rooms

5. **Close Unnecessary Tabs**
   - Too many browser tabs can slow down performance
   - Close tabs you're not using

### Database Connection Issues

#### Problem: "Internal Server Error"

**Symptoms:**
- 500 Internal Server Error
- "Database connection failed"
- Backend terminal shows database errors

**Solutions:**

1. **Check PostgreSQL is Running**
   ```bash
   podman ps | grep postgres
   ```
   - If not running, start it:
   ```bash
   cd backend
   ./start-postgres.sh
   ```

2. **Check Database Credentials**
   - Verify `.env` file has correct `DATABASE_URL`
   - Default: `postgresql://dataroom:dataroom_dev_password@localhost:5433/dataroom`

3. **Restart Database**
   ```bash
   podman restart dataroom-postgres
   ```

4. **Check Logs**
   ```bash
   podman logs dataroom-postgres
   ```

---

## Frequently Asked Questions

### General

**Q: Is my data secure?**  
A: Yes. The application uses OAuth 2.0 for authentication, JWT tokens for sessions, and all data is isolated per user. Only you can access your Data Rooms.

**Q: Can I share Data Rooms with others?**  
A: Not in the current version. Sharing and collaboration features are planned for future releases.

**Q: What browsers are supported?**  
A: Chrome, Firefox, Safari, and Edge (latest versions). Mobile browsers work but desktop experience is recommended.

**Q: Is there a mobile app?**  
A: Not currently. The web application is responsive and works on mobile browsers, but a native app is not available.

**Q: What happens if I lose my Google account?**  
A: You won't be able to access your Data Rooms. Your data remains in the system, but authentication is tied to your Google account. Contact your administrator for recovery options.

### Files and Storage

**Q: What file types are supported?**  
A: Currently, only PDF files are supported. Other formats may be added in future versions.

**Q: What's the file size limit?**  
A: 100MB per file. This is configurable by your administrator.

**Q: Can I upload multiple files at once?**  
A: Depends on implementation. Check if the upload dialog supports multi-select.

**Q: Where are my files stored?**  
A: Files are stored securely on the server's disk in a dedicated upload directory. File paths are not accessible to users.

**Q: Can I recover deleted files?**  
A: No. Deletion is permanent. Always download backups of important files before deleting.

**Q: Do you have file versioning?**  
A: Not in the current version. Use filename conventions to track versions (e.g., "Contract_v1.pdf", "Contract_v2.pdf").

### Search

**Q: Can I search across all Data Rooms?**  
A: Not in the current version. Search works within one Data Room at a time.

**Q: Why isn't my scanned PDF searchable?**  
A: Scanned PDFs are images without text. Use OCR (Optical Character Recognition) to convert to searchable PDFs.

**Q: Can I use advanced search operators?**  
A: Not yet. Boolean operators (AND, OR, NOT) are planned for future versions.

**Q: How do I search for exact phrases?**  
A: Current version searches for the entire query string. Exact phrase matching with quotes may be added later.

### Organization

**Q: How many folders can I create?**  
A: Unlimited. However, for usability, we recommend limiting nesting to 5-6 levels.

**Q: Can I move multiple files at once?**  
A: Not in the current version. Bulk operations are planned for future releases.

**Q: Can I color-code or tag folders and files?**  
A: Not currently. Tagging and metadata features are under consideration.

**Q: How do I organize by date?**  
A: Use date prefixes in folder or file names (e.g., "2025-10 October", "2025-Q4").

### Access and Permissions

**Q: Who can see my Data Rooms?**  
A: Only you. Each Data Room is private to its owner.

**Q: Can I assign different permissions to different folders?**  
A: Not in the current version. This requires the sharing feature, which is planned.

**Q: Can I make a Data Room read-only?**  
A: Not currently. All your Data Rooms have full read/write access.

**Q: How do I share a file with someone?**  
A: Download the file and share it externally (email, cloud storage, etc.). In-app sharing is not available yet.

### Technical

**Q: What technology stack is used?**  
A: Backend: Python, Flask, PostgreSQL. Frontend: React, TypeScript, Tailwind CSS. See README.md for full tech stack.

**Q: Can I self-host this?**  
A: Yes. Follow the setup instructions in README.md. You'll need Python, Node.js, PostgreSQL, and Google OAuth credentials.

**Q: Is there an API?**  
A: Yes. The backend exposes a RESTful API. See [API Usage](#api-usage-advanced) section below.

**Q: How do I backup my data?**  
A: Download files manually, or use the API to automate backups. Database backups can be done via PostgreSQL tools.

**Q: Can I export all my data?**  
A: Download files individually. Bulk export feature is planned.

---

## Keyboard Shortcuts

Keyboard shortcuts can speed up your workflow (if implemented in the UI).

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Focus search box |
| `Backspace` | Navigate up one folder level |
| `Enter` | Open selected folder or download selected file |
| `Esc` | Close dialog/modal |

### File Operations

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Open upload dialog |
| `Ctrl/Cmd + N` | Create new folder |
| `Delete` | Delete selected item |
| `F2` | Rename selected item |

### General

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save (in dialogs) |
| `Ctrl/Cmd + Z` | Undo (context-dependent) |
| `Ctrl/Cmd + /` | Show keyboard shortcuts help |

**Note:** Availability depends on implementation. Check the app's help menu or settings.

---

## API Usage (Advanced)

For developers and power users who want to interact with the application programmatically.

### Authentication

All API requests require authentication via JWT token.

**Getting a Token:**
1. Sign in via web UI
2. Token is stored in browser (localStorage or cookie)
3. Extract token from browser storage
4. Include in API requests: `Authorization: Bearer <token>`

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/api/datarooms
```

### API Endpoints Overview

#### Authentication

```http
GET /api/auth/login
Returns: { auth_url: "https://accounts.google.com/..." }

GET /api/auth/callback?code=xyz
Returns: { token: "jwt-token", user: {...} }

GET /api/auth/me
Returns: { id, email, name, avatar_url, oauth_provider }

POST /api/auth/logout
Returns: { message: "Logged out successfully" }
```

#### Data Rooms

```http
GET /api/datarooms
Returns: [{ id, name, description, owner_id, created_at, updated_at }, ...]

POST /api/datarooms
Body: { name: "My Data Room", description: "Optional" }
Returns: { id, name, description, ... }

GET /api/datarooms/:id
Returns: { id, name, description, ... }

PUT /api/datarooms/:id
Body: { name: "Updated Name", description: "New description" }
Returns: { id, name, description, ... }

DELETE /api/datarooms/:id
Returns: { message: "Data room deleted successfully" }

GET /api/datarooms/:id/structure
Returns: { folders: [...], files: [...] }
```

#### Folders

```http
POST /api/folders
Body: { name: "Folder Name", dataroom_id: 1, parent_id: null }
Returns: { id, name, parent_id, dataroom_id, path, created_at }

GET /api/folders/:id
Returns: { id, name, parent_id, dataroom_id, path, created_at }

PUT /api/folders/:id
Body: { name: "New Name" }
Returns: { id, name, ... }

DELETE /api/folders/:id
Returns: { message: "Folder deleted successfully" }

GET /api/folders/:id/contents
Returns: { folders: [...], files: [...] }
```

#### Files

```http
POST /api/files
Content-Type: multipart/form-data
Body: { file: <binary>, dataroom_id: 1, folder_id: 2 }
Returns: { id, name, file_path, file_size, mime_type, ... }

GET /api/files/:id
Returns: { id, name, original_name, file_size, mime_type, ... }

GET /api/files/:id/download
Returns: <binary file data>

PUT /api/files/:id
Body: { name: "New Name.pdf" }
Returns: { id, name, ... }

DELETE /api/files/:id
Returns: { message: "File deleted successfully" }
```

#### Search

```http
GET /api/search?q=query&dataroom_id=123
Returns: [{ id, name, file_path, file_size, folder_id, dataroom_id, ... }, ...]
```

### Example API Usage

#### Creating a Data Room

```bash
curl -X POST http://localhost:5001/api/datarooms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Phoenix",
    "description": "M&A Due Diligence"
  }'
```

#### Uploading a File

```bash
curl -X POST http://localhost:5001/api/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "dataroom_id=1" \
  -F "folder_id=2"
```

#### Searching Files

```bash
curl "http://localhost:5001/api/search?q=contract&dataroom_id=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Downloading a File

```bash
curl -O -J \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/files/42/download
```

### Automation Examples

#### Python Script to Backup All Files

```python
import requests
import os

BASE_URL = "http://localhost:5001/api"
TOKEN = "your-jwt-token"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# Get all data rooms
datarooms = requests.get(f"{BASE_URL}/datarooms", headers=HEADERS).json()

for dr in datarooms:
    dr_id = dr['id']
    dr_name = dr['name']
    
    # Create local folder
    os.makedirs(f"backup/{dr_name}", exist_ok=True)
    
    # Get data room structure
    structure = requests.get(
        f"{BASE_URL}/datarooms/{dr_id}/structure",
        headers=HEADERS
    ).json()
    
    # Download all files
    for file in structure['files']:
        file_id = file['id']
        file_name = file['name']
        
        response = requests.get(
            f"{BASE_URL}/files/{file_id}/download",
            headers=HEADERS
        )
        
        with open(f"backup/{dr_name}/{file_name}", 'wb') as f:
            f.write(response.content)
        
        print(f"Downloaded: {file_name}")

print("Backup complete!")
```

#### Bulk Upload Script

```python
import requests
import os

BASE_URL = "http://localhost:5001/api"
TOKEN = "your-jwt-token"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

DATAROOM_ID = 1
LOCAL_FOLDER = "/path/to/pdfs"

for filename in os.listdir(LOCAL_FOLDER):
    if filename.endswith('.pdf'):
        filepath = os.path.join(LOCAL_FOLDER, filename)
        
        with open(filepath, 'rb') as f:
            files = {'file': f}
            data = {'dataroom_id': DATAROOM_ID}
            
            response = requests.post(
                f"{BASE_URL}/files",
                headers=HEADERS,
                files=files,
                data=data
            )
            
            if response.status_code == 201:
                print(f"Uploaded: {filename}")
            else:
                print(f"Failed: {filename} - {response.text}")
```

---

## Support and Feedback

### Getting Help

**Documentation:**
- This User Manual
- README.md (technical documentation)
- QUICK_START_GOOGLE_OAUTH.md (setup guide)

**Common Issues:**
- Check [Troubleshooting](#troubleshooting) section
- Check [FAQ](#frequently-asked-questions) section

**Technical Support:**
- Contact your system administrator
- Check backend logs for error messages
- Check browser console for frontend errors

### Reporting Bugs

When reporting a bug, include:
1. **What you were trying to do**
2. **What happened instead**
3. **Steps to reproduce**
4. **Browser and version**
5. **Screenshots (if applicable)**
6. **Error messages from console**

### Feature Requests

Have an idea for a new feature? Consider:
- Check the [Known Limitations](#known-limitations--future-improvements) section in README.md
- See if it's already planned
- Submit a feature request with clear use case

### Contributing

If you're a developer:
- See README.md for development setup
- Follow coding standards in `.github/instructions/`
- Submit pull requests on GitHub

---

## Appendix

### Glossary

- **Data Room**: Top-level container for organizing files and folders
- **OAuth**: Authentication protocol (Open Authorization)
- **JWT**: JSON Web Token (session token)
- **PDF**: Portable Document Format
- **OCR**: Optical Character Recognition (converts images to text)
- **Breadcrumb**: Navigation path showing current location
- **UUID**: Universally Unique Identifier (used for file storage)
- **MIME Type**: File type identifier (e.g., `application/pdf`)
- **Cascade Delete**: Deleting parent deletes all children

### File Size Reference

| Size | Typical Content |
|------|-----------------|
| < 1 MB | Simple documents, forms |
| 1-10 MB | Reports with images, presentations |
| 10-50 MB | Large reports, scanned documents |
| 50-100 MB | Very large documents, high-resolution scans |

### Common File Extensions

| Extension | Type | Supported? |
|-----------|------|------------|
| .pdf | PDF Document | ✅ Yes |
| .docx | Word Document | ❌ No |
| .xlsx | Excel Spreadsheet | ❌ No |
| .pptx | PowerPoint | ❌ No |
| .jpg/.png | Image | ❌ No |

### Character Limits

| Field | Limit |
|-------|-------|
| Data Room Name | 255 characters |
| Data Room Description | 1000 characters |
| Folder Name | 255 characters |
| File Name | 255 characters |
| Search Query | 500 characters |

---

## Document Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | October 20, 2025 | Initial user manual release |

---

## Quick Reference Card

### Most Common Tasks

1. **Sign In**: Click "Sign in with Google"
2. **Create Data Room**: Dashboard → "Create Data Room"
3. **Upload File**: Open Data Room → "Upload File"
4. **Create Folder**: Navigate to location → "Create Folder"
5. **Search**: Open Data Room → Search box → Type query
6. **Download**: Click file → "Download"
7. **Delete**: Click "..." → "Delete" → Confirm

### Essential Tips

- Always download backups before deleting
- Use descriptive names for better searching
- Keep folder nesting shallow (4-5 levels max)
- Scanned PDFs need OCR to be searchable
- Upload limit is 100MB per file
- Session lasts 7 days

---

**End of User Manual**

For technical documentation, see [README.md](README.md).  
For OAuth setup, see [QUICK_START_GOOGLE_OAUTH.md](QUICK_START_GOOGLE_OAUTH.md).

*Built with ❤️ for secure document management.*
