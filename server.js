const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const teamRoutes = require('./routes/teamRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');

dotenv.config();
connectDB();

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/articles', knowledgeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (request, response) => {
    response.send('APIis running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYWZlNzRmYzVjOWE0NDJmMDM2ZTFjYSIsImlhdCI6MTc4OTkxNjAzOSwiZXhwIjoxNzkyNTA4MDM5fQ._CxyDTcX7n9CXR-TNA-jldhCepuoEqKCUFQY7mI9jGc