const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    db.run("CREATE TABLE IF NOT EXISTS items (name TEXT)");
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user', 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(
        "ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0",
        (err) => {
            if (err && !String(err.message || '').includes('duplicate column name')) {
                console.error('Error adding is_admin column:', err.message);
            }
        }
    );

    db.run(
        `INSERT OR IGNORE INTO users (id ,name, email, password, is_admin)
         VALUES (?, ?, ?, ?, ?)`,
        [9, 'eve', 'eve@gmail.com', '$2a$10$IDPM4nv.KQ0iXeaZDnrkjOiLeSWtXz.26ace6dIYL6m0AWJHqS.d.', 1],
        (err) => { if (err) console.error('Error seeding admin user:', err.message); }
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

    const newColumns = [
        "ALTER TABLE campaigns ADD COLUMN image_url TEXT",
        "ALTER TABLE campaigns ADD COLUMN goal_amount REAL DEFAULT 0",
        "ALTER TABLE campaigns ADD COLUMN category TEXT DEFAULT 'Social Cause'"
    ];

    newColumns.forEach(sql => {
        db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error('Error updating campaigns table:', err.message);
            }
        });
    });
});

module.exports = db;