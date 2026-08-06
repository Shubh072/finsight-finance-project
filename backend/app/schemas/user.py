from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date

class UserRegisterSchema(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None

    @validator("password")
    def validate_password_strength(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

class ProfileUpdateSchema(BaseModel):
    date_of_birth: Optional[date] = None
    occupation: Optional[str] = Field(None, max_length=100)
    monthly_income: Optional[float] = Field(None, ge=0.0)
    currency_preference: Optional[str] = Field(None, min_length=3, max_length=3)
    country: Optional[str] = Field(None, max_length=60)
    risk_tolerance: Optional[str] = None # 'low', 'moderate', 'high'
