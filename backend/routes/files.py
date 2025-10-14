"""Routes for File CRUD operations and upload."""

import os
from pathlib import Path
from flask import Blueprint, request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from models import db, File, DataRoom, Folder
from auth_utils import login_required

files_bp = Blueprint("files", __name__)


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed."""
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]


def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        reader = PdfReader(file_path)
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return "\n".join(text_parts)
    except Exception as e:
        current_app.logger.warning(f"Failed to extract text from PDF: {e}")
        return ""


def get_unique_filename(dataroom_id: int, folder_id: int, original_name: str) -> str:
    """Generate unique filename if duplicate exists."""
    name, ext = os.path.splitext(original_name)

    # Check for existing files with same name
    query = File.query.filter_by(
        dataroom_id=dataroom_id,
        folder_id=folder_id,
        name=original_name
    )

    if query.first():
        # Generate name with counter
        counter = 1
        while True:
            new_name = f"{name} ({counter}){ext}"
            if not File.query.filter_by(
                dataroom_id=dataroom_id,
                folder_id=folder_id,
                name=new_name
            ).first():
                return new_name
            counter += 1

    return original_name


@files_bp.route("", methods=["POST"])
@login_required
def upload_file(current_user):
    """Upload a file to a dataroom."""
    # Check if file is in request
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    # Get dataroom_id and folder_id from form data
    dataroom_id = request.form.get("dataroom_id", type=int)
    folder_id = request.form.get("folder_id", type=int)

    if not dataroom_id:
        return jsonify({"error": "dataroom_id is required"}), 400

    # Verify dataroom access
    dataroom = db.session.get(DataRoom, dataroom_id)
    if not dataroom or dataroom.owner_id != current_user.id:
        return jsonify({"error": "Invalid dataroom or access denied"}), 403

    # Verify folder if provided
    if folder_id:
        folder = db.session.get(Folder, folder_id)
        if not folder or folder.dataroom_id != dataroom_id:
            return jsonify({"error": "Invalid folder"}), 400

    # Generate unique filename if needed
    original_name = secure_filename(file.filename)
    unique_name = get_unique_filename(dataroom_id, folder_id, original_name)

    # Create dataroom-specific directory
    upload_dir = Path(current_app.config["UPLOAD_FOLDER"]) / str(dataroom_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file with unique ID-based name to avoid conflicts
    import uuid
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(unique_name)[1]
    disk_filename = f"{file_id}{file_ext}"
    file_path = upload_dir / disk_filename

    file.save(str(file_path))

    # Get file size
    file_size = file_path.stat().st_size

    # Extract text for search
    content_text = extract_pdf_text(str(file_path))

    # Create file record
    file_record = File(
        name=unique_name,
        original_name=original_name,
        folder_id=folder_id,
        dataroom_id=dataroom_id,
        file_path=f"{dataroom_id}/{disk_filename}",
        file_size=file_size,
        mime_type="application/pdf",
        content_text=content_text,
    )

    db.session.add(file_record)
    db.session.commit()

    return jsonify({"file": file_record.to_dict()}), 201


@files_bp.route("/<int:file_id>", methods=["GET"])
@login_required
def get_file_info(current_user, file_id: int):
    """Get file metadata."""
    file = db.session.get(File, file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    if file.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"file": file.to_dict()})


@files_bp.route("/<int:file_id>/download", methods=["GET"])
@login_required
def download_file(current_user, file_id: int):
    """Download a file."""
    file = db.session.get(File, file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    if file.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    file_path = Path(current_app.config["UPLOAD_FOLDER"]) / file.file_path

    if not file_path.exists():
        return jsonify({"error": "File not found on disk"}), 404

    return send_file(
        str(file_path),
        mimetype=file.mime_type,
        as_attachment=True,
        download_name=file.name
    )


@files_bp.route("/<int:file_id>", methods=["PUT"])
@login_required
def update_file(current_user, file_id: int):
    """Update file metadata (rename)."""
    file = db.session.get(File, file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    if file.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    if "name" in data:
        new_name = data["name"]

        # Ensure it has .pdf extension
        if not new_name.lower().endswith(".pdf"):
            new_name += ".pdf"

        # Check for duplicate
        existing = File.query.filter_by(
            dataroom_id=file.dataroom_id,
            folder_id=file.folder_id,
            name=new_name
        ).filter(File.id != file.id).first()

        if existing:
            return jsonify({"error": "File with this name already exists in this location"}), 409

        file.name = new_name

    if "folder_id" in data:
        # Move file to different folder
        new_folder_id = data["folder_id"]

        if new_folder_id:
            folder = db.session.get(Folder, new_folder_id)
            if not folder or folder.dataroom_id != file.dataroom_id:
                return jsonify({"error": "Invalid folder"}), 400

        file.folder_id = new_folder_id

    db.session.commit()

    return jsonify({"file": file.to_dict()})


@files_bp.route("/<int:file_id>", methods=["DELETE"])
@login_required
def delete_file(current_user, file_id: int):
    """Delete a file."""
    file = db.session.get(File, file_id)

    if not file:
        return jsonify({"error": "File not found"}), 404

    if file.dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    # Delete file from disk
    file_path = Path(current_app.config["UPLOAD_FOLDER"]) / file.file_path
    if file_path.exists():
        file_path.unlink()

    # Delete database record
    db.session.delete(file)
    db.session.commit()

    return jsonify({"message": "File deleted successfully"})
