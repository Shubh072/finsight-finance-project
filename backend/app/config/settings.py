import os
from datetime import timedelta

class Config:
    """Enterprise Flask Application Settings Configuration"""
    
    # Core settings
    SECRET_KEY = os.getenv("SECRET_KEY", "8391f94e7d518b3e3015ab2de70feda4e4d33dd3c5d057c9a1b10832708f99d6")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "232fc7ba08ec950eb6968846f848cc8c10adf97a3f9e802245c569ed89cdc936")
    ENV = os.getenv("FLASK_ENV", "production")
    DEBUG = os.getenv("FLASK_DEBUG", "False") == "True"

    # SMTP configuration
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER = os.getenv("SMTP_USER", "shubham.gayakwad23@pcu.edu.in")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "bgod vmwr jjis rddr")

    # MySQL database settings
    MYSQL_USER = os.getenv("DB_USER", "finsight_user")
    MYSQL_PASSWORD = os.getenv("DB_PASSWORD", "SecureFinPwd2026!")
    MYSQL_HOST = os.getenv("DB_HOST", "localhost")
    MYSQL_PORT = os.getenv("DB_PORT", "3306")
    MYSQL_DB = os.getenv("DB_NAME", "finsight_db")

    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 15,
        "max_overflow": 25,
        "pool_recycle": 1800,
        "pool_pre_ping": True,
    }

    # JWT configuration
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = "HS256"

    # Redis and caching
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

    # Celery Background Workers Broker
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", REDIS_URL)
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", REDIS_URL)

    # Cloudinary Receipt and Photo Storage
    CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")

    # Gemini AI Advisory Settings
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    # Structured logging configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
