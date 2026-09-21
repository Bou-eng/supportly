const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5001;
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');

dotenv.config();
connectDB();

// Body parser middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/', (request, response) => {
    response.send('APIis running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYWZlNzRmYzVjOWE0NDJmMDM2ZTFjYSIsImlhdCI6MTc4OTkxNjAzOSwiZXhwIjoxNzkyNTA4MDM5fQ._CxyDTcX7n9CXR-TNA-jldhCepuoEqKCUFQY7mI9jGc