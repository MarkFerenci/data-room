"""Database initialization and models."""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

# Initialize SQLAlchemy
db = SQLAlchemy()


def get_utc_now() -> datetime:
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


class User(db.Model):
    """User model for authentication."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(255), nullable=True)
    oauth_provider = db.Column(db.String(50), nullable=False)  # 'github', 'google', etc.
    oauth_id = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=get_utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    datarooms = db.relationship("DataRoom", back_populates="owner", cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint("oauth_provider", "oauth_id", name="unique_oauth_user"),
    )

    def to_dict(self) -> dict:
        """Convert user to dictionary."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "avatar_url": self.avatar_url,
            "created_at": self.created_at.isoformat(),
        }


class DataRoom(db.Model):
    """Data Room model - top-level container for documents."""

    __tablename__ = "datarooms"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=get_utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    owner = db.relationship("User", back_populates="datarooms")
    folders = db.relationship("Folder", back_populates="dataroom", cascade="all, delete-orphan")
    files = db.relationship("File", back_populates="dataroom", cascade="all, delete-orphan")

    def to_dict(self, include_stats: bool = False) -> dict:
        """Convert dataroom to dictionary."""
        result = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if include_stats:
            result["stats"] = {
                "total_folders": len(self.folders),
                "total_files": len(self.files),
            }
        return result


class Folder(db.Model):
    """Folder model - hierarchical folder structure."""

    __tablename__ = "folders"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True, index=True)
    dataroom_id = db.Column(db.Integer, db.ForeignKey("datarooms.id"), nullable=False, index=True)
    path = db.Column(db.String(1000), nullable=False, index=True)  # For efficient querying
    created_at = db.Column(db.DateTime, default=get_utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    dataroom = db.relationship("DataRoom", back_populates="folders")
    parent = db.relationship(
        "Folder",
        remote_side=[id],
        backref=db.backref("children", cascade="all, delete-orphan")
    )
    files = db.relationship("File", back_populates="folder", cascade="all, delete-orphan")

    __table_args__ = (
        db.UniqueConstraint("dataroom_id", "parent_id", "name", name="unique_folder_per_parent"),
    )

    def to_dict(self, include_children: bool = False) -> dict:
        """Convert folder to dictionary."""
        result = {
            "id": self.id,
            "name": self.name,
            "parent_id": self.parent_id,
            "dataroom_id": self.dataroom_id,
            "path": self.path,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
        if include_children:
            result["children"] = [child.to_dict() for child in self.children]
            result["files"] = [file.to_dict() for file in self.files]
        return result


class File(db.Model):
    """File model - stores file metadata and path."""

    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    folder_id = db.Column(db.Integer, db.ForeignKey("folders.id"), nullable=True, index=True)
    dataroom_id = db.Column(db.Integer, db.ForeignKey("datarooms.id"), nullable=False, index=True)
    file_path = db.Column(db.String(500), nullable=False)  # Relative path on disk
    file_size = db.Column(db.BigInteger, nullable=False)  # Size in bytes
    mime_type = db.Column(db.String(100), default="application/pdf", nullable=False)
    content_text = db.Column(db.Text, nullable=True)  # Extracted text for search
    created_at = db.Column(db.DateTime, default=get_utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    dataroom = db.relationship("DataRoom", back_populates="files")
    folder = db.relationship("Folder", back_populates="files")

    # Note: For better search performance, enable pg_trgm extension:
    # CREATE EXTENSION IF NOT EXISTS pg_trgm;
    # Then add GIN index: CREATE INDEX idx_file_search ON files USING gin(name gin_trgm_ops, content_text gin_trgm_ops);

    def to_dict(self) -> dict:
        """Convert file to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "original_name": self.original_name,
            "folder_id": self.folder_id,
            "dataroom_id": self.dataroom_id,
            "file_size": self.file_size,
            "mime_type": self.mime_type,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }
