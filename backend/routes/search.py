"""Routes for search functionality."""

from flask import Blueprint, request, jsonify
from sqlalchemy import or_
from models import db, File, Folder, DataRoom
from auth_utils import login_required

search_bp = Blueprint("search", __name__)


@search_bp.route("", methods=["GET"])
@login_required
def search_files(current_user):
    """Search files and folders by name and/or content."""
    query = request.args.get("q", "").strip()
    dataroom_id = request.args.get("dataroom_id", type=int)
    search_names = request.args.get("search_names", "true").lower() == "true"
    search_content = request.args.get("search_content", "true").lower() == "true"
    case_insensitive = request.args.get("case_insensitive", "true").lower() == "true"

    if not query:
        return jsonify({"error": "Search query is required"}), 400

    # At least one search type must be selected
    if not search_names and not search_content:
        return jsonify({"error": "At least one search type must be selected"}), 400

    # Base query - files in datarooms owned by current user
    files_query = File.query.join(DataRoom).filter(DataRoom.owner_id == current_user.id)

    # Base query - folders in datarooms owned by current user
    folders_query = Folder.query.join(DataRoom).filter(DataRoom.owner_id == current_user.id)

    # Filter by dataroom if provided
    if dataroom_id:
        dataroom = db.session.get(DataRoom, dataroom_id)
        if not dataroom or dataroom.owner_id != current_user.id:
            return jsonify({"error": "Invalid dataroom"}), 400
        files_query = files_query.filter(File.dataroom_id == dataroom_id)
        folders_query = folders_query.filter(Folder.dataroom_id == dataroom_id)

    # Search in filename and/or content for files based on filters
    search_pattern = f"%{query}%"
    file_conditions = []
    
    if search_names:
        if case_insensitive:
            file_conditions.append(File.name.ilike(search_pattern))
        else:
            file_conditions.append(File.name.like(search_pattern))
    
    if search_content:
        if case_insensitive:
            file_conditions.append(File.content_text.ilike(search_pattern))
        else:
            file_conditions.append(File.content_text.like(search_pattern))
    
    if file_conditions:
        files_query = files_query.filter(or_(*file_conditions))
    else:
        # If no file search conditions, return no files
        files_query = files_query.filter(False)

    # Search in folder name only if name search is enabled
    if search_names:
        if case_insensitive:
            folders_query = folders_query.filter(Folder.name.ilike(search_pattern))
        else:
            folders_query = folders_query.filter(Folder.name.like(search_pattern))
    else:
        # If name search is disabled, return no folders
        folders_query = folders_query.filter(False)

    # Execute queries with limits
    files = files_query.order_by(File.name).limit(50).all()
    folders = folders_query.order_by(Folder.name).limit(50).all()

    # Format results with dataroom and folder context
    results = []
    
    # Add file results
    for file in files:
        file_dict = file.to_dict()
        file_dict["type"] = "file"
        
        # Determine match type
        query_lower = query.lower()
        matches_name = query_lower in file.name.lower()
        matches_content = file.content_text and query_lower in file.content_text.lower()
        
        file_dict["match_type"] = []
        if matches_name and search_names:
            file_dict["match_type"].append("name")
        if matches_content and search_content:
            file_dict["match_type"].append("content")
        
        file_dict["dataroom"] = {
            "id": file.dataroom.id,
            "name": file.dataroom.name,
        }
        if file.folder:
            file_dict["folder"] = {
                "id": file.folder.id,
                "name": file.folder.name,
                "path": file.folder.path,
            }
        else:
            file_dict["folder"] = None
        results.append(file_dict)

    # Add folder results
    for folder in folders:
        folder_dict = folder.to_dict()
        folder_dict["type"] = "folder"
        folder_dict["match_type"] = ["name"]  # Folders only match by name
        folder_dict["dataroom"] = {
            "id": folder.dataroom.id,
            "name": folder.dataroom.name,
        }
        if folder.parent:
            folder_dict["parent_folder"] = {
                "id": folder.parent.id,
                "name": folder.parent.name,
                "path": folder.parent.path,
            }
        else:
            folder_dict["parent_folder"] = None
        results.append(folder_dict)

    # Sort results by name
    results.sort(key=lambda x: x["name"].lower())

    return jsonify({
        "query": query,
        "count": len(results),
        "files_count": len(files),
        "folders_count": len(folders),
        "results": results,
    })


@search_bp.route("/autocomplete", methods=["GET"])
@login_required
def autocomplete(current_user):
    """Autocomplete search suggestions based on filenames."""
    query = request.args.get("q", "").strip()
    dataroom_id = request.args.get("dataroom_id", type=int)

    if not query or len(query) < 2:
        return jsonify({"suggestions": []})

    # Base query
    files_query = File.query.join(DataRoom).filter(DataRoom.owner_id == current_user.id)

    # Filter by dataroom
    if dataroom_id:
        files_query = files_query.filter(File.dataroom_id == dataroom_id)

    # Match filenames
    search_pattern = f"%{query}%"
    files = files_query.filter(File.name.ilike(search_pattern)).limit(10).all()

    suggestions = [{"id": f.id, "name": f.name} for f in files]

    return jsonify({"suggestions": suggestions})
