## Quick start (fresh clone)

### Prereqs
- **Node.js + npm** installed (recommended: via nvm)

### One command

```bash
cd py-project
chmod +x setup_and_run.sh
./setup_and_run.sh
```

This will:
- Install backend deps (root `package.json`)
- Install frontend deps (`frontend/package.json`)
- Initialize `db.sqlite` (schema + seed admin user Eve)
- Start:
  - Backend: `http://localhost:3000`
  - Frontend: `http://localhost:5173`

Stop with **Ctrl+C**.

### Admin bootstrap
`init_db.js` seeds an admin user:
- email: `eve@gmail.com`
- password hash is pre-seeded (use the matching plaintext you generated originally)

You can also promote any user via SQLite:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'someone@example.com';
```
