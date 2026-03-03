const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} = require('../utils/jwt_utils');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: 'Missing required fields' });

  if (password.length < 12) {
    return res.status(400).json({ error: 'Password must be at least 12 characters long' });
  }

  if (!/\d/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one digit' });
  }

  const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (!symbolRegex.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one special symbol' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role || 'user'], 
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }

      const accessToken = generateAccessToken(this.lastID);
      const refreshToken = generateRefreshToken(this.lastID);
      const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

      db.run(
        "INSERT OR REPLACE INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
        [this.lastID, refreshToken, expiresAt],
        () => res.json({
          accessToken,
          refreshToken,
          userId: this.lastID,
          name,
          email,
          role: role || 'user', 
          isAdmin: 0
        })
      );
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    db.run(
      "INSERT OR REPLACE INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, refreshToken, expiresAt],
      () => res.json({
        accessToken,
        refreshToken,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role, 
        isAdmin: user.is_admin === 1 ? 1 : 0
      })
    );
  });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  const decoded = verifyToken(refreshToken);

  if (!decoded) return res.status(401).json({ error: 'Invalid refresh token' });

  db.get(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')",
    [refreshToken],
    (err, row) => {
      if (!row) return res.status(401).json({ error: 'Refresh token expired or revoked' });
      res.json({ accessToken: generateAccessToken(decoded.userId) });
    }
  );
});

router.post('/logout', authenticateToken, (req, res) => {
  const { refreshToken } = req.body;
  db.run(
    "DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?",
    [refreshToken, req.userId],
    () => res.json({ message: 'Logged out successfully' })
  );
});

module.exports = router;