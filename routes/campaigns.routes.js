const express = require('express');
const db = require('../init_db');
const authenticateToken = require('../middleware/authenticateToken');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

/**
 * PUBLIC: Approved campaigns (no auth)
 */
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

/**
 * USER: Get own campaigns
 */
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

/**
 * ADMIN: Get all campaigns
 */
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

/**
 * USER: Get campaign by ID
 */
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

/**
 * USER: Create campaign
 */
router.post('/', authenticateToken, (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.run(
    `INSERT INTO campaigns (user_id, title, description, status) 
     VALUES (?, ?, ?, ?)`,
    [req.userId, title, description, 'Pending'],
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

/**
 * USER: Update own campaign
 */
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

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
        if (!title.trim()) {
          return res.status(400).json({ error: 'Title cannot be empty' });
        }
        updates.push('title = ?');
        values.push(title);
      }

      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }

      updates.push("updated_at = datetime('now')");
      values.push(id, req.userId);

      if (updates.length === 1) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      db.run(
        `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values,
        function (err) {
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
        }
      );
    }
  );
});

/**
 * ADMIN: Approve / Reject campaign
 */
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = new Set(['Pending', 'Approved', 'Rejected']);
  if (!status || !allowed.has(status)) {
    return res.status(400).json({
      error: 'Invalid status. Allowed: Pending, Approved, Rejected'
    });
  }

  db.run(
    "UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Campaign not found' });
      }

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

/**
 * USER or ADMIN: Delete campaign
 */
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    "SELECT id, user_id FROM campaigns WHERE id = ?",
    [id],
    (err, campaign) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

      // Owner delete
      if (campaign.user_id === req.userId) {
        db.run(
          "DELETE FROM campaigns WHERE id = ?",
          [id],
          err => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Campaign deleted successfully' });
          }
        );
        return;
      }

      // Admin delete
      db.get(
        "SELECT is_admin FROM users WHERE id = ?",
        [req.userId],
        (err, user) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!user) return res.status(401).json({ error: 'User not found' });
          if (user.is_admin !== 1) {
            return res.status(403).json({ error: 'Unauthorized' });
          }

          db.run(
            "DELETE FROM campaigns WHERE id = ?",
            [id],
            err => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({ message: 'Campaign deleted successfully' });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
