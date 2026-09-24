import { useState, useEffect } from 'react';
import '../mascotas.css';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

// Función para calcular Hora Final = Hora Inicio + Duración (en minutos)
const calcularHoraFinal = (horaInicioStr, minutos) => {
  if (!horaInicioStr) return '';
  const [h, m] = horaInicioStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + parseInt(minutos || 0), 0);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

// Fecha de hoy en formato YYYY-MM-DD
const getHoy = () => new Date().toISOString().split('T')[0];

// Fecha de hoy + N días
const getFechaMas = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
};

function AgendamientoPage() {
  const [agendamientos, setAgendamientos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [tiposServicio, setTiposServicio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);

  // Búsqueda y Filtros
  const [searchMascota, setSearchMascota] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Formulario Principal Agendamiento
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [fecha, setFecha] = useState(getHoy());
  const [horaInicio, setHoraInicio] = useState('10:00');
  
  // CAMPOS SOLICITADOS: Duración y Precio
  const [duracion, setDuracion] = useState(30); 
  const [precioTotal, setPrecioTotal] = useState(0);

  const [transporteText, setTransporteText] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [tienePulgas, setTienePulgas] = useState(false);

  // Formulario Modal Nuevo Servicio
  const [tipoServicioNuevo, setTipoServicioNuevo] = useState('');
  const [valorServicioNuevo, setValorServicioNuevo] = useState('');
  const [tiempoServicioNuevo, setTiempoServicioNuevo] = useState(0);

  // Control Modal Detalle
  const [selectedAgenda, setSelectedAgenda] = useState(null);
  const [updateEstado, setUpdateEstado] = useState('');
  const [updateObservaciones, setUpdateObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [resMasc, resServ, resAgend] = await Promise.all([
        fetch('/api/mascotas/'),
        fetch('/api/tipos-servicio/'),
        fetch('/api/agendamientos/')
      ]);

      if (resMasc.ok) setMascotas(await resMasc.json());
      if (resServ.ok) setTiposServicio(await resServ.json());
      if (resAgend.ok) {
        const dataAgend = await resAgend.json();
        setAgendamientos(dataAgend.sort((a, b) =>
          new Date(`${a.fecha}T${a.hora_inicio || '00:00'}`) - new Date(`${b.fecha}T${b.hora_inicio || '00:00'}`)
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const handleMascotaSelect = (e) => {
    const id = parseInt(e.target.value);
    const mascota = mascotas.find(m => m.id === id);
    setSelectedMascota(mascota || null);

    if (mascota) {
      // Duración auto desde tipo_perro.tiempo_ducha
      const tiempoBase = mascota.tipo_perro?.tiempo_ducha || 30;
      recalcularDuracionYPrecio(mascota, serviciosSeleccionados, tiempoBase);

      // Si tiene pulgas: advertencia + fecha mínima = hoy + 2 días
      if (mascota.tiene_pulgas) {
        setTienePulgas(true);
        const dosDiasDespues = new Date();
        dosDiasDespues.setDate(dosDiasDespues.getDate() + 2);
        const fechaStr = dosDiasDespues.toISOString().split('T')[0];
        setFecha(fechaStr);
        // La advertencia se muestra en el JSX, no con alert
      } else {
        setTienePulgas(false);
      }
    }
  };

  // Recalcular dinámicamente Duración y Precio
  const recalcularDuracionYPrecio = (mascotaObj, listaServicios, baseTiempo) => {
    const tBase = baseTiempo !== undefined ? baseTiempo : (mascotaObj?.tipo_perro?.tiempo_ducha || 30);
    const tServicios = listaServicios.reduce((acc, s) => acc + (parseInt(s.tiempo_adicional) || 0), 0);
    setDuracion(tBase + tServicios);

    const totalPrecio = listaServicios.reduce((acc, s) => acc + parseFloat(s.valor || 0), 0);
    setPrecioTotal(totalPrecio);
  };

  // Toggle Checkbox Servicios
  const handleServiceToggle = (serv) => {
    let nuevosServicios = [];
    const exists = serviciosSeleccionados.some(s => s.id === serv.id);
    
    if (exists) {
      nuevosServicios = serviciosSeleccionados.filter(s => s.id !== serv.id);
    } else {
      nuevosServicios = [...serviciosSeleccionados, serv];
    }

    setServiciosSeleccionados(nuevosServicios);
    recalcularDuracionYPrecio(selectedMascota, nuevosServicios);
  };

  // Guardar nuevo servicio en la BD y añadirlo a la selección
  const handleCrearEInsertarServicio = async (e) => {
    e.preventDefault();
    if (!tipoServicioNuevo || !valorServicioNuevo) {
      alert('Ingresa tipo y valor del servicio.');
      return;
    }
    try {
      const res = await fetch('/api/tipos-servicio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: tipoServicioNuevo, valor: parseFloat(valorServicioNuevo) })
      });
      if (!res.ok) throw new Error('Error al crear servicio');
      const nuevoServicio = await res.json();

      // Recargar lista de servicios disponibles
      const resServ = await fetch('/api/tipos-servicio/');
      if (resServ.ok) setTiposServicio(await resServ.json());

      // Auto-seleccionar el nuevo servicio
      const listaActualizada = [...serviciosSeleccionados, nuevoServicio];
      setServiciosSeleccionados(listaActualizada);
      recalcularDuracionYPrecio(selectedMascota, listaActualizada);

      setTipoServicioNuevo('');
      setValorServicioNuevo('');
      setTiempoServicioNuevo(0);
      setShowNewServiceModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Enviar agendamiento
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMascota) {
      alert('Selecciona una mascota.');
      return;
    }

    if (serviciosSeleccionados.length === 0) {
      alert('Selecciona al menos un servicio.');
      return;
    }

    setSubmitting(true);
    try {
      // El backend calcula hora_final, duracion y precio_total desde los servicios y tipo_perro
      // Solo mandamos lo que AgendamientoCreate espera
      const body = {
        mascota_id: selectedMascota.id,
        // Solo IDs reales de la BD (no custom)
        servicios_ids: serviciosSeleccionados.map(s => s.id).filter(id => Number.isInteger(id)),
        fecha: fecha,
        hora_inicio: horaInicio,
        // transporte es boolean en el backend; si hay texto de dirección la ponemos en observaciones
        transporte: !!transporteText,
        observaciones: observaciones || (transporteText ? `Transporte: ${transporteText}` : null)
      };

      if (body.servicios_ids.length === 0) {
        throw new Error('Selecciona al menos un servicio de la lista.');
      }

      const res = await fetch('/api/agendamientos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al agendar cita');
      }

      await fetchDatos();
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedMascota(null);
    setServiciosSeleccionados([]);
    setFecha(getHoy());
    setHoraInicio('10:00');
    setDuracion(30);
    setPrecioTotal(0);
    setTransporteText('');
    setObservaciones('');
    setTienePulgas(false);
  };

  const openDetail = (agenda) => {
    setSelectedAgenda(agenda);
    setUpdateEstado(agenda.estado);
    setUpdateObservaciones(agenda.observaciones || '');
    setShowDetailModal(true);
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const url = new URL(`/api/agendamientos/${selectedAgenda.id}/estado`, window.location.origin);
      url.searchParams.append('nuevo_estado', updateEstado);
      if (updateObservaciones) url.searchParams.append('observaciones', updateObservaciones);

      const res = await fetch(url, { method: 'PATCH' });
      if (!res.ok) throw new Error('Error al actualizar el estado');
      
      await fetchDatos();
      setShowDetailModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Solo mostramos citas activas en esta vista
  const agendamientosFiltrados = agendamientos.filter(a =>
    a.estado === 'Agendado' || a.estado === 'En Proceso'
  );

  const mascotasFiltradas = mascotas.filter(m => {
    if (!searchMascota) return true;
    const term = searchMascota.toLowerCase();
    return m.nombre_mascota?.toLowerCase().includes(term) ||
           m.propietario?.cedula?.toLowerCase().includes(term) ||
           m.propietario?.nombre?.toLowerCase().includes(term);
  });

  return (
    <div className="mascotas-page">
      <div className="mascotas-page__header">
        <div>
          <h2 className="mascotas-page__title">📅 Agenda y Servicios</h2>
          <p className="mascotas-page__subtitle">Control de citas programadas</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ Nueva Cita</button>
      </div>

      {/* Contador de citas activas */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="tag tag--gender" style={{ padding: '5px 12px', fontSize: '0.85rem' }}>
          📅 Agendadas: {agendamientos.filter(a => a.estado === 'Agendado').length}
        </span>
        <span className="badge badge--green" style={{ padding: '5px 12px', fontSize: '0.85rem' }}>
          🛁 En Proceso: {agendamientos.filter(a => a.estado === 'En Proceso').length}
        </span>
      </div>

      {/* Lista de citas activas */}
      {!loading && agendamientosFiltrados.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">📅</div>
          <h3>Sin citas activas</h3>
          <p>No hay citas Agendadas ni En Proceso en este momento.</p>
        </div>
      )}

      {!loading && agendamientosFiltrados.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {agendamientosFiltrados.map(agenda => {
            const enProceso = agenda.estado === 'En Proceso';
            return (
              <div 
                key={agenda.id} 
                className="mascota-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  padding: '16px', 
                  gap: '16px', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  borderLeft: enProceso ? '6px solid #10b981' : '6px solid #3b82f6'
                }}
                onClick={() => openDetail(agenda)}
              >
                <div style={{ textAlign: 'center', minWidth: '100px', paddingRight: '12px', borderRight: '2px solid #e5e7eb' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                    {formatTime(agenda.hora_inicio)} - {formatTime(agenda.hora_final)}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '2px' }}>
                    {formatDate(agenda.fecha)}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem' }}>
                    🐾 {agenda.mascota?.nombre_mascota || `Mascota #${agenda.mascota_id}`}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    🛠️ <strong>Servicios:</strong> {agenda.servicios?.map(s => s.tipo).join(', ') || 'Ninguno'} | 💵 <strong>Total:</strong> ${agenda.precio_total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
                    ⏱️ Duración: <strong>{agenda.duracion} min</strong>
                    {agenda.transporte && <span style={{ marginLeft: '10px' }}>🚗 Transporte</span>}
                    {agenda.tiene_pulgas && <span style={{ marginLeft: '10px', color: '#d97706', fontWeight: 'bold' }}>🦠 Con Pulgas</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`badge ${enProceso ? 'badge--green' : 'badge--blue'}`}>
                    {agenda.estado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR CITA */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal__header">
              <h3>Agendar Nueva Cita</h3>
              <button className="modal__close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="modal__form">
              
              {/* Mascota */}
              <div className="form-field">
                <label>Mascota *</label>
                <input 
                  type="text" 
                  placeholder="🔍 Buscar mascota o dueño..." 
                  value={searchMascota} 
                  onChange={(e) => setSearchMascota(e.target.value)} 
                  style={{ marginBottom: '6px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                />
                <select onChange={handleMascotaSelect} required size="3" style={{ padding: '6px' }}>
                  {mascotasFiltradas.map(m => (
                    <option key={m.id} value={m.id}>

                      🐾 {m.nombre_mascota} ({m.raza || m.especie}) - Prop: {m.propietario?.nombre} {m.tiene_pulgas ? '🦠' : ''}
                    </option>
                  ))}
                </select>

                {/* Advertencia Pulgas */}
                {tienePulgas && (
                  <div style={{
                    marginTop: '8px', padding: '10px 14px', borderRadius: '8px',
                    background: '#fef3c7', border: '1px solid #f59e0b',
                    display: 'flex', alignItems: 'flex-start', gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>🦠</span>
                    <div>
                      <strong style={{ color: '#b45309' }}>Mascota con pulgas detectada</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.83rem', color: '#78350f' }}>
                        El agendamiento se programá <strong>2 días después</strong> de la fecha seleccionada
                        (regla antiparasitaria). La fecha mínima disponible se ha ajustado automáticamente.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Checkboxes Servicios */}
              <div className="form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>Servicios *</label>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setShowNewServiceModal(true)} 
                    style={{ padding: '3px 8px', fontSize: '0.8rem' }}
                  >
                    + Nuevo Servicio
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                  {tiposServicio.map(serv => {
                    const isChecked = serviciosSeleccionados.some(s => s.id === serv.id);
                    return (
                      <label key={serv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          onChange={() => handleServiceToggle(serv)} 
                        />
                        <span>{serv.tipo} (${serv.valor})</span>
                      </label>
                    );
                  })}

                  {serviciosSeleccionados.filter(s => s.isCustom).map(serv => (
                    <label key={serv.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', cursor: 'pointer', color: '#2563eb' }}>
                      <input 
                        type="checkbox" 
                        checked={true} 
                        onChange={() => handleServiceToggle(serv)} 
                      />
                      <span>⭐ {serv.tipo} (${serv.valor})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fecha y Hora */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-field">
                  <label>Fecha Cita *</label>
                  <input 
                    type="date"
                    min={tienePulgas ? getFechaMas(2) : getHoy()}
                    value={fecha} 
                    onChange={e => setFecha(e.target.value)} 
                    required 
                    style={tienePulgas ? { borderColor: '#f59e0b', background: '#fffbeb' } : {}}
                  />
                  {tienePulgas && (
                    <small style={{ color: '#b45309', fontSize: '0.75rem' }}>
                      ★ Reservado para tratamiento (2 días mín.)
                    </small>
                  )}
                </div>
                <div className="form-field">
                  <label>Hora Inicio *</label>
                  <input 
                    type="time" 
                    value={horaInicio} 
                    onChange={e => setHoraInicio(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Hora Final (auto)</label>
                  <input 
                    type="time" 
                    value={calcularHoraFinal(horaInicio, duracion)}
                    disabled
                    style={{ background: '#f3f4f6', color: '#6b7280' }}
                  />
                </div>
              </div>

              {/* CAMPOS AGREGADOS: DURACIÓN Y PRECIO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-field">
                  <label>Duración (Minutos) *</label>
                  <input 
                    type="number" 
                    value={duracion} 
                    onChange={e => setDuracion(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-field">
                  <label>Precio Total ($) *</label>
                  <input 
                    type="number" 
                    value={precioTotal} 
                    onChange={e => setPrecioTotal(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {/* Transporte */}
              <div className="form-field">
                <label>Transporte</label>
                <input 
                  type="text" 
                  placeholder="Ej: Dirección de recogida / Nota de transporte..." 
                  value={transporteText} 
                  onChange={e => setTransporteText(e.target.value)} 
                />
              </div>

              {/* Observaciones */}
              <div className="form-field">
                <label>Observaciones</label>
                <textarea 
                  value={observaciones} 
                  onChange={e => setObservaciones(e.target.value)} 
                  rows="2" 
                  placeholder="Detalles adicionales..." 
                />
              </div>

              {/* Pulgas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="chkPulgas" 
                  checked={tienePulgas} 
                  onChange={e => setTienePulgas(e.target.checked)} 
                />
                <label htmlFor="chkPulgas" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Mascota tiene pulgas</label>
              </div>

              <div className="modal__actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANEXAR SERVICIO */}
      {showNewServiceModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal" style={{ maxWidth: '380px' }}>
            <div className="modal__header">
              <h3>Anexar Nuevo Servicio</h3>
              <button className="modal__close" onClick={() => setShowNewServiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearEInsertarServicio} className="modal__form">
              <div className="form-field">
                <label>Tipo / Nombre del Servicio *</label>
                <input 
                  type="text" 
                  placeholder="Ej: CORTE ESPECIAL" 
                  value={tipoServicioNuevo} 
                  onChange={e => setTipoServicioNuevo(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-field">
                <label>Valor ($) *</label>
                <input 
                  type="number" 
                  placeholder="Ej: 25000" 
                  value={valorServicioNuevo} 
                  onChange={e => setValorServicioNuevo(e.target.value)} 
                  required 
                />
              </div>
              <div className="modal__actions">
                <button type="button" className="btn-secondary" onClick={() => setShowNewServiceModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Anexar Servicio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {showDetailModal && selectedAgenda && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDetailModal(false)}>
          <div className="modal" style={{ maxWidth: '450px' }}>
            <div className="modal__header">
              <h3>Detalle del Servicio</h3>
              <button className="modal__close" onClick={() => setShowDetailModal(false)}>✕</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px', background: '#f3f4f6', padding: '12px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 6px 0' }}><strong>Mascota:</strong> {selectedAgenda.mascota?.nombre_mascota}</p>
                <p style={{ margin: '0 0 6px 0' }}><strong>Horario:</strong> {formatTime(selectedAgenda.hora_inicio)} - {formatTime(selectedAgenda.hora_final)} ({selectedAgenda.duracion} min)</p>
                <p style={{ margin: '0 0 6px 0' }}><strong>Monto Total:</strong> ${selectedAgenda.precio_total}</p>
                {selectedAgenda.transporte && <p style={{ margin: '0 0 6px 0' }}><strong>Transporte:</strong> {selectedAgenda.transporte}</p>}
                {selectedAgenda.observaciones && <p style={{ margin: '0' }}><strong>Obs:</strong> {selectedAgenda.observaciones}</p>}
              </div>

              <div className="form-field" style={{ marginBottom: '12px' }}>
                <label>Estado del Servicio</label>
                <select value={updateEstado} onChange={e => setUpdateEstado(e.target.value)}>
                  <option value="Agendado">📅 Agendado</option>
                  <option value="En Proceso">🛁 En Proceso</option>
                  <option value="Completado">✅ Completado</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              <div className="form-field" style={{ marginBottom: '16px' }}>
                <label>Observaciones Finales</label>
                <textarea value={updateObservaciones} onChange={e => setUpdateObservaciones(e.target.value)} rows="3" />
              </div>

              <div className="modal__actions">
                <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Cerrar</button>
                <button className="btn-primary" onClick={handleUpdate} disabled={submitting}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgendamientoPage;