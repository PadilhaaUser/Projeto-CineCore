require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes import
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const tvRoutes = require('./routes/tv');
const reviewRoutes = require('./routes/reviews');
const forumRoutes = require('./routes/forum');

// Routes usage
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/forum', forumRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
