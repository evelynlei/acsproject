const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();


router.get('/public', (req, res) => {
  db.all(
    `SELECT c.*, u.name as user_name, u.email as user_email 
     FROM campaigns c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.status = 'Approved'
     ORDER BY c.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});


router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT c.*, u.name as user_name, u.email as user_email 
     FROM campaigns c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.user_id = ? 
     ORDER BY c.created_at DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});


router.get('/all', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT c.*, u.name as user_name, u.email as user_email 
     FROM campaigns c 
     JOIN users u ON c.user_id = u.id 
     ORDER BY c.created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});


router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT c.*, u.name as user_name, u.email as user_email 
     FROM campaigns c 
     JOIN users u ON c.user_id = u.id 
     WHERE c.id = ?`,
    [id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Campaign not found' });
      res.json(row);
    }
  );
});


router.post('/', authenticateToken, (req, res) => {
  const { title, description, imageUrl, goalAmount, category } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    `INSERT INTO campaigns (user_id, title, description, image_url, goal_amount, category, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      req.userId, 
      title, 
      description, 
      imageUrl || null, 
      Number(goalAmount) || 0, 
      category || 'Social Cause', 
      'Pending'
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      db.get(
        `SELECT c.*, u.name as user_name, u.email as user_email 
         FROM campaigns c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [this.lastID],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(row);
        }
      );
    }
  );
});


router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, goalAmount, category } = req.body;

  db.get(
    "SELECT * FROM campaigns WHERE id = ? AND user_id = ?",
    [id, req.userId],
    (err, campaign) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found or unauthorized' });
      }

      const updates = [];
      const values = [];

      if (title !== undefined) {
        if (!title.trim()) return res.status(400).json({ error: 'Title cannot be empty' });
        updates.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (imageUrl !== undefined) {
        updates.push('image_url = ?');
        values.push(imageUrl);
      }
      if (goalAmount !== undefined) {
        updates.push('goal_amount = ?');
        values.push(Number(goalAmount) || 0);
      }
      if (category !== undefined) {
        updates.push('category = ?');
        values.push(category);
      }

      updates.push("updated_at = datetime('now')");

      if (updates.length === 1) { 
        return res.status(400).json({ error: 'No fields to update' });
      }

      const sql = `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
      values.push(id, req.userId);

      db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get(
          `SELECT c.*, u.name as user_name, u.email as user_email 
           FROM campaigns c 
           JOIN users u ON c.user_id = u.id 
           WHERE c.id = ?`,
          [id],
          (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(row);
          }
        );
      });
    }
  );
});


router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = new Set(['Pending', 'Approved', 'Rejected']);
  if (!status || !allowed.has(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run(
    "UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Campaign not found' });

      db.get(
        `SELECT c.*, u.name as user_name, u.email as user_email 
         FROM campaigns c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.id = ?`,
        [id],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        }
      );
    }
  );
});


router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, user_id FROM campaigns WHERE id = ?",
    [id],
    (err, campaign) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      const executeDelete = () => {
        db.run("DELETE FROM campaigns WHERE id = ?", [id], (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Campaign deleted successfully' });
        });
      };

      if (campaign.user_id === req.userId) {
        return executeDelete();
      }

      db.get("SELECT is_admin FROM users WHERE id = ?", [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (user && user.is_admin === 1) {
          return executeDelete();
        }
        res.status(403).json({ error: 'Unauthorized' });
      });
    }
  );
});

module.exports = router;