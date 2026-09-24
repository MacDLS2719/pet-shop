import { useState, useEffect } from 'react';
import "../mascotas.css";

const formatTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  const d = new Date(); d.setHours(h, m);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (s) => {
  if (!s) return '';
  return new Date(s + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
};

function HistoricoPage() {
  const [historico, setHistorico] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filtro, setFiltro] = useState('Todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [rA, rM] = await Promise.all([
          fetch('/api/agendamientos/'),
          fetch('/api/mascotas/')
        ]);
        if (rA.ok) {
          const data = await rA.json();
          // Solo completados y cancelados
          setHistorico(
            data
              .filter(a => a.estado === 'Completado' || a.estado === 'Cancelado')
              .sort((a, b) => new Date(`${b.fecha}T${b.hora_inicio || '00:00'}`) - new Date(`${a.fecha}T${a.hora_inicio || '00:00'}`))
          );
        }
        if (rM.ok) setMascotas(await rM.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const mascotasMap = {};
  mascotas.forEach(m => (mascotasMap[m.id] = m));

  const filtrados = historico
    .filter(a => filtro === 'Todos' ? true : a.estado === filtro)
    .filter(a => {
      if (!search) return true;
      const term = search.toLowerCase();
      const mascota = mascotasMap[a.mascota_id];
      return (
        mascota?.nombre_mascota?.toLowerCase().includes(term) ||
        mascota?.propietario?.nombre?.toLowerCase().includes(term) ||
        mascota?.propietario?.cedula?.toLowerCase().includes(term)
      );
    });

  return (
    <div className="mascotas-page">
      <div className="mascotas-page__header">
        <div>
          <h2 className="mascotas-page__title">📋 Histórico de Servicios</h2>
          <p className="mascotas-page__subtitle">Citas completadas y canceladas</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="tag" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ✅ Completados: {historico.filter(a => a.estado === 'Completado').length}
          </span>
          <span className="tag" style={{ padding: '6px 14px', fontSize: '0.85rem', background: '#fee2e2', color: '#b91c1c' }}>
            ❌ Cancelados: {historico.filter(a => a.estado === 'Cancelado').length}
          </span>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{ marginBottom: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        {['Todos', 'Completado', 'Cancelado'].map(e => (
          <button
            key={e}
            className={`tag ${filtro === e ? 'tag--gender' : ''}`}
            onClick={() => setFiltro(e)}
            style={{ border: 'none', cursor: 'pointer', padding: '6px 14px' }}
          >
            {e}
          </button>
        ))}
        <input
          type="text"
          placeholder="🔍 Buscar mascota o propietario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', minWidth: '240px' }}
        />
      </div>

      {loading && <div className="mascotas-loading"><div className="mascota-skeleton" /></div>}

      {!loading && filtrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <h3>Sin registros</h3>
          <p>No hay citas en el histórico para el filtro seleccionado.</p>
        </div>
      )}

      {!loading && filtrados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtrados.map(agenda => {
            const mascota = mascotasMap[agenda.mascota_id];
            const esCompletado = agenda.estado === 'Completado';
            return (
              <div
                key={agenda.id}
                className="mascota-card"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  padding: '14px 16px',
                  gap: '16px',
                  alignItems: 'center',
                  borderLeft: esCompletado ? '6px solid #10b981' : '6px solid #ef4444',
                  opacity: 0.92
                }}
              >
                {/* Fecha/Hora */}
                <div style={{ textAlign: 'center', minWidth: '95px', paddingRight: '12px', borderRight: '2px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: esCompletado ? '#065f46' : '#991b1b' }}>
                    {formatTime(agenda.hora_inicio)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    {formatDate(agenda.fecha)}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '1rem' }}>
                    🐾 {mascota?.nombre_mascota || `Mascota #${agenda.mascota_id}`}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>
                    🛠️ {agenda.servicios?.map(s => s.tipo).join(', ') || 'Sin servicios'} | 💵 ${agenda.precio_total ?? '—'}
                  </div>
                  {agenda.observaciones && (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '3px', fontStyle: 'italic' }}>
                      📝 {agenda.observaciones}
                    </div>
                  )}
                </div>

                {/* Estado + botón Ver */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <span
                    className="badge"
                    style={{ background: esCompletado ? '#d1fae5' : '#fee2e2', color: esCompletado ? '#065f46' : '#991b1b', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}
                  >
                    {agenda.estado}
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ padding: '4px 12px', fontSize: '0.82rem' }}
                    onClick={() => setSelected(agenda)}
                  >
                    👁 Ver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLE */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: '480px' }}>
            <div className="modal__header">
              <h3>Detalle del Servicio #{selected.id}</h3>
              <button className="modal__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Mascota:</strong> {mascotasMap[selected.mascota_id]?.nombre_mascota}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Propietario:</strong> {mascotasMap[selected.mascota_id]?.propietario?.nombre}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Fecha:</strong> {formatDate(selected.fecha)}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Horario:</strong> {formatTime(selected.hora_inicio)} – {formatTime(selected.hora_final)}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Duración:</strong> {selected.duracion ?? '—'} min
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Servicios:</strong> {selected.servicios?.map(s => s.tipo).join(', ') || 'Ninguno'}
                </p>
                <p style={{ margin: '0 0 6px 0' }}>
                  <strong>Precio Total:</strong> ${selected.precio_total ?? '—'}
                </p>
                {selected.transporte && (
                  <p style={{ margin: '0 0 6px 0' }}><strong>🚗 Transporte:</strong> Sí</p>
                )}
                {selected.tiene_pulgas && (
                  <p style={{ margin: '0 0 6px 0', color: '#92400e' }}><strong>🦠 Pulgas:</strong> Sí (tratamiento)</p>
                )}
                {selected.observaciones && (
                  <p style={{ margin: '0' }}><strong>📝 Observaciones:</strong> {selected.observaciones}</p>
                )}
              </div>
              <div style={{ textAlign: 'center' }}>
                <span
                  className="badge"
                  style={{
                    background: selected.estado === 'Completado' ? '#d1fae5' : '#fee2e2',
                    color: selected.estado === 'Completado' ? '#065f46' : '#991b1b',
                    padding: '6px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '700'
                  }}
                >
                  {selected.estado === 'Completado' ? '✅' : '❌'} {selected.estado}
                </span>
              </div>
              <div className="modal__actions" style={{ marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoricoPage;
