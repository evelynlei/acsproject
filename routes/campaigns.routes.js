const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

/* Public campaigns */
router.get('/public', (req, res) => {
  db.all(
    `SELECT c.*, u.name as user_name, u.email as user_email
     FROM campaigns c
     JOIN users u ON c.user_id = u.id
     WHERE c.status = 'Approved'
     ORDER BY c.created_at DESC`,
    [],
    (err, rows) => res.json(rows)
  );
});

/* User campaigns */
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT * FROM campaigns WHERE user_id = ?`,
    [req.userId],
    (err, rows) => res.json(rows)
  );
});

/* Admin: all campaigns */
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  db.all(`SELECT * FROM campaigns`, [], (err, rows) => res.json(rows));
});

module.exports = router;
