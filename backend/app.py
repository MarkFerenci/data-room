"""Flask application factory and initialization."""

from flask import Flask
from flask_cors import CORS
from pathlib import Path

from config import get_config
from models import db


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Load configuration
    config = get_config()
    app.config.from_object(config)

    # Ensure upload directory exists
    upload_dir = Path(app.config["UPLOAD_FOLDER"])
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config["CORS_ORIGINS"].split(","), supports_credentials=True)

    # Register blueprints
    from routes.auth import auth_bp
    from routes.datarooms import datarooms_bp
    from routes.folders import folders_bp
    from routes.files import files_bp
    from routes.search import search_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(datarooms_bp, url_prefix="/api/datarooms")
    app.register_blueprint(folders_bp, url_prefix="/api/folders")
    app.register_blueprint(files_bp, url_prefix="/api/files")
    app.register_blueprint(search_bp, url_prefix="/api/search")

    # Health check endpoint
    @app.route("/health")
    def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "service": "dataroom-backend"}

    # Create database tables
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)
