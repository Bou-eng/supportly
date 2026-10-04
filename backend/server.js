const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const connectDB = require('./config/db');
const validateEnv = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 5001;
const { authLimiter, apiLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const teamRoutes = require('./routes/teamRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');


validateEnv();

const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

// Body parser middleware
app.use(helmet());
app.use(pinoHttp({
    redact: ['req.headers.authorization', 'req.headers.cookie'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));

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
app.use('/api/settings', settingsRoutes);

// Global Error Handling Middlewares (MUST be placed after all routes)
app.use(notFound);
app.use(errorHandler);


app.get('/', (request, response) => {
    response.send('APIis running...');
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        if (error.message.includes('authentication failed') || error.code === 18) {
            console.error('MongoDB authentication failed. Check the database username, password, and URL encoding in backend/.env.');
        } else {
            console.error(`MongoDB connection failed: ${error.message}`);
        }
        process.exitCode = 1;
    }
};

if (require.main === module) {
    startServer();
}

module.exports = { app, startServer };

