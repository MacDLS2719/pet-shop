import { useNavigate, useLocation } from 'react-router-dom';
import heroPetsImg from '../assets/hero-pets.png';

function Dashboard({ usuario, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'mascotas',     path: '/mascotas',     label: 'Mascotas',     icon: '🐾' },
    { id: 'agendamiento', path: '/agendamiento',  label: 'Agendamiento', icon: '📅' },
    { id: 'historico',    path: '/historico',     label: 'Histórico',    icon: '📋' },
  ];

  const activeTab = tabs.find(t => location.pathname.startsWith(t.path))?.id || 'mascotas';
  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : '??';

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <header className="hero" id="hero-section">
        <div className="hero__bubbles">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="hero__bubble" />)}
        </div>

        {/* User bar */}
        <div className="user-bar" id="user-bar">
          <div className="user-bar__info">
            <div className="user-bar__avatar-icon">{getInitials(usuario?.username)}</div>
            <span>{usuario?.username || 'Usuario'}</span>
          </div>
          <button className="user-bar__logout" onClick={onLogout} id="logout-btn">
            🚪 Salir
          </button>
        </div>

        {/* Content */}
        <div className="hero__content">
          <div className="hero__text">
            <span className="hero__tag">pet shop</span>
            <h1 className="hero__title">burbujas y ladridos</h1>
            <div className="hero__slogan">
              <span>✨</span>
              "cada baño es una fiesta de burbujas"
              <span>🐶</span><span>🐾</span>
            </div>
          </div>
          <div className="hero__image">
            <img src={heroPetsImg} alt="Mascotas felices en la bañera" />
          </div>
        </div>
      </header>

      {/* ── Tabs nav ──────────────────────────────────── */}
      <nav className="nav-tabs" id="nav-tabs">
        <ul className="nav-tabs__list">
          {tabs.map(tab => (
            <li key={tab.id}>
              <button
                id={`tab-${tab.id}`}
                className={`nav-tabs__btn ${activeTab === tab.id ? 'nav-tabs__btn--active' : ''}`}
                onClick={() => navigate(tab.path)}
              >
                <span className="nav-tabs__icon">{tab.icon}</span>
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

export default Dashboard;
