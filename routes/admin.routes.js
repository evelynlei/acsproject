const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.put('/users/:id/admin', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const value = req.body.is_admin ? 1 : 0;

  db.run(
    "UPDATE users SET is_admin = ? WHERE id = ?",
    [value, id],
    function (err) {
      if (this.changes === 0)
        return res.status(404).json({ error: 'User not found' });
      res.json({ userId: id, is_admin: value });
    }
  );
});

module.exports = router;
