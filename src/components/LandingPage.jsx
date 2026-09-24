import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage({ usuario }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const irAccionPrincipal = () => {
    if (usuario) {
      navigate('/mascotas');
    } else {
      navigate('/login');
    }
  };

  const servicios = [
    { icon: '🛁', nombre: 'Baño & Hidratación', desc: 'Limpieza profunda con champú especializado según el tipo de piel y pelaje de tu mascota. Secado y cepillado incluido.' },
    { icon: '✂️', nombre: 'Peluquería & Estilo', desc: 'Cortes adaptados a la raza, arreglo de cara, bigotes, patitas y uñas. Tu peludito sale fashion.' },
    { icon: '🦠', nombre: 'Tratamiento Antipulgas', desc: 'Baño medicado especial con productos veterinarios para eliminar parásitos y proteger a tu mascota.' },
    { icon: '🚗', nombre: 'Transporte a Domicilio', desc: 'Recogemos a tu consentido en la puerta de tu casa y te lo devolvemos limpio y feliz.' },
    { icon: '💅', nombre: 'Corte de Uñas', desc: 'Corte preciso y seguro de uñas para evitar lastimaduras y mantener la salud de las patitas.' },
    { icon: '🧴', nombre: 'Desparasitación Externa', desc: 'Aplicación de productos antiparasitarios recomendados para una protección completa.' },
  ];

  const testimonios = [
    { autor: 'Camila R.', mascota: 'Max (Golden Retriever)', texto: '¡Increíble! Max sale cada vez más hermoso y feliz. El equipo lo trata con mucho amor.', stars: 5 },
    { autor: 'Andrés P.', mascota: 'Luna (Poodle)', texto: 'El servicio de transporte es fantástico. Muy puntuales y cuidadosos con Luna.', stars: 5 },
    { autor: 'Valentina M.', mascota: 'Rocky (Bulldog)', texto: 'Excelente trato. Rocky es difícil pero aquí le tienen toda la paciencia del mundo.', stars: 5 },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", margin: 0, padding: 0, overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 5%', height: '70px',
        background: scrolled ? 'rgba(0,80,220,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,80,0.3)' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.6rem' }}>🐾</span>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '2px', textTransform: 'uppercase' }}>Pet Shop</div>
            <div style={{ color: '#ffcc00', fontWeight: '900', fontSize: '1.3rem', lineHeight: 1, letterSpacing: '-0.5px' }}>burbujas y ladridos</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#servicios" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.9 }}>Servicios</a>
          <a href="#nosotros" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.9 }}>Nosotros</a>
          <a href="#contacto" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.9 }}>Contacto</a>
          <button onClick={irAccionPrincipal} style={{
            background: '#ffcc00', color: '#003399', border: 'none',
            padding: '9px 22px', borderRadius: '25px', fontWeight: '800',
            fontSize: '0.9rem', cursor: 'pointer', transition: 'transform 0.15s',
          }}>
            {usuario ? '🐾 Ir al Panel' : '🔐 Ingresar'}
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0040cc 0%, #0066ff 50%, #0099ff 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: '80px 5% 60px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decoración de fondo */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-150px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,204,0,0.08)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center', width: '100%' }}>
          
          {/* Texto izquierda */}
          <div>
            <div style={{
              display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px',
              padding: '6px 18px', fontSize: '0.88rem', color: '#fff', marginBottom: '24px'
            }}>
              ✨ "Cada baño es una fiesta de burbujas" 🫧
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff', lineHeight: 1.1, margin: '0 0 20px 0' }}>
              El mejor cuidado<br />
              <span style={{ color: '#ffcc00' }}>para tu mascota</span> 🐶
            </h1>

            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: '480px', marginBottom: '36px' }}>
              En <strong>Burbujas y Ladridos</strong> consentimos a tu peludito con baños, peluquería, tratamientos y transporte a domicilio.
              ¡Porque merece lo mejor!
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button onClick={irAccionPrincipal} style={{
                background: '#ffcc00', color: '#003399', border: 'none',
                padding: '14px 32px', borderRadius: '30px', fontWeight: '900',
                fontSize: '1rem', cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                transition: 'transform 0.15s',
              }}
                onMouseOver={e => e.target.style.transform='scale(1.04)'}
                onMouseOut={e => e.target.style.transform='scale(1)'}
              >
                {usuario ? '🐾 Ir al Panel' : '🔐 Ingresar al Sistema'}
              </button>
              <a href="#contacto" style={{
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)',
                padding: '12px 28px', borderRadius: '30px', fontWeight: '700',
                fontSize: '1rem', cursor: 'pointer', textDecoration: 'none',
                display: 'inline-block',
              }}>
                📞 Contáctanos
              </a>
            </div>

            {/* Estadísticas */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '48px' }}>
              {[['🐾', '500+', 'Mascotas atendidas'], ['⭐', '4.9', 'Calificación promedio'], ['🚗', '100%', 'Transporte seguro']].map(([icon, val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '1.4rem' }}>{icon} <strong style={{ color: '#ffcc00', fontSize: '1.2rem' }}>{val}</strong></div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta derecha */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.25)', borderRadius: '28px',
            padding: '36px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '4rem' }}>🐶</span>
              <h3 style={{ color: '#ffcc00', fontWeight: '900', fontSize: '1.4rem', margin: '8px 0 4px' }}>Tu pet shop de confianza</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Amor, higiene y profesionalismo en cada servicio.
              </p>
            </div>
            {[
              ['✅', 'Productos 100% veterinarios y seguros'],
              ['✅', 'Personal capacitado y amante de los animales'],
              ['✅', 'Precios justos y transparentes'],
              ['✅', 'Agenda online disponible 24/7'],
              ['✅', 'Transporte a domicilio incluido'],
            ].map(([icon, texto]) => (
              <div key={texto} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span>{icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>{texto}</span>
              </div>
            ))}
            <button onClick={irAccionPrincipal} style={{
              width: '100%', marginTop: '20px', background: '#ffcc00', color: '#003399',
              border: 'none', padding: '13px', borderRadius: '20px', fontWeight: '900',
              fontSize: '1rem', cursor: 'pointer',
            }}>
              {usuario ? 'Ir al Panel →' : 'Agendar ahora →'}
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ─────────────────────────────── */}
      <section id="servicios" style={{ background: '#fff', padding: '80px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ color: '#0066ff', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Lo que hacemos
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
              Servicios Para Tu <span style={{ color: '#0066ff' }}>Consentido</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: '14px' }}>
              Todo lo que tu mascota necesita en un solo lugar.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {servicios.map((s, i) => (
              <div key={i} style={{
                background: '#f8fafc', borderRadius: '20px', padding: '28px',
                border: '1px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseOver={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,102,255,0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
              >
                <div style={{ fontSize: '2.8rem', marginBottom: '14px' }}>{s.icon}</div>
                <h3 style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem', margin: '0 0 8px' }}>{s.nombre}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NOSOTROS ─────────────────────────────── */}
      <section id="nosotros" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)', padding: '80px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          <div>
            <div style={{ color: '#0066ff', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Sobre nosotros</div>
            <h2 style={{ fontSize: '2.3rem', fontWeight: '900', color: '#0f172a', margin: '0 0 20px' }}>
              Amamos a tus mascotas<br/>
              <span style={{ color: '#0066ff' }}>como si fueran nuestras</span>
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.8, marginBottom: '20px' }}>
              Somos un equipo apasionado por el bienestar animal. Desde nuestros inicios, hemos trabajado con dedicación para ofrecer un espacio seguro, higiénico y lleno de amor para cada mascota que nos visita.
            </p>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.8 }}>
              Usamos productos de la más alta calidad, técnicas modernas de peluquería y un trato personalizado para que cada visita sea una experiencia positiva para tu consentido.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { val: '500+', label: 'Mascotas atendidas', icon: '🐾' },
              { val: '3+', label: 'Años de experiencia', icon: '🏆' },
              { val: '4.9★', label: 'Calificación clientes', icon: '⭐' },
              { val: '100%', label: 'Clientes satisfechos', icon: '❤️' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '18px', padding: '24px',
                textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0066ff' }}>{stat.val}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ──────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ color: '#0066ff', fontWeight: '700', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Testimonios</div>
            <h2 style={{ fontSize: '2.3rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>Lo que dicen nuestros clientes</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {testimonios.map((t, i) => (
              <div key={i} style={{ background: '#f8fafc', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#ffcc00', fontSize: '1.3rem', marginBottom: '12px' }}>{'★'.repeat(t.stars)}</div>
                <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 0 18px', fontStyle: 'italic' }}>
                  "{t.texto}"
                </p>
                <div>
                  <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{t.autor}</strong>
                  <div style={{ color: '#64748b', fontSize: '0.82rem' }}>🐾 {t.mascota}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0040cc, #0066ff)',
        padding: '80px 5%', textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#fff', margin: '0 0 16px' }}>
            ¿Listo para consentir<br/>a tu mascota? 🐾
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Ingresa al sistema, registra a tu peludito y agenda su próxima cita con nosotros.
          </p>
          <button onClick={irAccionPrincipal} style={{
            background: '#ffcc00', color: '#003399', border: 'none',
            padding: '16px 40px', borderRadius: '35px', fontWeight: '900',
            fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          }}>
            {usuario ? '🐾 Ir al Panel →' : '🔐 Ingresar al Sistema →'}
          </button>
        </div>
      </section>

      {/* ── CONTACTO / FOOTER ────────────────────── */}
      <footer id="contacto" style={{ background: '#0a1628', color: '#94a3b8', padding: '60px 5% 30px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '48px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>🐾</span>
                <span style={{ color: '#ffcc00', fontWeight: '900', fontSize: '1.2rem' }}>Burbujas y Ladridos</span>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '300px' }}>
                Tu peluquería canina de confianza. Amor, higiene y profesionalismo en cada servicio.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '16px' }}>Servicios</h4>
              {['Baño y Ducha', 'Peluquería', 'Antipulgas', 'Transporte', 'Corte de Uñas'].map(s => (
                <div key={s} style={{ marginBottom: '8px', fontSize: '0.88rem' }}>{s}</div>
              ))}
            </div>
            <div>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '16px' }}>Contacto</h4>
              <div style={{ marginBottom: '10px', fontSize: '0.88rem' }}>📞 +57 300 000 0000</div>
              <div style={{ marginBottom: '10px', fontSize: '0.88rem' }}>📧 hola@burbujasyladridos.com</div>
              <div style={{ marginBottom: '10px', fontSize: '0.88rem' }}>📍 Bogotá, Colombia</div>
              <div style={{ marginBottom: '10px', fontSize: '0.88rem' }}>⏰ Lun–Sáb: 8am – 6pm</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '24px', textAlign: 'center', fontSize: '0.82rem' }}>
            © {new Date().getFullYear()} <strong style={{ color: '#fff' }}>Burbujas y Ladridos</strong> Pet Shop. Todos los derechos reservados. 🐾
          </div>
        </div>
      </footer>
    </div>
  );
}