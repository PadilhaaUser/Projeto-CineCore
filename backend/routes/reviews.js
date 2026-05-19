const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db, admin } = require('../config/firebase');

// Add a review (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { movieId, rating, comment } = req.body;
        
        if (!movieId || rating == null) {
            return res.status(400).json({ error: 'Movie ID and rating are required.' });
        }

        const newReview = {
            movieId: String(movieId),
            userId: req.user.id,
            userName: req.user.name,
            rating: Number(rating),
            comment: comment || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('reviews').add(newReview);
        res.status(201).json({ id: docRef.id, ...newReview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error saving review.' });
    }
});

// Get reviews for a movie
router.get('/movie/:id', async (req, res) => {
    try {
        const movieId = req.params.id;
        const snapshot = await db.collection('reviews')
            .where('movieId', '==', String(movieId))
            .orderBy('createdAt', 'desc')
            .get();

        const reviews = [];
        snapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching reviews.' });
    }
});

module.exports = router;
