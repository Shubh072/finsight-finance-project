import jwt
from functools import wraps
from flask import request, jsonify, g
from backend.app.config.settings import Config
from backend.app.models.user import User, UserSession

def token_required(f):
    """Decorator to assert a valid JWT is present on the HTTP request headers"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Parse bearer token header
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({
                "success": False,
                "message": "Access token is missing or malformed",
                "status": 401
            }), 401

        try:
            # Decode JWT
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
            user_id = payload["sub"]
            
            # Look up active user session
            user = User.query.filter_by(user_id=user_id, deleted_at=None).first()
            if not user or user.account_status != "active":
                raise ValueError("User account is inactive or deleted")

            # Attach user to global request context
            g.current_user = user
            g.token_payload = payload

        except jwt.ExpiredSignatureError:
            return jsonify({
                "success": False,
                "message": "Token has expired",
                "status": 401
            }), 401
        except (jwt.InvalidTokenError, ValueError) as e:
            return jsonify({
                "success": False,
                "message": f"Unauthorized access credentials: {str(e)}",
                "status": 401
            }), 401

        return f(*args, **kwargs)
    return decorated

def roles_allowed(*roles):
    """Role based authorization assertion middleware"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, "current_user") or g.current_user.role not in roles:
                return jsonify({
                    "success": False,
                    "message": "Access denied: insufficient permission roles",
                    "status": 403
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
