"""Routes for Folder CRUD operations."""

import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app
from models import db, Folder, DataRoom
from auth_utils import login_required

folders_bp = Blueprint("folders", __name__)


def update_folder_path(folder: Folder) -> None:
    """Update folder path based on parent hierarchy."""
    if folder.parent_id:
        parent = db.session.get(Folder, folder.parent_id)
        folder.path = f"{parent.path}/{folder.name}"
    else:
        folder.path = f"/{folder.name}"

    # Update all children paths recursively
    for child in folder.children:
        update_folder_path(child)


@folders_bp.route("", methods=["POST"])
@login_required
def create_folder(current_user):
    """Create a new folder."""
    data = request.get_json()

    if not data or not data.get("name") or not data.get("dataroom_id"):
        return jsonify({"error": "Name and dataroom_id are required"}), 400

    # Verify dataroom access
    dataroom = db.session.get(DataRoom, data["dataroom_id"])
    if not dataroom or dataroom.owner_id != current_user.id:
        return jsonify({"error": "Invalid dataroom or access denied"}), 403

    # Verify parent folder if provided
    parent_id = data.get("parent_id")
    if parent_id:
        parent = db.session.get(Folder, parent_id)
        if not parent or parent.dataroom_id != dataroom.id:
            return jsonify({"error": "Invalid parent folder"}), 400

    # Check for duplicate name in same location
    existing = Folder.query.filter_by(
        dataroom_id=dataroom.id,
        parent_id=parent_id,
        name=data["name"]
    ).first()

    if existing:
        return jsonify({"error": "Folder with this name already exists in this location"}), 409

    folder = Folder(
        name=data["name"],
        parent_id=parent_id,
        dataroom_id=dataroom.id,
        path=""  # Will be set below
    )

    db.session.add(folder)
    db.session.flush()  # Get the ID

    # Update path
    update_folder_path(folder)
    db.session.commit()

    return jsonify({"folder": folder.to_dict()}), 201


@folders_bp.route("/<int:folder_id>", methods=["GET"])
@login_required
def get_folder(current_user, folder_id: int):
    """Get a specific folder with its contents."""
    folder = db.session.get(Folder, folder_id)

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    # Verify access through dataroom
    if folder.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"folder": folder.to_dict(include_children=True)})


@folders_bp.route("/<int:folder_id>", methods=["PUT"])
@login_required
def update_folder(current_user, folder_id: int):
    """Update a folder name."""
    folder = db.session.get(Folder, folder_id)

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    if folder.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    if "name" in data:
        # Check for duplicate name
        existing = Folder.query.filter_by(
            dataroom_id=folder.dataroom_id,
            parent_id=folder.parent_id,
            name=data["name"]
        ).filter(Folder.id != folder.id).first()

        if existing:
            return jsonify({"error": "Folder with this name already exists in this location"}), 409

        folder.name = data["name"]
        update_folder_path(folder)

    db.session.commit()

    return jsonify({"folder": folder.to_dict()})


def delete_physical_files_recursive(folder: Folder, upload_folder: Path) -> None:
    """Recursively delete all physical files in a folder and its subfolders."""
    # Delete files in this folder
    for file in folder.files:
        file_path = upload_folder / file.file_path
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception as e:
                current_app.logger.warning(f"Failed to delete file {file_path}: {e}")

    # Recursively delete files in child folders
    for child in folder.children:
        delete_physical_files_recursive(child, upload_folder)


@folders_bp.route("/<int:folder_id>", methods=["DELETE"])
@login_required
def delete_folder(current_user, folder_id: int):
    """Delete a folder and all its contents (nested folders and files)."""
    folder = db.session.get(Folder, folder_id)

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    if folder.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    # Delete all physical files recursively before deleting database records
    upload_folder = Path(current_app.config["UPLOAD_FOLDER"])
    delete_physical_files_recursive(folder, upload_folder)

    # Delete folder (cascade will handle database cleanup of children and files)
    db.session.delete(folder)
    db.session.commit()

    return jsonify({"message": "Folder and all its contents deleted successfully"})


@folders_bp.route("/<int:folder_id>/contents", methods=["GET"])
@login_required
def get_folder_contents(current_user, folder_id: int):
    """Get immediate contents of a folder (non-recursive)."""
    folder = db.session.get(Folder, folder_id)

    if not folder:
        return jsonify({"error": "Folder not found"}), 404

    if folder.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    # Get child folders
    child_folders = Folder.query.filter_by(parent_id=folder.id).order_by(Folder.name).all()

    # Get files in this folder
    files = folder.files

    return jsonify({
        "folder": folder.to_dict(),
        "folders": [f.to_dict() for f in child_folders],
        "files": [f.to_dict() for f in files],
    })
