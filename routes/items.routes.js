const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

/**
 * GET /api/items
 * Protected – returns all items
 */
router.get('/', authenticateToken, (req, res) => {
  db.all("SELECT * FROM items", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

/**
 * POST /api/items
 * Protected – create new item
 */
router.post('/', authenticateToken, (req, res) => {
  const { name } = req.body;

  db.run(
    "INSERT INTO items (name) VALUES (?)",
    [name],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID, name });
    }
  );
});

module.exports = router;
