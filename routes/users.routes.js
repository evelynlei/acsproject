const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, (req, res) => {
    db.all(
        `SELECT id, name, email, role, is_admin, created_at 
         FROM users 
         WHERE is_admin != 1 AND role != 'admin'`, 
        [],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows);
        }
      );
    });

router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;