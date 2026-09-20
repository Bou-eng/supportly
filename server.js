const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;
const authRoutes = require('./routes/authRoutes');

dotenv.config();
connectDB();

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/', (request, response) => {
    response.send('APIis running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});