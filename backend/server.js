const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
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
app.use(express.urlencoded({ extended: true }));

// Apply General Rate Limiter to all API routes
app.use('/api', apiLimiter);

// Apply Strict Rate Limiter specifically to Auth routes
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/articles', knowledgeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handling Middlewares (MUST be placed after all routes)
app.use(notFound);
app.use(errorHandler);


app.get('/', (request, response) => {
    response.send('APIis running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYWZlNzRmYzVjOWE0NDJmMDM2ZTFjYSIsImlhdCI6MTc4OTkxNjAzOSwiZXhwIjoxNzkyNTA4MDM5fQ._CxyDTcX7n9CXR-TNA-jldhCepuoEqKCUFQY7mI9jGc