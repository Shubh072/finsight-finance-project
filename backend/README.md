# FinSight Enterprise Personal Finance & Investment Backend

This repository contains the complete production-grade backend architecture for **FinSight**, a Personal Finance & Investment Intelligence Platform built using a robust, clean, and decoupled 3-tier architecture.

---

## 🏗️ Clean Architecture Overview

```text
backend/
├── app/
│   ├── config/          # Central settings, environment variables and pool limits
│   ├── models/          # Declarative SQLAlchemy models (User, Expense, Budget, Investments, Goals)
│   ├── schemas/         # Pydantic schemas validating API serialization
│   ├── middleware/      # JWT security assertion, failed login checks and role boundaries
│   ├── ai/              # Google Generative AI (Gemini) advisory logic
│   ├── routes/          # REST endpoints split into blueprints (auth, expenses, dashboard)
│   ├── repositories/    # Generic Repository Pattern separating transactional controls
│   └── utils/           # Shared response formats and global error templates
├── database/
│   └── schema.sql       # Normalized MySQL 8+ database schema
├── tests/               # Pytest unit and integration check suites
├── requirements.txt     # Locked production package dependencies
└── wsgi.py              # WSGI gateway wrapper for Gunicorn deployment
```

---

## 🛠️ Tech Stack & Key Features

- **Runtime & Framework**: Python 3.12 + Flask
- **Data Persistence**: MySQL (Normalized InnoDB tables, generated columns for live investment math, full composite indexing)
- **Object Relational Mapping**: SQLAlchemy (Repository pattern, transaction controls, abstract Audited models)
- **Authentication**: JWT Bearer Tokens (SHA-256 session token hashing, brute-force security, role permission guardrails)
- **AI advisory Services**: Google Gemini (Direct API binding for dynamic, contextual reports, structured JSON rebalancing matrices, and savings targets forecasts)
- **Background workers**: Celery & Redis (Task schedules, budget limits re-runs)
- **Audit Trails**: Global transaction history, user logins trace logs, and deleted-at timestamp soft deletes

---

## 🚀 Setting Up the Application

### 1. Configure the Environment
Copy or create a `.env` file in the root backend directory:
```env
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000

# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=finsight_user
DB_PASSWORD=SecureFinPwd2026!
DB_NAME=finsight_db

# Security & Sessions
SECRET_KEY=prod-fin-secure-secret-key-32891902
GEMINI_API_KEY=your_gemini_api_key_here
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Build the Database
Create the database and execute the complete schema script:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
Use **Gunicorn** for production scale or run natively for local development:
```bash
# Production WSGI boot
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app

# Or development hot reload run
python wsgi.py
```

---

## 🛡️ Security Assertion & Compliance

- **Password Hashing**: Cryptographic hashing via `bcrypt` with dynamic 12-round work factor salts.
- **CSRF, XSS, and SQL Injection**: Safeguarded naturally through strict parameterized queries via SQLAlchemy ORM, safe headers configured through Flask-CORS, and Pydantic input sanitizer schemas.
- **Session Revocation**: Session token hashes are stored directly in MySQL, enabling instant supports for single-logout and multiple devices tracking controls.
