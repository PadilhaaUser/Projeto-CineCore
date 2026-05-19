import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Filter } from 'lucide-react';
import axios from 'axios';
import './Home.css';

// Componente para renderizar um carrossel de filmes
function MovieCarousel({ title, endpoint, params = {} }) {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, { params });
        setMovies(res.data.results);
      } catch (err) {
        console.error(`Error fetching ${title}:`, err);
      }
    };
    fetchMovies();
  }, [endpoint, params]);

  if (movies.length === 0) return null;

  return (
    <section className="category-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-scroll-container">
        {movies.map(movie => (
          <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-small">
            <div className="movie-poster">
              <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : '/placeholder.jpg'} alt={movie.title} />
              <div className="movie-overlay">
                <button className="view-btn">Detalhes</button>
              </div>
            </div>
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <div className="movie-meta-card">
                <Star size={14} fill="var(--rating-color)" color="var(--rating-color)" />
                <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const [trending, setTrending] = useState([]);
  const [genres, setGenres] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch trending
    axios.get(`${import.meta.env.VITE_API_URL}/movies/trending`)
      .then(res => setTrending(res.data.results))
      .catch(err => console.error(err));

    // Fetch genres
    axios.get(`${import.meta.env.VITE_API_URL}/movies/genres`)
      .then(res => setGenres(res.data.genres))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && !selectedGenre && !minRating) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let results = [];
      
      if (searchQuery.trim()) {
        // Text Search
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/movies/search?q=${searchQuery}`);
        results = res.data.results;

        // Apply local filtering since TMDB search doesn't accept filters natively
        if (selectedGenre) {
          results = results.filter(m => m.genre_ids && m.genre_ids.includes(parseInt(selectedGenre)));
        }
        if (minRating) {
          results = results.filter(m => m.vote_average >= parseFloat(minRating));
        }
      } else {
        // Discover Search (no text, just filters)
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/movies/discover`, {
          params: { genre: selectedGenre, minRating }
        });
        results = res.data.results;
      }

      setSearchResults(results);
    } catch (err) {
      console.error("Error searching movies:", err);
    }
  };

  const getBackdropUrl = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : '';
  const featured = trending[0];

  return (
    <div className="home-container">
      {/* Hero Section */}
      {featured && !isSearching && (
        <div 
          className="hero-section animate-fade-in"
          style={{ backgroundImage: `linear-gradient(to top, var(--bg-primary) 0%, transparent 100%), url(${getBackdropUrl(featured.backdrop_path)})` }}
        >
          <div className="hero-content">
            <h1 className="hero-title">{featured.title}</h1>
            <div className="hero-meta">
              <span className="rating"><Star size={16} fill="var(--rating-color)" color="var(--rating-color)" /> {featured.vote_average.toFixed(1)} / 10 (TMDB)</span>
              <span>{new Date(featured.release_date).getFullYear()}</span>
            </div>
            <p className="hero-overview">{featured.overview}</p>
            <Link to={`/movie/${featured.id}`} className="hero-btn">Ver Detalhes</Link>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="search-hero-section" style={{ marginTop: isSearching ? '80px' : '0' }}>
          <h2>Encontre seu próximo filme favorito</h2>
          
          <form onSubmit={handleSearch} className="advanced-search-form glass-panel">
            <div className="search-input-group">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Digite o nome do filme..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filters-group">
              <div className="filter-item">
                <Filter size={16} color="var(--text-secondary)" />
                <select 
                  value={selectedGenre} 
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todas Categorias</option>
                  {genres.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <Star size={16} color="var(--text-secondary)" />
                <select 
                  value={minRating} 
                  onChange={(e) => setMinRating(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Qualquer Nota</option>
                  <option value="6">Maior que 6.0</option>
                  <option value="7">Maior que 7.0</option>
                  <option value="8">Maior que 8.0</option>
                  <option value="9">Maior que 9.0</option>
                </select>
              </div>

              <button type="submit" className="search-btn">Buscar</button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {isSearching ? (
          <section className="search-results-section">
            <h2 className="section-title">Resultados da Busca</h2>
            <div className="movie-grid">
              {searchResults.length > 0 ? searchResults.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card">
                  <div className="movie-poster">
                    <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.jpg'} alt={movie.title} />
                    <div className="movie-overlay">
                      <button className="view-btn">Detalhes</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <div className="movie-meta-card">
                      <Star size={14} fill="var(--rating-color)" color="var(--rating-color)" />
                      <span>{movie.vote_average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="no-results">Nenhum filme encontrado com estes filtros.</p>
              )}
            </div>
          </section>
        ) : (
          /* Default Home Content */
          <>
            <MovieCarousel title="Em Alta na Semana" endpoint="/movies/trending" />
            
            {/* Dynamic Genre Categories */}
            {genres.filter(g => ['Ação', 'Terror', 'Suspense', 'Ficção científica', 'Comédia'].includes(g.name)).map(genre => (
              <MovieCarousel 
                key={genre.id} 
                title={genre.name} 
                endpoint="/movies/discover" 
                params={{ genre: genre.id }} 
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
