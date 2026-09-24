import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import MascotasPage from './pages/MascotasPage';
import AgendamientoPage from './pages/AgendamientoPage';
import HistoricoPage from './pages/HistoricoPage';
import './App.css';

// ── Ruta Protegida ───────────────────────────────────────────
function RutaProtegida({ usuario, children }) {
  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

// ── Shell Layout para el Dashboard ───────────────────────────
function DashboardWrapper({ usuario, onLogout }) {
  return (
    <div className="dashboard">
      <Dashboard usuario={usuario} onLogout={onLogout} />
      <div
        className="main-content"
        id="main-content"
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 64px' }}
      >
        <Outlet />
      </div>
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('usuario');
    if (saved) {
      try { setUsuario(JSON.parse(saved)); }
      catch { localStorage.removeItem('usuario'); }
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (user) => setUsuario(user);
  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a3d91, #1565c0, #2196f3)',
        color: 'white', fontFamily: "'Fredoka', sans-serif", fontSize: '1.4rem', gap: '12px',
      }}>
        <div style={{
          width: '26px', height: '26px',
          border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
          borderRadius: '50%', animation: 'spin 0.7s linear infinite',
        }} />
        Cargando...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* 1. LANDING PAGE PÚBLICA (Accesible siempre en /) */}
        <Route path="/" element={<LandingPage usuario={usuario} />} />

        {/* 2. LOGIN (Si ya está logueado lo manda a /mascotas) */}
        <Route
          path="/login"
          element={usuario ? <Navigate to="/mascotas" replace /> : <LoginPage onLogin={handleLogin} />}
        />

        {/* 3. RUTAS PROTEGIDAS DEL DASHBOARD */}
        <Route
          element={
            <RutaProtegida usuario={usuario}>
              <DashboardWrapper usuario={usuario} onLogout={handleLogout} />
            </RutaProtegida>
          }
        >
          <Route path="/mascotas"     element={<MascotasPage />} />
          <Route path="/agendamiento" element={<AgendamientoPage />} />
          <Route path="/historico"    element={<HistoricoPage />} />
        </Route>

        {/* CUALQUIER OTRA RUTA NO EXISTENTE REDIRIGE A LA LANDING */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;