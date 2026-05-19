import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Star, Clock, Calendar, Film, Users } from 'lucide-react';
import './MovieDetail.css';

function MovieDetail() {
  const { id } = useParams();
  const location = useLocation();
  const mediaType = location.pathname.includes('/tv/') ? 'tv' : 'movies';
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/${mediaType}/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error("Error fetching movie details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) return <div className="loading">Carregando...</div>;
  if (!movie) return <div className="error">Filme não encontrado.</div>;

  const getImageUrl = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder.jpg';
  const getBackdropUrl = (path) => path ? `https://image.tmdb.org/t/p/original${path}` : '';

  return (
    <div className="movie-detail-container">
      {/* Backdrop Header */}
      <div 
        className="detail-hero animate-fade-in"
        style={{ backgroundImage: `linear-gradient(to right, var(--bg-primary) 20%, transparent 100%), linear-gradient(to top, var(--bg-primary) 0%, transparent 50%), url(${getBackdropUrl(movie.backdrop_path)})` }}
      >
        <div className="detail-hero-content">
          <div className="poster-container">
            <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="detail-poster" />
          </div>
          <div className="info-container">
            <h1 className="detail-title">{movie.title || movie.name}</h1>
            <p className="detail-tagline">{movie.tagline}</p>
            
            <div className="detail-meta">
              <span className="meta-item"><Calendar size={16} /> {new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
              {movie.runtime || movie.episode_run_time?.length > 0 ? (
                <span className="meta-item"><Clock size={16} /> {movie.runtime || movie.episode_run_time?.[0]} min</span>
              ) : null}
              <span className="meta-item"><Film size={16} /> {movie.genres?.map(g => g.name).join(', ')}</span>
            </div>

            <div className="ratings-container glass-panel">
              <div className="rating-box">
                <span className="rating-label">TMDB</span>
                <span className="rating-score"><Star size={20} fill="var(--rating-color)" color="var(--rating-color)" /> {movie.vote_average.toFixed(1)}</span>
              </div>
              {movie.omdb && movie.omdb.imdbRating !== 'N/A' && (
                <div className="rating-box">
                  <span className="rating-label">IMDb</span>
                  <span className="rating-score"><Star size={20} fill="var(--rating-color)" color="var(--rating-color)" /> {movie.omdb.imdbRating}</span>
                </div>
              )}
            </div>

            <div className="overview-section">
              <h3>Sinopse</h3>
              <p>{movie.overview}</p>
            </div>

            {movie.watch_providers && movie.watch_providers.flatrate && (
              <div className="providers-section">
                <h3>Onde Assistir</h3>
                <div className="provider-list">
                  {movie.watch_providers.flatrate.map(provider => (
                    <div key={provider.provider_id} className="provider-item" title={provider.provider_name}>
                      <img src={`https://image.tmdb.org/t/p/original${provider.logo_path}`} alt={provider.provider_name} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
        <div className="cast-section content-wrapper">
          <h2 className="section-title"><Users size={24} style={{display: 'inline', marginRight: '10px'}}/>Atores Principais</h2>
          <div className="cast-scroll-container">
            {movie.credits.cast.slice(0, 15).map(actor => (
              <div key={actor.id} className="cast-card glass-panel">
                <div className="cast-photo">
                  <img src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/placeholder.jpg'} alt={actor.name} />
                </div>
                <div className="cast-info">
                  <p className="cast-name">{actor.name}</p>
                  <p className="cast-character">{actor.character}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rotten Tomatoes Style Reviews Section */}
      <div className="reviews-section content-wrapper">
        <h2 className="section-title">Avaliações da Comunidade</h2>
        <div className="reviews-container glass-panel">
          <p style={{color: 'var(--text-secondary)'}}>O banco de dados de avaliações (Firebase) ainda precisa ser configurado no backend para salvar e carregar avaliações reais.</p>
          
          <div className="review-form">
            <h3>Deixe sua avaliação</h3>
            <textarea placeholder="O que você achou deste filme?" rows="4" className="review-input"></textarea>
            <div className="review-actions">
              <div className="star-selector">
                 {[1,2,3,4,5].map(star => <Star key={star} size={24} color="var(--text-secondary)" className="star-hover" />)}
              </div>
              <button className="submit-btn">Publicar Avaliação</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
