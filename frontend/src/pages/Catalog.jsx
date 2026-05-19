import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Filter } from 'lucide-react';
import axios from 'axios';
import './Home.css'; // Reusing Home CSS

// Componente para renderizar um carrossel de mídia (filme/série)
function MediaCarousel({ title, endpoint, mediaType, params = {} }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, { params });
        setItems(res.data.results);
      } catch (err) {
        console.error(`Error fetching ${title}:`, err);
      }
    };
    fetchItems();
  }, [endpoint, params]);

  if (items.length === 0) return null;

  return (
    <section className="category-section">
      <h2 className="section-title">{title}</h2>
      <div className="movie-scroll-container">
        {items.map(item => {
          // TMDB returns 'name' for TV and 'title' for movies
          const displayTitle = item.title || item.name;
          const linkPath = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;
          
          return (
            <Link to={linkPath} key={item.id} className="movie-card-small">
              <div className="movie-poster">
                <img src={item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '/placeholder.jpg'} alt={displayTitle} />
                <div className="movie-overlay">
                  <button className="view-btn">Detalhes</button>
                </div>
              </div>
              <div className="movie-info">
                <h3>{displayTitle}</h3>
                <div className="movie-meta-card">
                  <Star size={14} fill="var(--rating-color)" color="var(--rating-color)" />
                  <span>{item.vote_average?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// mediaType prop: 'movies' or 'tv'
function Catalog({ mediaType = 'movies' }) {
  const [trending, setTrending] = useState([]);
  const [genres, setGenres] = useState([]);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState('');
  
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reset state when changing mediaType
  useEffect(() => {
    setSearchQuery('');
    setSelectedGenre('');
    setMinRating('');
    setIsSearching(false);
    setSearchResults([]);

    // Fetch trending
    axios.get(`${import.meta.env.VITE_API_URL}/${mediaType}/trending`)
      .then(res => setTrending(res.data.results))
      .catch(err => console.error(err));

    // Fetch genres
    axios.get(`${import.meta.env.VITE_API_URL}/${mediaType}/genres`)
      .then(res => setGenres(res.data.genres))
      .catch(err => console.error(err));
  }, [mediaType]);

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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/${mediaType}/search?q=${searchQuery}`);
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
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/${mediaType}/discover`, {
          params: { genre: selectedGenre, minRating }
        });
        results = res.data.results;
      }

      setSearchResults(results);
    } catch (err) {
      console.error(`Error searching ${mediaType}:`, err);
    }
  };

  const getBackdropUrl = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : '';
  const featured = trending[0];

  const pageTitle = mediaType === 'tv' ? "Séries" : "Filmes";
  const searchPlaceholder = mediaType === 'tv' ? "Digite o nome da série..." : "Digite o nome do filme...";

  // Default genres to show if available
  const displayGenres = mediaType === 'tv' 
    ? ['Drama', 'Comédia', 'Animação', 'Crime', 'Mistério']
    : ['Ação', 'Terror', 'Suspense', 'Ficção científica', 'Comédia'];

  return (
    <div className="home-container">
      {/* Hero Section */}
      {featured && !isSearching && (
        <div 
          className="hero-section animate-fade-in"
          style={{ backgroundImage: `linear-gradient(to top, var(--bg-primary) 0%, transparent 100%), url(${getBackdropUrl(featured.backdrop_path)})` }}
        >
          <div className="hero-content">
            <h1 className="hero-title">{featured.title || featured.name}</h1>
            <div className="hero-meta">
              <span className="rating"><Star size={16} fill="var(--rating-color)" color="var(--rating-color)" /> {featured.vote_average.toFixed(1)} / 10 (TMDB)</span>
              <span>{new Date(featured.release_date || featured.first_air_date).getFullYear()}</span>
            </div>
            <p className="hero-overview">{featured.overview}</p>
            <Link to={mediaType === 'tv' ? `/tv/${featured.id}` : `/movie/${featured.id}`} className="hero-btn">Ver Detalhes</Link>
          </div>
        </div>
      )}

      <div className="content-wrapper">
        <div className="search-hero-section" style={{ marginTop: isSearching ? '80px' : '0' }}>
          <h2>Encontre seu próximo favorito em {pageTitle}</h2>
          
          <form onSubmit={handleSearch} className="advanced-search-form glass-panel">
            <div className="search-input-group">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder={searchPlaceholder} 
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
              {searchResults.length > 0 ? searchResults.map(item => (
                <Link to={mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`} key={item.id} className="movie-card">
                  <div className="movie-poster">
                    <img src={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg'} alt={item.title || item.name} />
                    <div className="movie-overlay">
                      <button className="view-btn">Detalhes</button>
                    </div>
                  </div>
                  <div className="movie-info">
                    <h3>{item.title || item.name}</h3>
                    <div className="movie-meta-card">
                      <Star size={14} fill="var(--rating-color)" color="var(--rating-color)" />
                      <span>{item.vote_average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <p className="no-results">Nenhum resultado encontrado com estes filtros.</p>
              )}
            </div>
          </section>
        ) : (
          /* Default Catalog Content */
          <>
            <MediaCarousel title="Em Alta na Semana" endpoint={`/${mediaType}/trending`} mediaType={mediaType} />
            
            {/* Dynamic Genre Categories */}
            {genres.filter(g => displayGenres.includes(g.name)).map(genre => (
              <MediaCarousel 
                key={genre.id} 
                title={genre.name} 
                endpoint={`/${mediaType}/discover`} 
                params={{ genre: genre.id }} 
                mediaType={mediaType}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default Catalog;
