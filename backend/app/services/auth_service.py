import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Tuple
from backend.app.config.settings import Config
from backend.app.models.user import User, UserProfile, UserSession, LoginHistory
from backend.app.models.base import db

class AuthService:
    """Enterprise authentication and session orchestration layer"""

    @staticmethod
    def hash_password(password: str) -> str:
        """Create a secure bcrypt password hash"""
        salt = bcrypt.gensalt(rounds=12)
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def check_password(password: str, hashed: str) -> bool:
        """Verify the password against its bcrypt hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

    @classmethod
    def register_user(cls, data: dict) -> User:
        """Create a new user and corresponding financial profile"""
        hashed_pwd = cls.hash_password(data["password"])
        
        user = User(
            full_name=data["full_name"],
            username=data["username"],
            email=data["email"],
            password_hash=hashed_pwd,
            phone=data.get("phone"),
            role="user"
        )
        db.session.add(user)
        db.session.flush() # Obtain user_id before commit

        profile = UserProfile(
            user_id=user.user_id,
            monthly_income=0.00,
            currency_preference="INR",
            risk_tolerance="moderate"
        )
        db.session.add(profile)
        db.session.commit()
        return user

    @classmethod
    def authenticate_user(cls, email: str, password: str, ip: str, device: str) -> Tuple[Optional[User], Optional[dict]]:
        """Validate credentials, log audit trails, and return access/refresh sessions"""
        user = User.query.filter_by(email=email, deleted_at=None).first()
        
        if not user:
            return None, None

        if user.account_status in ["suspended", "deleted"]:
            cls._log_login_attempt(user.user_id, ip, device, "failed", f"Account status is {user.account_status}")
            return None, None

        if not cls.check_password(password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.account_status = "suspended"
            db.session.add(user)
            db.session.commit()
            
            cls._log_login_attempt(user.user_id, ip, device, "failed", "Invalid password credential")
            return None, None

        # Reset login failures & track last login
        user.failed_login_attempts = 0
        user.last_login = datetime.utcnow()
        db.session.add(user)
        
        # Issue sessions tokens
        tokens = cls.create_session(user.user_id, ip, device)
        cls._log_login_attempt(user.user_id, ip, device, "success")
        
        db.session.commit()
        return user, tokens

    @classmethod
    def create_session(cls, user_id: int, ip_address: str, device_info: str) -> dict:
        """Generate JWT access and refresh tokens, and cache session hashes in MySQL"""
        now = datetime.utcnow()
        
        access_expiry = now + Config.JWT_ACCESS_TOKEN_EXPIRES
        refresh_expiry = now + Config.JWT_REFRESH_TOKEN_EXPIRES

        access_payload = {
            "sub": user_id,
            "exp": access_expiry,
            "iat": now,
            "type": "access"
        }
        refresh_payload = {
            "sub": user_id,
            "exp": refresh_expiry,
            "iat": now,
            "type": "refresh"
        }

        access_token = jwt.encode(access_payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)
        refresh_token = jwt.encode(refresh_payload, Config.SECRET_KEY, algorithm=Config.JWT_ALGORITHM)

        # Record active session in DB for audit & revocation controls
        session = UserSession(
            user_id=user_id,
            session_token=cls._hash_token(access_token),
            refresh_token=cls._hash_token(refresh_token),
            device_info=device_info,
            ip_address=ip_address,
            expires_at=refresh_expiry,
            is_active=True
        )
        db.session.add(session)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "Bearer",
            "expires_in": int(Config.JWT_ACCESS_TOKEN_EXPIRES.total_seconds())
        }

    @staticmethod
    def _hash_token(token: str) -> str:
        """Generate standard SHA-256 hash to encrypt tokens at rest in MySQL"""
        import hashlib
        return hashlib.sha256(token.encode('utf-8')).hexdigest()

    @classmethod
    def create_password_reset_token(cls, email: str) -> Optional[str]:
        """Generate a cryptographically secure token, hash and store it, and return plain token"""
        user = User.query.filter_by(email=email).first()
        if not user:
            return None
            
        import secrets
        import hashlib
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        # Invalidate old active tokens
        from backend.app.models.user import PasswordResetToken
        PasswordResetToken.query.filter_by(user_id=user.user_id, used=False).update({"used": True})
        
        db_token = PasswordResetToken(
            user_id=user.user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            used=False
        )
        db.session.add(db_token)
        db.session.commit()
        return token

    @classmethod
    def verify_password_reset_token(cls, token: str, new_password: str) -> bool:
        """Verify the plain token, reset user's password if valid and not expired"""
        import hashlib
        token_hash = hashlib.sha256(token.encode('utf-8')).hexdigest()
        
        from backend.app.models.user import PasswordResetToken
        db_token = PasswordResetToken.query.filter_by(token_hash=token_hash, used=False).first()
        if not db_token:
            return False
            
        if db_token.expires_at < datetime.utcnow():
            return False
            
        # Valid token! Reset password
        user = User.query.get(db_token.user_id)
        if not user:
            return False
            
        user.password_hash = cls.hash_password(new_password)
        db_token.used = True
        
        db.session.add(user)
        db.session.add(db_token)
        db.session.commit()
        return True

    @staticmethod
    def _log_login_attempt(user_id: int, ip: str, device: str, status: str, reason: str = None):
        """Append immutable record to security login history table"""
        history = LoginHistory(
            user_id=user_id,
            ip_address=ip,
            device_info=device,
            login_status=status,
            failure_reason=reason
        )
        db.session.add(history)
