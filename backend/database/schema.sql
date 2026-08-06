-- =========================================================
-- FinSight — Full Database Build Script
-- Generated for MySQL 8+ / InnoDB / utf8mb4
-- =========================================================

CREATE DATABASE IF NOT EXISTS finsight_db
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finsight_db;

-- ---- 001_create_users.sql ----
CREATE TABLE users (
    user_id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name               VARCHAR(150)    NOT NULL,
    username                VARCHAR(50)     NOT NULL,
    email                   VARCHAR(150)    NOT NULL,
    phone                   VARCHAR(20)     NULL,
    password_hash           VARCHAR(255)    NOT NULL COMMENT 'bcrypt/argon2 hash only, never plaintext',
    profile_photo           VARCHAR(500)    NULL,
    role                    ENUM('user','admin','support') NOT NULL DEFAULT 'user',
    account_status          ENUM('active','inactive','suspended','deleted') NOT NULL DEFAULT 'active',
    email_verified          BOOLEAN         NOT NULL DEFAULT FALSE,
    failed_login_attempts   TINYINT UNSIGNED NOT NULL DEFAULT 0,
    last_login              TIMESTAMP       NULL,
    created_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT uq_users_phone    UNIQUE (phone),
    CONSTRAINT chk_users_email_format CHECK (email LIKE '%_@_%.__%')
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_email_status    ON users (email, account_status);
CREATE INDEX idx_users_username_status ON users (username, account_status);
CREATE INDEX idx_users_role            ON users (role);

-- ---- 002_create_user_profile.sql ----
CREATE TABLE user_profile (
    profile_id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT UNSIGNED NOT NULL,
    date_of_birth        DATE            NULL,
    occupation           VARCHAR(100)    NULL,
    monthly_income       DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
    currency_preference  CHAR(3)         NOT NULL DEFAULT 'INR',
    country              VARCHAR(60)     NULL,
    risk_tolerance       ENUM('low','moderate','high') NOT NULL DEFAULT 'moderate',
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_profile_user_id UNIQUE (user_id),
    CONSTRAINT fk_user_profile_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 003_create_user_sessions.sql ----
CREATE TABLE user_sessions (
    session_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    session_token   CHAR(64)        NOT NULL,
    refresh_token   CHAR(64)        NULL,
    device_info     VARCHAR(255)    NULL,
    ip_address      VARCHAR(45)     NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    expires_at      TIMESTAMP       NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_sessions_token         UNIQUE (session_token),
    CONSTRAINT uq_sessions_refresh_token UNIQUE (refresh_token),
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 004_create_login_history.sql ----
CREATE TABLE login_history (
    login_id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    ip_address      VARCHAR(45)     NULL,
    device_info     VARCHAR(255)    NULL,
    login_status    ENUM('success','failed') NOT NULL,
    failure_reason  VARCHAR(100)    NULL,
    attempted_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_login_history_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 007_create_activity_logs.sql ----
CREATE TABLE activity_logs (
    activity_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NOT NULL,
    action        VARCHAR(100)    NOT NULL,
    module        VARCHAR(50)     NOT NULL,
    metadata      JSON            NULL,
    ip_address    VARCHAR(45)     NULL,
    created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_activity_logs_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 008_create_audit_logs.sql ----
CREATE TABLE audit_logs (
    audit_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT UNSIGNED NULL,
    table_name   VARCHAR(64)     NOT NULL,
    record_id    BIGINT UNSIGNED NULL,
    operation    ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    old_value    JSON            NULL,
    new_value    JSON            NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 010_create_income_sources.sql ----
CREATE TABLE income_sources (
    source_id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT UNSIGNED NOT NULL,
    source_name    VARCHAR(100)    NOT NULL,
    source_type    ENUM('salary','business','freelance','rental','investment','other') NOT NULL,
    is_recurring   BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_sources_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 011_create_income_transactions.sql ----
CREATE TABLE income_transactions (
    income_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT UNSIGNED NOT NULL,
    source_id          BIGINT UNSIGNED NOT NULL,
    amount             DECIMAL(14,2)   NOT NULL,
    transaction_date   DATE            NOT NULL,
    description        VARCHAR(255)    NULL,
    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_txn_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_income_txn_source
        FOREIGN KEY (source_id) REFERENCES income_sources(source_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_income_txn_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 012_create_expense_categories.sql ----
CREATE TABLE expense_categories (
    category_id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT UNSIGNED NOT NULL,
    category_name        VARCHAR(100)    NOT NULL,
    parent_category_id   BIGINT UNSIGNED NULL,
    icon                 VARCHAR(50)     NULL,
    is_active            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_cat_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_expense_cat_parent
        FOREIGN KEY (parent_category_id) REFERENCES expense_categories(category_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT uq_expense_cat_name_per_user UNIQUE (user_id, category_name, parent_category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 013_create_expense_transactions.sql ----
CREATE TABLE expense_transactions (
    expense_id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT UNSIGNED NOT NULL,
    category_id         BIGINT UNSIGNED NOT NULL,
    amount              DECIMAL(14,2)   NOT NULL,
    payment_mode        ENUM('cash','upi','credit_card','debit_card','bank_transfer','other') NOT NULL DEFAULT 'other',
    transaction_date    DATE            NOT NULL,
    notes               VARCHAR(255)    NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_txn_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_expense_txn_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_expense_txn_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 014_create_expense_attachments.sql ----
CREATE TABLE expense_attachments (
    attachment_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_id      BIGINT UNSIGNED NOT NULL,
    file_path       VARCHAR(500)    NOT NULL,
    file_type       VARCHAR(20)     NOT NULL,
    uploaded_at     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_attach_expense
        FOREIGN KEY (expense_id) REFERENCES expense_transactions(expense_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 015_create_recurring_expenses.sql ----
CREATE TABLE recurring_expenses (
    recurring_id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    category_id     BIGINT UNSIGNED NOT NULL,
    amount          DECIMAL(14,2)   NOT NULL,
    frequency       ENUM('daily','weekly','monthly','quarterly','yearly') NOT NULL,
    next_due_date   DATE            NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recurring_exp_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_recurring_exp_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_recurring_exp_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 017_create_budgets.sql ----
CREATE TABLE budgets (
    budget_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    budget_name     VARCHAR(100)    NOT NULL,
    budget_type     ENUM('monthly','yearly') NOT NULL,
    total_limit     DECIMAL(14,2)   NOT NULL,
    period_start    DATE            NOT NULL,
    period_end      DATE            NOT NULL,
    status          ENUM('active','completed','exceeded') NOT NULL DEFAULT 'active',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_budgets_limit_positive CHECK (total_limit > 0),
    CONSTRAINT chk_budgets_period_valid   CHECK (period_end > period_start)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 018_create_budget_categories.sql ----
CREATE TABLE budget_categories (
    budget_category_id   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    budget_id            BIGINT UNSIGNED NOT NULL,
    category_id          BIGINT UNSIGNED NOT NULL,
    allocated_amount     DECIMAL(14,2)   NOT NULL,
    spent_amount         DECIMAL(14,2)   NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_budget_cat_budget
        FOREIGN KEY (budget_id) REFERENCES budgets(budget_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_budget_cat_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(category_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_budget_cat_pair UNIQUE (budget_id, category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 021_create_investments.sql ----
CREATE TABLE investments (
    investment_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           BIGINT UNSIGNED NOT NULL,
    asset_type        ENUM('stock','mutual_fund','etf','gold','bond','crypto','fixed_deposit','real_estate') NOT NULL,
    asset_name        VARCHAR(150)    NOT NULL,
    symbol            VARCHAR(20)     NULL,
    quantity          DECIMAL(18,6)   NOT NULL,
    buy_price         DECIMAL(14,2)   NOT NULL,
    current_price     DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
    purchase_date     DATE            NOT NULL,
    risk_score        TINYINT UNSIGNED NULL,
    status            ENUM('active','sold','matured') NOT NULL DEFAULT 'active',

    invested_value    DECIMAL(18,2) GENERATED ALWAYS AS (quantity * buy_price) STORED,
    current_value     DECIMAL(18,2) GENERATED ALWAYS AS (quantity * current_price) STORED,
    profit_loss       DECIMAL(18,2) GENERATED ALWAYS AS ((quantity * current_price) - (quantity * buy_price)) STORED,

    created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_investments_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_investments_quantity      CHECK (quantity > 0),
    CONSTRAINT chk_investments_buy_price     CHECK (buy_price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 024_create_financial_goals.sql ----
CREATE TABLE financial_goals (
    goal_id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT UNSIGNED NOT NULL,
    goal_name          VARCHAR(150)    NOT NULL,
    goal_type          ENUM('emergency_fund','travel','education','retirement','house','vehicle','wedding','custom') NOT NULL,
    target_amount      DECIMAL(14,2)   NOT NULL,
    saved_amount       DECIMAL(14,2)   NOT NULL DEFAULT 0.00,
    deadline           DATE            NULL,
    priority           ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
    status             ENUM('on_track','at_risk','completed','abandoned') NOT NULL DEFAULT 'on_track',

    progress_percent   DECIMAL(6,2) GENERATED ALWAYS AS
        (LEAST(100.00, ROUND((saved_amount / NULLIF(target_amount, 0)) * 100, 2))) STORED,

    created_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_financial_goals_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_financial_goals_target CHECK (target_amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 026_create_notifications.sql ----
CREATE TABLE notifications (
    notification_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT UNSIGNED NOT NULL,
    notification_type    ENUM('budget_alert','goal_alert','investment_alert','system') NOT NULL,
    title                 VARCHAR(150)    NOT NULL,
    message               VARCHAR(500)    NOT NULL,
    is_read               BOOLEAN         NOT NULL DEFAULT FALSE,
    read_at               TIMESTAMP       NULL,
    created_at            TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 027_create_reports.sql ----
CREATE TABLE reports (
    report_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT UNSIGNED NOT NULL,
    report_type      ENUM('monthly','yearly','category','investment') NOT NULL,
    format            ENUM('pdf','excel') NOT NULL,
    file_path         VARCHAR(500)    NOT NULL,
    period_start      DATE            NOT NULL,
    period_end        DATE            NOT NULL,
    status            ENUM('pending','completed','failed') NOT NULL DEFAULT 'pending',
    generated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 028_create_ai_recommendations.sql ----
CREATE TABLE ai_recommendations (
    recommendation_id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT UNSIGNED NOT NULL,
    category                ENUM('spending','saving','investment','budget','goal') NOT NULL,
    recommendation_text     VARCHAR(500)    NOT NULL,
    potential_impact        DECIMAL(14,2)   NULL,
    confidence_score        DECIMAL(5,2)    NULL,
    is_applied               BOOLEAN         NOT NULL DEFAULT FALSE,
    applied_at               TIMESTAMP       NULL,
    created_at               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_recommendations_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---- 029_create_dashboard_summary.sql ----
CREATE TABLE dashboard_summary (
    dashboard_id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                   BIGINT UNSIGNED NOT NULL,
    total_balance             DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    total_income              DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    total_expenses            DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    monthly_savings           DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    net_worth                 DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    investment_value          DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    financial_health_score    TINYINT UNSIGNED NULL,
    last_calculated           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_dashboard_summary_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_dashboard_summary_user UNIQUE (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
