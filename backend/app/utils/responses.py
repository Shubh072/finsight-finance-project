from flask import jsonify, Response
from typing import Any, Optional, List

def api_success(data: Any = None, message: str = "Request completed successfully", status: int = 200) -> Response:
    """Format and deliver standard FinSight system API success payloads"""
    response_payload = {
        "success": True,
        "message": message,
        "data": data or {},
        "status": status
    }
    return jsonify(response_payload), status

def api_error(message: str = "An error occurred", errors: Optional[List[str]] = None, status: int = 400) -> Response:
    """Format and deliver standard FinSight system API error payload"""
    response_payload = {
        "success": False,
        "message": message,
        "errors": errors or [],
        "status": status
    }
    return jsonify(response_payload), status
