-- ============================================
--  Sujet 3: Module Onboarding Intelligent des Clients
--  Tables supplementaires pour le module onboarding
-- ============================================

-- Table: onboarding_cases
CREATE TABLE IF NOT EXISTS onboarding_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    product_type VARCHAR(100) NOT NULL,
    current_step INTEGER DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'en_cours',
    start_date DATE,
    expected_completion_date DATE,
    assigned_agent VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: onboarding_steps
CREATE TABLE IF NOT EXISTS onboarding_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'a_faire',
    deadline DATE,
    completed_at DATETIME,
    required_documents TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: client_interactions
CREATE TABLE IF NOT EXISTS client_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    notes TEXT,
    interaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    next_followup_date DATETIME,
    created_by VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: dropoff_risk_scores
CREATE TABLE IF NOT EXISTS dropoff_risk_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    risk_score REAL NOT NULL DEFAULT 0.0,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'faible',
    risk_factors TEXT,
    suggested_action TEXT,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_status ON onboarding_cases(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_cases_assigned_agent ON onboarding_cases(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_case_id ON onboarding_steps(case_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_steps_status ON onboarding_steps(status);
CREATE INDEX IF NOT EXISTS idx_client_interactions_case_id ON client_interactions(case_id);
CREATE INDEX IF NOT EXISTS idx_dropoff_risk_scores_case_id ON dropoff_risk_scores(case_id);
CREATE INDEX IF NOT EXISTS idx_dropoff_risk_scores_risk_level ON dropoff_risk_scores(risk_level);
