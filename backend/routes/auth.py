"""Authentication routes for OAuth 2.0."""

from flask import Blueprint, request, jsonify, current_app, redirect
import requests
from models import db, User
from auth_utils import create_jwt_token, get_current_user

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET"])
def login():
    """Initiate OAuth login with Google."""
    client_id = current_app.config["GOOGLE_CLIENT_ID"]
    redirect_uri = current_app.config["OAUTH_REDIRECT_URI"]

    if not client_id:
        return jsonify({"error": "OAuth not configured"}), 500

    # Google OAuth authorization URL
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=online"
        f"&prompt=select_account"
    )

    return jsonify({"auth_url": google_auth_url})


@auth_bp.route("/callback", methods=["GET"])
def oauth_callback():
    """Handle OAuth callback from Google."""
    print("[OAuth] Callback received")
    code = request.args.get("code")
    print(f"[OAuth] Code: {code[:20] if code else 'None'}...")
    if not code:
        return jsonify({"error": "No authorization code provided"}), 400

    client_id = current_app.config["GOOGLE_CLIENT_ID"]
    client_secret = current_app.config["GOOGLE_CLIENT_SECRET"]
    redirect_uri = current_app.config["OAUTH_REDIRECT_URI"]

    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": redirect_uri,
    }
    token_headers = {"Content-Type": "application/x-www-form-urlencoded"}

    token_response = requests.post(token_url, data=token_data, headers=token_headers)
    token_json = token_response.json()

    if "access_token" not in token_json:
        return jsonify({"error": "Failed to get access token"}), 400

    access_token = token_json["access_token"]

    # Get user info from Google
    user_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    user_headers = {"Authorization": f"Bearer {access_token}"}
    user_response = requests.get(user_url, headers=user_headers)
    user_data = user_response.json()

    if "email" not in user_data:
        return jsonify({"error": "Could not retrieve email from Google"}), 400

    # Create or update user
    user = User.query.filter_by(oauth_provider="google", oauth_id=str(user_data["id"])).first()

    if not user:
        user = User(
            email=user_data["email"],
            name=user_data.get("name", user_data["email"]),
            oauth_provider="google",
            oauth_id=str(user_data["id"]),
            avatar_url=user_data.get("picture"),
        )
        db.session.add(user)
    else:
        # Update user info
        user.email = user_data["email"]
        user.name = user_data.get("name", user_data["email"])
        user.avatar_url = user_data.get("picture")

    db.session.commit()

    # Create JWT token
    jwt_token = create_jwt_token(user.id)
    print(f"[OAuth] Created JWT for user {user.id}: {jwt_token[:20]}...")

    # Redirect to frontend with token
    frontend_url = current_app.config["CORS_ORIGINS"].split(",")[0]
    redirect_url = f"{frontend_url}/auth/callback?token={jwt_token}"
    print(f"[OAuth] Redirecting to: {redirect_url}")
    return redirect(redirect_url)


@auth_bp.route("/me", methods=["GET"])
def get_current_user_info():
    """Get current authenticated user information."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401

    return jsonify({"user": user.to_dict()})


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Logout user (client-side token removal)."""
    return jsonify({"message": "Logged out successfully"})
