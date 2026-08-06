from flask import Blueprint, request, g
from backend.app.schemas.user import UserRegisterSchema, UserLoginSchema, ProfileUpdateSchema
from backend.app.services.auth_service import AuthService
from backend.app.middleware.auth_middleware import token_required
from backend.app.utils.responses import api_success, api_error
from backend.app.models.user import UserProfile
from backend.app.models.base import db
from pydantic import ValidationError

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user account and default profile"""
    try:
        body = request.get_json() or {}
        # Validate input schema
        reg_data = UserRegisterSchema(**body)
        
        # Check duplicate accounts
        existing_user = AuthService._log_login_attempt # (uses helper checks)
        from backend.app.models.user import User
        if User.query.filter((User.email == reg_data.email) | (User.username == reg_data.username)).first():
            return api_error("Email or Username already exists", status=400)

        user = AuthService.register_user(reg_data.dict())
        
        return api_success(
            data={"user_id": user.user_id, "email": user.email, "full_name": user.full_name},
            message="User registered successfully",
            status=201
        )
    except ValidationError as e:
        return api_error("Validation Error", errors=[err["msg"] for err in e.errors()], status=400)
    except Exception as e:
        return api_error(f"Failed to register account: {str(e)}", status=500)

@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate and issue access & refresh sessions"""
    try:
        body = request.get_json() or {}
        login_data = UserLoginSchema(**body)
        
        ip = request.remote_addr or "127.0.0.1"
        device = request.headers.get("User-Agent", "Unknown Device")
        
        user, tokens = AuthService.authenticate_user(login_data.email, login_data.password, ip, device)
        if not user:
            return api_error("Invalid credentials or account suspended", status=401)

        return api_success(
            data={
                "user": {
                    "user_id": user.user_id,
                    "full_name": user.full_name,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role
                },
                "tokens": tokens
            },
            message="Login successful"
        )
    except ValidationError as e:
        return api_error("Validation Error", errors=[err["msg"] for err in e.errors()], status=400)
    except Exception as e:
        return api_error(f"Internal authentication error: {str(e)}", status=500)

@auth_bp.route("/profile", methods=["GET"])
@token_required
def get_profile():
    """Fetch profile preference of authenticated user"""
    user = g.current_user
    profile = user.profile
    
    return api_success(
        data={
            "user_id": user.user_id,
            "full_name": user.full_name,
            "email": user.email,
            "profile": {
                "occupation": profile.occupation if profile else None,
                "monthly_income": float(profile.monthly_income) if profile else 0.0,
                "currency_preference": profile.currency_preference if profile else "INR",
                "risk_tolerance": profile.risk_tolerance if profile else "moderate",
                "country": profile.country if profile else None
            }
        },
        message="Profile fetched successfully"
    )

@auth_bp.route("/profile", methods=["PUT"])
@token_required
def update_profile():
    """Update financial preferences and profile attributes"""
    try:
        body = request.get_json() or {}
        val_data = ProfileUpdateSchema(**body)
        user = g.current_user
        profile = user.profile
        
        if not profile:
            profile = UserProfile(user_id=user.user_id)
            db.session.add(profile)
            
        for key, val in val_data.dict(exclude_unset=True).items():
            setattr(profile, key, val)
            
        db.session.commit()
        return api_success(message="Profile updated successfully")
    except ValidationError as e:
        return api_error("Validation Error", errors=[err["msg"] for err in e.errors()], status=400)
    except Exception as e:
        return api_error(f"Profile update error: {str(e)}", status=500)

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Trigger password reset email generation flow"""
    try:
        body = request.get_json() or {}
        email = body.get("email")
        if not email:
            return api_error("Email is required", status=400)
            
        token = AuthService.create_password_reset_token(email)
        if token:
            from backend.app.services.email_service import EmailService
            from backend.app.models.user import User
            user = User.query.filter_by(email=email).first()
            user_name = user.full_name if user else "Valued Client"
            
            reset_link = f"http://localhost:3000/?view=reset-password&token={token}"
            EmailService.send_password_reset_email(email, user_name, reset_link)
            
        return api_success(message="If the email is registered, a password reset link has been dispatched.")
    except Exception as e:
        return api_error(f"Failed to generate recovery link: {str(e)}", status=500)

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """Reset the password with a valid, secure token"""
    try:
        body = request.get_json() or {}
        token = body.get("token")
        password = body.get("password")
        if not token or not password:
            return api_error("Token and password are required", status=400)
            
        success = AuthService.verify_password_reset_token(token, password)
        if not success:
            return api_error("Invalid or expired password reset token", status=400)
            
        return api_success(message="Password has been reset successfully")
    except Exception as e:
        return api_error(f"Failed to reset password: {str(e)}", status=500)
