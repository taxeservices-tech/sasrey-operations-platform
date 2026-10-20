import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDirectory = path.join(
  process.cwd(),
  "data"
);

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, {
    recursive: true,
  });
}

const databasePath = path.join(
  dataDirectory,
  "sasrey.db"
);

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    resource TEXT,
    resource_id TEXT,
    result TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
    ON audit_logs(user_id);

  CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
    ON audit_logs(created_at);


`);

export default db;
