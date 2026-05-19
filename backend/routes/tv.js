const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Search tv shows
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
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

// Get Genres List for TV
router.get('/genres', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/genre/tv/list`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching TV genres' });
    }
});

// Discover tv shows with filters
router.get('/discover', async (req, res) => {
    try {
        const { genre, minRating } = req.query;
        
        const params = {
            api_key: process.env.TMDB_API_KEY,
            language: 'pt-BR',
            sort_by: 'popularity.desc',
            'vote_count.gte': 50 
        };

        if (genre) params.with_genres = genre;
        if (minRating) params['vote_average.gte'] = minRating;

        const response = await axios.get(`${TMDB_BASE_URL}/discover/tv`, { params });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error discovering TV shows' });
    }
});

// Get trending tv shows
router.get('/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/trending/tv/week`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching trending TV shows' });
    }
});

// Get tv show details including TMDB details, Watch Providers, and OMDb rating
router.get('/:id', async (req, res) => {
    try {
        const tmdbId = req.params.id;

        // 1. Get TMDB details
        const tmdbResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                language: 'pt-BR',
                append_to_response: 'credits'
            }
        });
        const tmdbData = tmdbResponse.data;

        // 2. Get Watch Providers
        const providersResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/watch/providers`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });
        const providers = providersResponse.data.results.BR || {}; 

        // 3. Get OMDb Rating
        // TV Shows on TMDB don't always have imdb_id in the main response. We need external_ids if not present.
        // Actually, TV details endpoint returns external_ids if we append it. Let's try to get imdb_id if possible.
        // For simplicity, we just use the name for omdb search or if imdb_id is present.
        let omdbData = null;
        
        // Let's fetch external IDs to get IMDB ID for TV show
        const extIdsResponse = await axios.get(`${TMDB_BASE_URL}/tv/${tmdbId}/external_ids`, {
             params: { api_key: process.env.TMDB_API_KEY }
        });
        const imdbId = extIdsResponse.data.imdb_id;

        if (imdbId) {
            try {
                const omdbResponse = await axios.get(OMDB_BASE_URL, {
                    params: {
                        apikey: process.env.OMDB_API_KEY,
                        i: imdbId
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
        res.status(500).json({ error: 'Error fetching TV show details' });
    }
});

module.exports = router;
