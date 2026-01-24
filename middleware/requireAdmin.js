const db = require('../init_db');

function requireAdmin(req, res, next) {
  db.get(
    "SELECT is_admin FROM users WHERE id = ?",
    [req.userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'User not found' });
      if (user.is_admin !== 1) {
        return res.status(403).json({ error: 'Admin permission required' });
      }
      next();
    }
  );
}

module.exports = requireAdmin;
