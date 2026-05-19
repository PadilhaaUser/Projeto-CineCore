const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { db, admin } = require('../config/firebase');

// Create a new forum thread (Protected)
router.post('/', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }

        const newThread = {
            title,
            content,
            userId: req.user.id,
            userName: req.user.name,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('forum_threads').add(newThread);
        res.status(201).json({ id: docRef.id, ...newThread });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error creating thread.' });
    }
});

// Get all forum threads
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('forum_threads')
            .orderBy('createdAt', 'desc')
            .get();

        const threads = [];
        snapshot.forEach(doc => {
            threads.push({ id: doc.id, ...doc.data() });
        });

        res.json(threads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching threads.' });
    }
});

module.exports = router;
