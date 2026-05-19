import { Link } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  const user = null; // We'll get this from auth context later

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="logo">CineCore</Link>
        
        <div className="menu-container">
          <Link to="/" className="menu-item">Home</Link>
          <Link to="/movies" className="menu-item">Filmes</Link>
          <Link to="/series" className="menu-item">Séries</Link>
          <Link to="/forum" className="menu-item">Fórum</Link>
        </div>

        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input type="text" placeholder="Buscar filmes..." className="search-input" />
        </div>

        <div className="auth-container">
          {user ? (
            <div className="user-profile">
              <User size={20} />
              <span>{user.name}</span>
              <button className="logout-btn"><LogOut size={18} /></button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
