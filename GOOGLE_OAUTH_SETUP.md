# Google OAuth 2.0 Setup Guide

This guide will walk you through setting up Google OAuth 2.0 authentication for the Data Room application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **New Project**
4. Enter project details:
   - **Project Name**: `Data Room` (or your preferred name)
   - **Organization**: Leave as default or select your organization
5. Click **Create**
6. Wait for the project to be created and select it from the project dropdown

### 2. Enable Google+ API (Optional but Recommended)

1. In the Google Cloud Console, navigate to **APIs & Services** → **Library**
2. Search for "Google+ API" or "People API"
3. Click on the API and click **Enable**

### 3. Configure OAuth Consent Screen

Before creating OAuth credentials, you must configure the consent screen that users will see when authorizing your application.

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the OAuth consent screen form:

#### App Information
- **App name**: `Data Room`
- **User support email**: Your email address
- **App logo**: (Optional) Upload a logo image

#### App Domain
- **Application home page**: `http://localhost:5000` (for development)
- **Application privacy policy link**: (Optional for development)
- **Application terms of service link**: (Optional for development)

#### Authorized Domains
- Leave empty for localhost development

#### Developer Contact Information
- **Email addresses**: Your email address

5. Click **Save and Continue**

#### Scopes Configuration
1. Click **Add or Remove Scopes**
2. Add the following scopes:
   - `openid` (Show basic profile information)
   - `email` (See your primary Google Account email address)
   - `profile` (See your personal info, including any personal info you've made publicly available)
3. Click **Update**
4. Click **Save and Continue**

#### Test Users (for External User Type)
1. Click **Add Users**
2. Add your test email addresses (the Google accounts you'll use for testing)
3. Click **Save and Continue**
4. Review the summary and click **Back to Dashboard**

### 4. Create OAuth 2.0 Client ID

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, complete the OAuth consent screen setup (see Step 3)
4. Select **Web application** as the Application type
5. Configure the OAuth client:

#### Name
- **Name**: `Data Room Local Dev` (or your preferred name)

#### Authorized JavaScript Origins
- Click **Add URI**
- Add: `http://localhost:5000`
- (Optional) Add: `http://localhost:5001` for backend

#### Authorized Redirect URIs
- Click **Add URI**
- Add: `http://localhost:5000/auth/callback`
- **Important**: This must match exactly with your backend configuration

6. Click **Create**
7. A dialog will appear with your credentials

### 5. Save Your Credentials

1. Copy the **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
2. Copy the **Client Secret** (random string)
3. Click **OK** to close the dialog

**Important**: Keep these credentials secure and never commit them to version control.

### 6. Configure the Backend

1. Open your backend `.env` file:
   ```bash
   cd backend
   nano .env
   ```

2. Update the OAuth configuration:
   ```bash
   # OAuth Configuration (Google)
   GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret-here
   OAUTH_REDIRECT_URI=http://localhost:5000/auth/callback
   ```

3. Replace `your-client-id-here` and `your-client-secret-here` with your actual credentials
4. Save the file

### 7. Verify Configuration

1. Start the backend server:
   ```bash
   cd backend
   uv run python app.py
   ```

2. Start the frontend:
   ```bash
   cd ui
   npm run dev
   ```

3. Open your browser to `http://localhost:5000`
4. Click **Sign in with Google**
5. You should be redirected to Google's sign-in page
6. Select your Google account
7. Review and accept the permissions
8. You should be redirected back to the application and logged in

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI in your OAuth configuration doesn't match the one registered in Google Cloud Console.

**Solution**:
1. Check your backend `.env` file: `OAUTH_REDIRECT_URI=http://localhost:5000/auth/callback`
2. Verify in Google Cloud Console → Credentials → Your OAuth Client → Authorized redirect URIs
3. Ensure they match exactly (including protocol, domain, port, and path)
4. After making changes in Google Cloud Console, wait a few minutes for changes to propagate

### Error: "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen is not properly configured.

**Solution**:
1. Go to Google Cloud Console → APIs & Services → OAuth consent screen
2. Ensure all required fields are filled in
3. Add your test email to Test Users if using External user type
4. Verify scopes include: `openid`, `email`, `profile`

### Error: "403: access_denied"

**Problem**: The user denied permission or the app is not verified.

**Solution**:
1. For development: Add test users in OAuth consent screen
2. Click "Advanced" → "Go to [App Name] (unsafe)" during authorization
3. For production: Submit your app for verification

### Error: "invalid_client"

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
1. Verify credentials in Google Cloud Console
2. Re-copy Client ID and Client Secret to `.env` file
3. Restart the backend server
4. Clear browser cache and cookies

### Users See "This app isn't verified" Warning

**Expected for Development**: This is normal for apps in development/testing mode.

**For Users to Proceed**:
1. Click **Advanced**
2. Click **Go to [App Name] (unsafe)**
3. Review permissions and click **Allow**

**For Production**:
- Submit your app for verification through Google Cloud Console
- This process can take several weeks
- Required if you have >100 users

## Production Deployment

When deploying to production, you'll need to update:

### 1. Update OAuth Consent Screen
- Change authorized domains to your production domain
- Add production privacy policy and terms of service URLs
- Submit for verification if needed

### 2. Create Production OAuth Credentials
1. Create a new OAuth Client ID for production
2. Set Authorized redirect URIs to your production URL:
   - Example: `https://yourdomain.com/auth/callback`

### 3. Update Environment Variables
```bash
GOOGLE_CLIENT_ID=your-production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-production-client-secret
OAUTH_REDIRECT_URI=https://yourdomain.com/auth/callback
```

### 4. Security Best Practices
- Use environment variables or secret management service (AWS Secrets Manager, etc.)
- Never commit credentials to version control
- Rotate client secrets periodically
- Use HTTPS in production
- Implement rate limiting
- Monitor OAuth usage and errors

## OAuth Flow Diagram

```
User → Frontend → Click "Sign in with Google"
                ↓
Frontend → Backend → GET /api/auth/login
                   ↓
Backend → Returns Google OAuth URL
       ↓
Frontend → Redirects user to Google sign-in page
         ↓
Google → User signs in and authorizes
      ↓
Google → Redirects to http://localhost:5000/auth/callback?code=xxx
       ↓
Backend → Receives authorization code
        → Exchanges code for access token (POST to Google)
        → Fetches user info (GET to Google API)
        → Creates/updates user in database
        → Generates JWT token
        → Redirects to frontend with JWT token
         ↓
Frontend → Stores JWT token in localStorage
         → Makes authenticated requests with token
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Click "Sign in with Google" redirects to Google
- [ ] Can select Google account
- [ ] Can authorize permissions
- [ ] Redirects back to application
- [ ] User is logged in
- [ ] Can create data rooms
- [ ] Can upload files
- [ ] Token persists after page refresh
- [ ] Can logout

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [Google Sign-In Branding Guidelines](https://developers.google.com/identity/branding-guidelines)

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for errors
2. Check backend logs for errors
3. Verify all configuration matches exactly
4. Try clearing browser cache and cookies
5. Create a fresh OAuth client ID if needed

## Summary

You've successfully configured Google OAuth 2.0 for the Data Room application! Users can now sign in using their Google accounts, and you'll receive their basic profile information (email, name, profile picture) to create user accounts in your system.
