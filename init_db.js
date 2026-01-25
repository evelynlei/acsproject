const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
    // Ensure FK constraints (including ON DELETE CASCADE) are enforced
    db.run("PRAGMA foreign_keys = ON");

    db.run("CREATE TABLE IF NOT EXISTS items (name TEXT)");
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Add is_admin column if it doesn't exist yet (SQLite doesn't support IF NOT EXISTS for ADD COLUMN)
    db.run(
        "ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0",
        (err) => {
            // Ignore duplicate-column error if already added
            if (err && !String(err.message || '').includes('duplicate column name')) {
                console.error('Error adding is_admin column:', err.message);
            }
        }
    );

    // Seed default admin user (idempotent)
    db.run(
        `INSERT OR IGNORE INTO users (id ,name, email, password, is_admin)
         VALUES (?, ?, ?, ?, ?)`,
        [
            9,
            'eve',
            'eve@gmail.com',
            '$2a$10$IDPM4nv.KQ0iXeaZDnrkjOiLeSWtXz.26ace6dIYL6m0AWJHqS.d.',
            1
        ],
        (err) => {
            if (err) {
                console.error('Error seeding admin user:', err.message);
            }
        }
    );
    
    db.run(`CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS campaigns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
});

module.exports = db;