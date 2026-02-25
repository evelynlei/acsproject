const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const campaignRoutes = require('./routes/campaigns.routes');
const itemRoutes = require('./routes/items.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/users.routes');

const app = express();

const rawCorsOrigins =
  process.env.CORS_ORIGIN ||
  'http://localhost:5173,https://acsproject-beige.vercel.app';
const allowedOrigins = rawCorsOrigins
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
