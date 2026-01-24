const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const campaignRoutes = require('./routes/campaigns.routes');
const itemRoutes = require('./routes/items.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// const express = require('express');
// const path = require('path');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const db = require('./init_db');
// const { generateAccessToken, generateRefreshToken, verifyToken, REFRESH_TOKEN_EXPIRY } = require('./jwt_utils');

// const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.static('public'));

// // Middleware to verify access token
// function authenticateToken(req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ error: 'No token provided' });
  
//   const decoded = verifyToken(token);
//   if (!decoded) return res.status(401).json({ error: 'Invalid or expired token' });
  
//   req.userId = decoded.userId;
//   next();
// }

// function requireAdmin(req, res, next) {
//   db.get(
//     "SELECT is_admin FROM users WHERE id = ?",
//     [req.userId],
//     (err, user) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (!user) return res.status(401).json({ error: 'User not found' });
//       if (user.is_admin !== 1) return res.status(403).json({ error: 'Admin permission required' });
//       next();
//     }
//   );
// }

// // Admin: manage users
// app.put('/api/admin/users/:id/admin', authenticateToken, requireAdmin, (req, res) => {
//     const { id } = req.params;
//     const { is_admin } = req.body;

//     const userId = Number(id);
//     if (!Number.isInteger(userId) || userId <= 0) {
//         return res.status(400).json({ error: 'Invalid user id' });
//     }

//     if (is_admin !== 0 && is_admin !== 1 && is_admin !== true && is_admin !== false) {
//         return res.status(400).json({ error: 'is_admin must be 0/1 or true/false' });
//     }

//     const value = (is_admin === 1 || is_admin === true) ? 1 : 0;

//     db.run(
//         "UPDATE users SET is_admin = ? WHERE id = ?",
//         [value, userId],
//         function (err) {
//             if (err) return res.status(500).json({ error: err.message });
//             if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
//             res.json({ userId, is_admin: value });
//         }
//     );
// });


// // Auth Endpoints
// app.post('/api/auth/register', (req, res) => {
//     const { name, email, password } = req.body;
    
//     if (!name || !email || !password) {
//         return res.status(400).json({ error: 'Missing required fields' });
//     }
    
//     // Validate password: at least 6 characters and has a capital letter
//     if (password.length < 6) {
//         return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }
    
//     if (!/[A-Z]/.test(password)) {
//         return res.status(400).json({ error: 'Password must contain at least one capital letter' });
//     }
    
//     const hashedPassword = bcrypt.hashSync(password, 10);
    
//     db.run(
//         "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
//         [name, email, hashedPassword],
//         function(err) {
//             if (err) {
//                 if (err.message.includes('UNIQUE constraint failed')) {
//                     return res.status(400).json({ error: 'Email already exists' });
//                 }
//                 return res.status(500).json({ error: err.message });
//             }
            
//             const accessToken = generateAccessToken(this.lastID);
//             const refreshToken = generateRefreshToken(this.lastID);
            
//             // Store refresh token in database
//             const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
//             db.run(
//                 // One token per user: replace any existing row for this user_id
//                 "INSERT OR REPLACE INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
//                 [this.lastID, refreshToken, expiresAt],
//                 (err) => {
//                     if (err) {
//                         console.error('Error storing refresh token:', err);
//                         return res.status(500).json({ error: 'Failed to store refresh token' });
//                     }
//                     console.log('Refresh token stored for user:', this.lastID);
//                     res.json({ accessToken, refreshToken, userId: this.lastID, name, email, isAdmin: 0 });
//                 }
//             );
//         }
//     );
// });

// app.post('/api/auth/login', (req, res) => {
//     const { email, password } = req.body;
    
//     if (!email || !password) {
//         return res.status(400).json({ error: 'Email and password required' });
//     }
    
//     db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (!user) return res.status(401).json({ error: 'Invalid email or password' });
        
//         const validPassword = bcrypt.compareSync(password, user.password);
//         if (!validPassword) return res.status(401).json({ error: 'Invalid email or password' });
        
//         const accessToken = generateAccessToken(user.id);
//         const refreshToken = generateRefreshToken(user.id);
        
//         // Store refresh token in database (one token per user)
//         const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
//         db.run(
//             "INSERT OR REPLACE INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
//             [user.id, refreshToken, expiresAt],
//             (err) => {
//                 if (err) {
//                     console.error('Error storing refresh token on login:', err);
//                     return res.status(500).json({ error: 'Failed to store refresh token' });
//                 }
//                 console.log('Refresh token stored for user:', user.id);
//                 res.json({ accessToken, refreshToken, userId: user.id, name: user.name, email: user.email, isAdmin: user.is_admin === 1 ? 1 : 0 });
//             }
//         );
//     });
// });

// app.post('/api/auth/refresh', (req, res) => {
//     const { refreshToken } = req.body;
    
//     if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    
//     const decoded = verifyToken(refreshToken);
//     if (!decoded) return res.status(401).json({ error: 'Invalid refresh token' });
    
//     // Check if refresh token exists in database
//     db.get(
//         "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')",
//         [refreshToken],
//         (err, row) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (!row) return res.status(401).json({ error: 'Refresh token expired or revoked' });
            
//             const accessToken = generateAccessToken(decoded.userId);
//             res.json({ accessToken });
//         }
//     );
// });

// app.post('/api/auth/logout', authenticateToken, (req, res) => {
//     const { refreshToken } = req.body;
    
//     if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
    
//     // Delete refresh token from database
//     db.run(
//         "DELETE FROM refresh_tokens WHERE token = ? AND user_id = ?",
//         [refreshToken, req.userId],
//         (err) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json({ message: 'Logged out successfully' });
//         }
//     );
// });

// // Items Endpoints (protected)
// app.get('/api/items', authenticateToken, (req, res) => {
//     db.all("SELECT * FROM items", [], (err, rows) => {
//         if (err) return res.status(500).send(err.message);
//         res.json(rows);
//     });
// });

// app.post('/api/items', authenticateToken, (req, res) => {
//     const { name } = req.body;
//     db.run("INSERT INTO items (name) VALUES (?)", [name], function(err) {
//         if (err) return res.status(500).send(err.message);
//         res.json({ id: this.lastID, name });
//     });
// });

// // Campaign Endpoints (protected)
// // Public: show only approved campaigns (no auth)
// app.get('/api/campaigns/public', (req, res) => {
//     db.all(
//         `SELECT c.*, u.name as user_name, u.email as user_email 
//          FROM campaigns c 
//          JOIN users u ON c.user_id = u.id 
//          WHERE c.status = 'Approved'
//          ORDER BY c.created_at DESC`,
//         [],
//         (err, rows) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(rows);
//         }
//     );
// });

// app.get('/api/campaigns', authenticateToken, (req, res) => {
//     // Get all campaigns for the authenticated user
//     db.all(
//         `SELECT c.*, u.name as user_name, u.email as user_email 
//          FROM campaigns c 
//          JOIN users u ON c.user_id = u.id 
//          WHERE c.user_id = ? 
//          ORDER BY c.created_at DESC`,
//         [req.userId],
//         (err, rows) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(rows);
//         }
//     );
// });

// app.get('/api/campaigns/all', authenticateToken, requireAdmin, (req, res) => {
//     // Get all campaigns (admin view or public campaigns)
//     db.all(
//         `SELECT c.*, u.name as user_name, u.email as user_email 
//          FROM campaigns c 
//          JOIN users u ON c.user_id = u.id 
//          ORDER BY c.created_at DESC`,
//         [],
//         (err, rows) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(rows);
//         }
//     );
// });

// app.get('/api/campaigns/:id', authenticateToken, (req, res) => {
//     const { id } = req.params;
//     db.get(
//         `SELECT c.*, u.name as user_name, u.email as user_email 
//          FROM campaigns c 
//          JOIN users u ON c.user_id = u.id 
//          WHERE c.id = ?`,
//         [id],
//         (err, row) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (!row) return res.status(404).json({ error: 'Campaign not found' });
//             res.json(row);
//         }
//     );
// });

// app.post('/api/campaigns', authenticateToken, (req, res) => {
//     const { title, description } = req.body;
    
//     if (!title) {
//         return res.status(400).json({ error: 'Title is required' });
//     }
    
//     db.run(
//         `INSERT INTO campaigns (user_id, title, description, status) 
//          VALUES (?, ?, ?, ?)`,
//         [req.userId, title, description, 'Pending'],
//         function(err) {
//             if (err) return res.status(500).json({ error: err.message });
            
//             // Return the created campaign
//             db.get(
//                 `SELECT c.*, u.name as user_name, u.email as user_email 
//                  FROM campaigns c 
//                  JOIN users u ON c.user_id = u.id 
//                  WHERE c.id = ?`,
//                 [this.lastID],
//                 (err, row) => {
//                     if (err) return res.status(500).json({ error: err.message });
//                     res.status(201).json(row);
//                 }
//             );
//         }
//     );
// });

// app.put('/api/campaigns/:id', authenticateToken, (req, res) => {
//     const { id } = req.params;
//     const { title, description } = req.body;
    
//     // First check if campaign exists and belongs to user
//     db.get(
//         "SELECT * FROM campaigns WHERE id = ? AND user_id = ?",
//         [id, req.userId],
//         (err, campaign) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (!campaign) return res.status(404).json({ error: 'Campaign not found or unauthorized' });
            
//             // Build dynamic update query
//             const updates = [];
//             const values = [];
            
//             if (title !== undefined) {
//                 if (!title.trim()) {
//                     return res.status(400).json({ error: 'Title cannot be empty' });
//                 }
//                 updates.push('title = ?');
//                 values.push(title);
//             }
//             if (description !== undefined) {
//                 updates.push('description = ?');
//                 values.push(description);
//             }
            
//             updates.push("updated_at = datetime('now')");
//             values.push(id, req.userId);
            
//             if (updates.length === 1) {
//                 return res.status(400).json({ error: 'No fields to update' });
//             }
            
//             db.run(
//                 `UPDATE campaigns SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
//                 values,
//                 function(err) {
//                     if (err) return res.status(500).json({ error: err.message });
                    
//                     // Return updated campaign
//                     db.get(
//                         `SELECT c.*, u.name as user_name, u.email as user_email 
//                          FROM campaigns c 
//                          JOIN users u ON c.user_id = u.id 
//                          WHERE c.id = ?`,
//                         [id],
//                         (err, row) => {
//                             if (err) return res.status(500).json({ error: err.message });
//                             res.json(row);
//                         }
//                     );
//                 }
//             );
//         }
//     );
// });

// // Admin: approve/reject campaigns (protected)
// app.put('/api/campaigns/:id/status', authenticateToken, requireAdmin, (req, res) => {
//     const { id } = req.params;
//     const { status } = req.body;

//     const allowed = new Set(['Pending', 'Approved', 'Rejected']);
//     if (!status || !allowed.has(status)) {
//         return res.status(400).json({ error: "Invalid status. Allowed: Pending, Approved, Rejected" });
//     }

//     db.run(
//         "UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?",
//         [status, id],
//         function(err) {
//             if (err) return res.status(500).json({ error: err.message });
//             if (this.changes === 0) return res.status(404).json({ error: 'Campaign not found' });

//             db.get(
//                 `SELECT c.*, u.name as user_name, u.email as user_email 
//                  FROM campaigns c 
//                  JOIN users u ON c.user_id = u.id 
//                  WHERE c.id = ?`,
//                 [id],
//                 (err, row) => {
//                     if (err) return res.status(500).json({ error: err.message });
//                     res.json(row);
//                 }
//             );
//         }
//     );
// });

// app.delete('/api/campaigns/:id', authenticateToken, (req, res) => {
//     const { id } = req.params;

//     // Allow delete by owner OR admin
//     db.get(
//         "SELECT id, user_id FROM campaigns WHERE id = ?",
//         [id],
//         (err, campaign) => {
//             if (err) return res.status(500).json({ error: err.message });
//             if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

//             if (campaign.user_id === req.userId) {
//                 db.run(
//                     "DELETE FROM campaigns WHERE id = ?",
//                     [id],
//                     function(err) {
//                         if (err) return res.status(500).json({ error: err.message });
//                         res.json({ message: 'Campaign deleted successfully' });
//                     }
//                 );
//                 return;
//             }

//             // Not owner; check admin
//             db.get(
//                 "SELECT is_admin FROM users WHERE id = ?",
//                 [req.userId],
//                 (err, user) => {
//                     if (err) return res.status(500).json({ error: err.message });
//                     if (!user) return res.status(401).json({ error: 'User not found' });
//                     if (user.is_admin !== 1) return res.status(403).json({ error: 'Unauthorized' });

//                     db.run(
//                         "DELETE FROM campaigns WHERE id = ?",
//                         [id],
//                         function(err) {
//                             if (err) return res.status(500).json({ error: err.message });
//                             res.json({ message: 'Campaign deleted successfully' });
//                         }
//                     );
//                 }
//             );
//         }
//     );
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });