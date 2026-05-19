const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Search movies
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: query,
                language: 'pt-BR'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching from TMDB' });
    }
});

// Get Genres List
router.get('/genres', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching genres' });
    }
});

// Discover movies with filters
router.get('/discover', async (req, res) => {
    try {
        const { genre, minRating } = req.query;
        
        const params = {
            api_key: process.env.TMDB_API_KEY,
            language: 'pt-BR',
            sort_by: 'popularity.desc',
            'vote_count.gte': 50 // Ensures movies have at least 50 votes so rating is reliable
        };

        if (genre) params.with_genres = genre;
        if (minRating) params['vote_average.gte'] = minRating;

        const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, { params });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error discovering movies' });
    }
});

// Get trending movies
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching trending movies' });
    }
});

// Get movie details including TMDB details, Watch Providers, and OMDb rating
router.get('/:id', async (req, res) => {
    try {
        const tmdbId = req.params.id;

        // 1. Get TMDB details (contains IMDB ID)
        const tmdbResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR',
                append_to_response: 'credits'
            }
        });
        const tmdbData = tmdbResponse.data;

        // 2. Get Watch Providers
        const providersResponse = await axios.get(`${TMDB_BASE_URL}/movie/${tmdbId}/watch/providers`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });
        const providers = providersResponse.data.results.BR || {}; // Get Brazil providers

        // 3. Get OMDb Rating if IMDB ID exists
        let omdbData = null;
        if (tmdbData.imdb_id) {
            try {
                const omdbResponse = await axios.get(OMDB_BASE_URL, {
                    params: {
                        apikey: process.env.OMDB_API_KEY,
                        i: tmdbData.imdb_id
                    }
                });
                omdbData = omdbResponse.data;
            } catch (err) {
                console.error("OMDb fetch error", err.message);
            }
        }

        res.json({
            ...tmdbData,
            watch_providers: providers,
            omdb: omdbData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching movie details' });
    }
});

module.exports = router;
