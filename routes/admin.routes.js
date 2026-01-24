const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

/**
 * Admin: manage users (set/unset admin)
 */
router.put('/users/:id/admin', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  if (
    is_admin !== 0 &&
    is_admin !== 1 &&
    is_admin !== true &&
    is_admin !== false
  ) {
    return res
      .status(400)
      .json({ error: 'is_admin must be 0/1 or true/false' });
  }

  const value = (is_admin === 1 || is_admin === true) ? 1 : 0;

  db.run(
    "UPDATE users SET is_admin = ? WHERE id = ?",
    [value, userId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ userId, is_admin: value });
    }
  );
});

module.exports = router;
