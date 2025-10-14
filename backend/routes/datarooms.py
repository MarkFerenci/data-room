"""Routes for Data Room CRUD operations."""

from flask import Blueprint, request, jsonify
from models import db, DataRoom, Folder
from auth_utils import login_required

datarooms_bp = Blueprint("datarooms", __name__)


@datarooms_bp.route("", methods=["GET"])
@login_required
def list_datarooms(current_user):
    """List all datarooms for the current user."""
    datarooms = DataRoom.query.filter_by(owner_id=current_user.id).order_by(DataRoom.created_at.desc()).all()
    return jsonify({
        "datarooms": [dr.to_dict(include_stats=True) for dr in datarooms]
    })


@datarooms_bp.route("", methods=["POST"])
@login_required
def create_dataroom(current_user):
    """Create a new dataroom."""
    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    dataroom = DataRoom(
        name=data["name"],
        description=data.get("description"),
        owner_id=current_user.id,
    )

    db.session.add(dataroom)
    db.session.commit()

    return jsonify({"dataroom": dataroom.to_dict()}), 201


@datarooms_bp.route("/<int:dataroom_id>", methods=["GET"])
@login_required
def get_dataroom(current_user, dataroom_id: int):
    """Get a specific dataroom."""
    dataroom = db.session.get(DataRoom, dataroom_id)

    if not dataroom:
        return jsonify({"error": "Dataroom not found"}), 404

    if dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"dataroom": dataroom.to_dict(include_stats=True)})


@datarooms_bp.route("/<int:dataroom_id>", methods=["PUT"])
@login_required
def update_dataroom(current_user, dataroom_id: int):
    """Update a dataroom."""
    dataroom = db.session.get(DataRoom, dataroom_id)

    if not dataroom:
        return jsonify({"error": "Dataroom not found"}), 404

    if dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json()

    if "name" in data:
        dataroom.name = data["name"]
    if "description" in data:
        dataroom.description = data["description"]

    db.session.commit()

    return jsonify({"dataroom": dataroom.to_dict()})


@datarooms_bp.route("/<int:dataroom_id>", methods=["DELETE"])
@login_required
def delete_dataroom(current_user, dataroom_id: int):
    """Delete a dataroom and all its contents."""
    dataroom = db.session.get(DataRoom, dataroom_id)

    if not dataroom:
        return jsonify({"error": "Dataroom not found"}), 404

    if dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    db.session.delete(dataroom)
    db.session.commit()

    return jsonify({"message": "Dataroom deleted successfully"})


@datarooms_bp.route("/<int:dataroom_id>/structure", methods=["GET"])
@login_required
def get_dataroom_structure(current_user, dataroom_id: int):
    """Get complete folder structure for a dataroom."""
    dataroom = db.session.get(DataRoom, dataroom_id)

    if not dataroom:
        return jsonify({"error": "Dataroom not found"}), 404

    if dataroom.owner_id != current_user.id:
        return jsonify({"error": "Access denied"}), 403

    # Get root folders (no parent)
    root_folders = Folder.query.filter_by(
        dataroom_id=dataroom_id,
        parent_id=None
    ).order_by(Folder.name).all()

    def build_tree(folder):
        """Recursively build folder tree."""
        folder_dict = folder.to_dict()
        children = Folder.query.filter_by(parent_id=folder.id).order_by(Folder.name).all()
        folder_dict["children"] = [build_tree(child) for child in children]
        folder_dict["files"] = [file.to_dict() for file in folder.files]
        return folder_dict

    structure = [build_tree(folder) for folder in root_folders]

    # Also include files at the root level (no folder)
    from models import File
    root_files = File.query.filter_by(
        dataroom_id=dataroom_id,
        folder_id=None
    ).order_by(File.name).all()

    return jsonify({
        "dataroom": dataroom.to_dict(),
        "structure": structure,
        "root_files": [file.to_dict() for file in root_files],
    })
