CREATE TABLE generation_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id INTEGER NOT NULL REFERENCES generation_runs(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    request_prompt TEXT NOT NULL,
    response_content TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_generation_logs_run_id ON generation_logs(run_id);
