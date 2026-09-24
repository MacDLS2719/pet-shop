import { useState } from 'react';
import loginPetImg from '../assets/login-pet.jpg';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ruta relativa → Vite proxy la redirige a :8000 sin CORS
  const API_URL = import.meta.env.VITE_API_URL ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al iniciar sesión');
      }

      // Guardar usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      onLogin(data.usuario);
    } catch (err) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated bubbles */}
      <div className="login-bubbles">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="login-bubble" />
        ))}
      </div>

      <div className="login-card">
        <div className="login-card__header">
          <img
            src={loginPetImg}
            alt="Mascota en bañera"
            className="login-card__avatar"
          />
          <span className="login-card__brand-tag">pet shop</span>
          <h1 className="login-card__title">Burbujas y Ladridos</h1>
          <p className="login-card__subtitle">Ingresa a tu cuenta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          {error && (
            <div className="login-error" id="login-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-group__label" htmlFor="login-username">
              Usuario o Email
            </label>
            <div className="form-group__input-wrapper">
              <span className="form-group__icon">👤</span>
              <input
                id="login-username"
                type="text"
                className="form-group__input"
                placeholder="Usuario o email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-group__label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="form-group__input-wrapper">
              <span className="form-group__icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-group__input"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="form-group__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                id="toggle-password"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <>
                <div className="login-btn__spinner" />
                Ingresando...
              </>
            ) : (
              <>
                🐾 Ingresar
              </>
            )}
          </button>
        </form>

        <div className="login-card__footer">
          <p>© 2026 Burbujas y Ladridos - Pet Shop</p>
          <div className="login-card__paw-prints">
            <span>🐾</span>
            <span>🐾</span>
            <span>🐾</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
