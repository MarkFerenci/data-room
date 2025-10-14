# Quick Start: Google OAuth Setup

## 🚀 5-Minute Setup Guide

### Step 1: Google Cloud Console (2 minutes)
1. Go to https://console.cloud.google.com/
2. Create new project: **"Data Room"**
3. Go to **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: **Data Room**
   - Add your email
   - Scopes: `openid`, `email`, `profile`
   - Add test users: your email
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Type: **Web application**
   - Redirect URI: `http://localhost:5000/auth/callback`
   - **Copy Client ID and Secret** ✅

### Step 2: Backend Configuration (1 minute)
```bash
cd backend
nano .env
```

Update these lines:
```bash
GOOGLE_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste-your-client-secret-here
```

Save and exit (Ctrl+O, Enter, Ctrl+X)

### Step 3: Start the Application (2 minutes)

**Terminal 1 - Backend:**
```bash
cd backend
uv run python app.py
```

**Terminal 2 - Frontend:**
```bash
cd ui
npm run dev
```

### Step 4: Test (30 seconds)
1. Open http://localhost:5000
2. Click **"Sign in with Google"**
3. Select your Google account
4. Click **"Advanced"** → **"Go to Data Room (unsafe)"** (expected for dev)
5. Click **"Allow"**
6. ✅ You're logged in!

---

## 🔧 Troubleshooting

### ❌ "redirect_uri_mismatch"
**Fix**: Ensure redirect URI in Google Console matches **exactly**:
```
http://localhost:5000/auth/callback
```

### ❌ "Access blocked: This app's request is invalid"
**Fix**: Add your email to **Test Users** in OAuth consent screen

### ❌ "invalid_client"
**Fix**: Double-check Client ID and Secret in `.env` file, restart backend

---

## 📋 Checklist

Backend `.env` updated:
- [ ] `GOOGLE_CLIENT_ID` set
- [ ] `GOOGLE_CLIENT_SECRET` set

Google Cloud Console:
- [ ] OAuth consent screen configured
- [ ] Test users added
- [ ] OAuth Client ID created
- [ ] Redirect URI: `http://localhost:5000/auth/callback`

Testing:
- [ ] Backend running on port 5001
- [ ] Frontend running on port 5000
- [ ] Can click "Sign in with Google"
- [ ] Successfully authenticated
- [ ] Can create data rooms

---

## 🎯 What Changed from GitHub OAuth?

| Aspect | GitHub (Old) | Google (New) |
|--------|--------------|--------------|
| Button Text | "Sign in with GitHub" | "Sign in with Google" |
| Auth URL | github.com/login/oauth | accounts.google.com/o/oauth2 |
| Token URL | github.com/login/oauth/access_token | oauth2.googleapis.com/token |
| User API | api.github.com/user | googleapis.com/oauth2/v2/userinfo |
| Scopes | `user:email` | `openid email profile` |
| Provider | `oauth_provider='github'` | `oauth_provider='google'` |

---

## 📚 Full Documentation

For detailed setup instructions, see:
- **GOOGLE_OAUTH_SETUP.md** - Complete setup guide
- **MIGRATION_SUMMARY.md** - Technical changes
- **README.md** - Project overview

---

## 🆘 Need Help?

1. Check browser console for errors
2. Check backend terminal for errors
3. Verify `.env` file has correct credentials
4. Clear browser cache/cookies and try again
5. Refer to full documentation above

---

**That's it! You're ready to use Google Sign-In! 🎉**
