"""Vercel serverless function entry point for Flask app."""
import sys
from pathlib import Path

# Add backend directory to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import after adding to path
from app import create_app  # noqa: E402

# Create Flask app instance
app = create_app()
