"""Authentication utilities and decorators."""

from functools import wraps
from flask import request, jsonify, current_app
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Callable, Any

from models import db, User


def create_jwt_token(user_id: int) -> str:
    """Create JWT token for user."""
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["SECRET_KEY"], algorithm="HS256")


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode JWT token and return payload."""
    try:
        payload = jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_current_user() -> Optional[User]:
    """Get current user from JWT token."""
    auth_header = request.headers.get("Authorization")
    print(f"[Auth] Authorization header: {auth_header}")
    if not auth_header or not auth_header.startswith("Bearer "):
        print("[Auth] No valid authorization header")
        return None

    token = auth_header.split(" ")[1]
    print(f"[Auth] Decoding token: {token[:20]}...")
    payload = decode_jwt_token(token)
    if not payload:
        print("[Auth] Token decode failed")
        return None

    print(f"[Auth] Token payload: {payload}")
    user = db.session.get(User, payload["user_id"])
    print(f"[Auth] User found: {user.email if user else None}")
    return user


def login_required(f: Callable) -> Callable:
    """Decorator to require authentication for routes."""
    @wraps(f)
    def decorated_function(*args: Any, **kwargs: Any) -> Any:
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs, current_user=user)
    return decorated_function
