const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const campaignRoutes = require('./routes/campaigns.routes');
const itemRoutes = require('./routes/items.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/users.routes');

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
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

