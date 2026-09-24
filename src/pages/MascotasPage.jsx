import { useState, useEffect } from 'react';
import '../mascotas.css';

const especieIcon = (esp) => {
  const e = (esp || '').toLowerCase();
  if (e.includes('perro') || e.includes('dog')) return '🐶';
  if (e.includes('gato') || e.includes('cat')) return '🐱';
  if (e.includes('conejo')) return '🐰';
  if (e.includes('ave') || e.includes('pájaro')) return '🐦';
  return '🐾';
};

const calcularEdad = (fecha) => {
  if (!fecha) return '';
  const nac = new Date(fecha);
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad < 0 ? 0 : edad;
};

const EMPTY_PROPIETARIO = { nombre: '', cedula: '', telefono: '', email: '', direccion: '', acepta_politicas: false };
const EMPTY_MASCOTA = {
  nombre_mascota: '', especie: 'Perro', raza: '', fecha_nacimiento: '', edad: '', peso: '',
  color: '', genero: 'Macho', vacunas: false, esterilizacion: false, temperamento: '', tipo_perro_id: ''
};

function MascotasPage() {
  const [mascotas, setMascotas] = useState([]);
  const [tiposPerro, setTiposPerro] = useState([]);
  const [propietarios, setPropietarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del Formulario Modal
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [modoPropietario, setModoPropietario] = useState('existente'); // 'existente' | 'nuevo'
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal Tipos Perro
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState({ tipo: '', tiempo_ducha: '' });

  // Datos Formulario
  const [propietarioForm, setPropietarioForm] = useState(EMPTY_PROPIETARIO);
  const [propietarioSeleccionado, setPropietarioSeleccionado] = useState(null);
  const [mascotaForm, setMascotaForm] = useState(EMPTY_MASCOTA);
  const [selectedMascota, setSelectedMascota] = useState(null);

  // ── Fetch Inicial de Datos ─────────────────────────────────
  const fetchDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [resMascotas, resTipos, resProps] = await Promise.all([
        fetch('/api/mascotas/'),
        fetch('/api/tipos-perro/'),
        fetch('/api/propietarios/').catch(() => null) // Fallback si no existe la ruta
      ]);

      const dataMascotas = await resMascotas.json();
      if (!resMascotas.ok) throw new Error(dataMascotas.detail || 'Error al cargar mascotas');
      setMascotas(dataMascotas);

      if (resTipos.ok) {
        const dataTipos = await resTipos.json();
        setTiposPerro(dataTipos);
      }

      // Obtener lista única de propietarios
      if (resProps && resProps.ok) {
        const dataProps = await resProps.json();
        setPropietarios(dataProps);
      } else {
        // Extraer propietarios únicos desde las mascotas devueltas
        const propsMap = new Map();
        dataMascotas.forEach(m => {
          if (m.propietario?.id) propsMap.set(m.propietario.id, m.propietario);
        });
        setPropietarios(Array.from(propsMap.values()));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  // ── Handlers Propietario ──────────────────────────────────
  const handleSelectPropietarioExistente = (e) => {
    const id = parseInt(e.target.value);
    if (!id) {
      setPropietarioSeleccionado(null);
      return;
    }
    const prop = propietarios.find(p => p.id === id);
    setPropietarioSeleccionado(prop || null);
  };

  const handlePropChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPropietarioForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleMascChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMascotaForm(f => {
      const newForm = { ...f, [name]: type === 'checkbox' ? checked : value };
      if (name === 'fecha_nacimiento') newForm.edad = calcularEdad(value);
      return newForm;
    });
  };

  // ── Navegación Paso 1 -> Paso 2 ───────────────────────────
  const handleStep1 = (e) => {
    e.preventDefault();
    setFormError('');

    if (modoPropietario === 'existente') {
      if (!propietarioSeleccionado) {
        return setFormError('Por favor selecciona un propietario existente de la lista.');
      }
    } else {
      if (!propietarioForm.nombre.trim()) return setFormError('El nombre es requerido.');
      if (!propietarioForm.cedula.trim()) return setFormError('La cédula es requerida.');
      if (!propietarioForm.acepta_politicas) return setFormError('El propietario debe aceptar la política de tratamiento de datos.');
    }

    setStep(2);
  };

  // ── Envío del Formulario ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!mascotaForm.nombre_mascota.trim()) {
      return setFormError('El nombre de la mascota es requerido.');
    }

    setSubmitting(true);
    try {
      const body = {
        nombre_mascota: mascotaForm.nombre_mascota,
        especie: mascotaForm.especie,
        raza: mascotaForm.raza || null,
        fecha_nacimiento: mascotaForm.fecha_nacimiento || null,
        edad: mascotaForm.edad !== '' ? parseInt(mascotaForm.edad) : null,
        peso: mascotaForm.peso !== '' ? parseFloat(mascotaForm.peso) : null,
        color: mascotaForm.color || null,
        genero: mascotaForm.genero || null,
        vacunas: mascotaForm.vacunas,
        esterilizacion: mascotaForm.esterilizacion,
        temperamento: mascotaForm.temperamento || null,
        tipo_perro_id: mascotaForm.especie === 'Perro' && mascotaForm.tipo_perro_id ? parseInt(mascotaForm.tipo_perro_id) : null,
        ...(modoPropietario === 'existente' 
          ? { propietario_id: propietarioSeleccionado.id } 
          : { propietario: propietarioForm })
      };

      const res = await fetch('/api/mascotas/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar la mascota');

      await fetchDatos();
      cerrarModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCrearTipo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tipos-perro/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: nuevoTipo.tipo, tiempo_ducha: parseInt(nuevoTipo.tiempo_ducha) })
      });
      if (res.ok) {
        const data = await res.json();
        setTiposPerro([...tiposPerro, data]);
        setMascotaForm(f => ({ ...f, tipo_perro_id: data.id }));
        setShowTipoModal(false);
        setNuevoTipo({ tipo: '', tiempo_ducha: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setStep(1);
    setModoPropietario('existente');
    setFormError('');
    setPropietarioForm(EMPTY_PROPIETARIO);
    setPropietarioSeleccionado(null);
    setMascotaForm(EMPTY_MASCOTA);
  };

  return (
    <div className="mascotas-page">
      <div className="mascotas-page__header">
        <div>
          <h2 className="mascotas-page__title">🐾 Mascotas Registradas</h2>
          <p className="mascotas-page__subtitle">{mascotas.length} mascota{mascotas.length !== 1 ? 's' : ''} en el sistema</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Nueva mascota</button>
      </div>

      {loading && <div className="mascotas-loading">{[1,2,3].map(i => <div key={i} className="mascota-skeleton" />)}</div>}

      {error && !loading && (
        <div className="mascotas-error">
          <span>⚠️</span> {error}
          <button onClick={fetchDatos} className="btn-retry">Reintentar</button>
        </div>
      )}

      {!loading && !error && mascotas.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🐶</div>
          <h3>Sin mascotas aún</h3>
          <p>Registra la primera mascota usando el botón superior.</p>
        </div>
      )}

      {!loading && !error && mascotas.length > 0 && (
        <div className="mascotas-grid">
          {mascotas.map((m) => (
            <div key={m.id} className="mascota-card" onClick={() => setSelectedMascota(m)}>
              <div className="mascota-card__avatar">
                <span>{especieIcon(m.especie)}</span>
              </div>
              <div className="mascota-card__body">
                <h3 className="mascota-card__name">{m.nombre_mascota}</h3>
                <span className="mascota-card__especie">{m.especie}{m.raza ? ` · ${m.raza}` : ''}</span>
                <div className="mascota-card__tags">
                  {m.edad != null && <span className="tag">🎂 {m.edad} años</span>}
                  {m.peso != null && <span className="tag">⚖️ {m.peso} kg</span>}
                  {m.tipo_perro && <span className="tag">🚿 {m.tipo_perro.tipo}</span>}
                </div>
              </div>
              <div className="mascota-card__owner">
                <span>👤</span>
                <div>
                  <div className="owner-name">{m.propietario?.nombre || '—'}</div>
                  <div className="owner-phone">{m.propietario?.telefono || ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR MASCOTA */}
      {showModal && !showTipoModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cerrarModal()}>
          <div className="modal">
            <div className="modal__header">
              <h3>{step === 1 ? '👤 Paso 1: Seleccionar Propietario' : '🐾 Paso 2: Datos de la Mascota'}</h3>
              <button className="modal__close" onClick={cerrarModal}>✕</button>
            </div>

            {/* PASO 1: PROPIETARIO */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="modal__form">
                {formError && <div className="form-error"><span>⚠️</span> {formError}</div>}

                {/* Selector de Modo */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    className={`btn-toggle ${modoPropietario === 'existente' ? 'active' : ''}`}
                    onClick={() => { setModoPropietario('existente'); setFormError(''); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    🔍 Buscar Existente
                  </button>
                  <button
                    type="button"
                    className={`btn-toggle ${modoPropietario === 'nuevo' ? 'active' : ''}`}
                    onClick={() => { setModoPropietario('nuevo'); setFormError(''); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    ➕ Nuevo Propietario
                  </button>
                </div>

                {/* MODO 1: BUSCAR PROPIETARIO EXISTENTE */}
                {modoPropietario === 'existente' && (
                  <div className="form-field">
                    <label>Seleccionar Propietario *</label>
                    <select
                      value={propietarioSeleccionado?.id || ''}
                      onChange={handleSelectPropietarioExistente}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px' }}
                    >
                      <option value="">-- Buscar por Nombre o Cédula --</option>
                      {propietarios.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (C.I/Cédula: {p.cedula}) - Tel: {p.telefono || 'Sin tel.'}
                        </option>
                      ))}
                    </select>

                    {propietarioSeleccionado && (
                      <div className="owner-found-banner" style={{ marginTop: '12px', padding: '12px', background: '#eef9f1', borderLeft: '4px solid #2e7d32', borderRadius: '4px' }}>
                        <div><strong>Cliente:</strong> {propietarioSeleccionado.nombre}</div>
                        <div><strong>Cédula:</strong> {propietarioSeleccionado.cedula}</div>
                        <div><strong>Teléfono:</strong> {propietarioSeleccionado.telefono || 'N/A'}</div>
                        <div><strong>Email:</strong> {propietarioSeleccionado.email || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* MODO 2: CREAR NUEVO PROPIETARIO */}
                {modoPropietario === 'nuevo' && (
                  <>
                    <div className="form-row">
                      <div className="form-field">
                        <label>Cédula / Documento *</label>
                        <input name="cedula" value={propietarioForm.cedula} onChange={handlePropChange} required />
                      </div>
                      <div className="form-field">
                        <label>Nombre Completo *</label>
                        <input name="nombre" value={propietarioForm.nombre} onChange={handlePropChange} required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label>Teléfono</label>
                        <input name="telefono" value={propietarioForm.telefono} onChange={handlePropChange} />
                      </div>
                      <div className="form-field">
                        <label>Email</label>
                        <input type="email" name="email" value={propietarioForm.email} onChange={handlePropChange} />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Dirección</label>
                      <input name="direccion" value={propietarioForm.direccion} onChange={handlePropChange} />
                    </div>

                    {/* Política de tratamiento de datos */}
                    <div style={{
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: '8px', padding: '14px', marginTop: '8px'
                    }}>
                      <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="acepta_politicas"
                          checked={propietarioForm.acepta_politicas}
                          onChange={handlePropChange}
                          style={{ marginTop: '3px', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '0.88rem', color: '#1e40af', lineHeight: '1.5' }}>
                          Autorizo el tratamiento de mis datos personales conforme a la{' '}
                          <strong>Ley 1581 de 2012</strong> y demás normas aplicables.
                          Los datos serán usados exclusivamente para la gestión de servicios de la peluquería.
                        </span>
                      </label>
                    </div>
                  </>
                )}

                <div className="modal__actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary">Siguiente: Datos de Mascota →</button>
                </div>
              </form>
            )}

            {/* PASO 2: MASCOTA */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="modal__form">
                {formError && <div className="form-error"><span>⚠️</span> {formError}</div>}

                {/* Fila 1: Nombre y Especie */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Nombre de la Mascota *</label>
                    <input name="nombre_mascota" value={mascotaForm.nombre_mascota} onChange={handleMascChange} required />
                  </div>
                  <div className="form-field">
                    <label>Especie *</label>
                    <select name="especie" value={mascotaForm.especie} onChange={handleMascChange}>
                      <option>Perro</option>
                      <option>Gato</option>
                      <option>Conejo</option>
                      <option>Ave</option>
                    </select>
                  </div>
                </div>

                {/* Fila 2: Raza y Género */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Raza</label>
                    <input name="raza" value={mascotaForm.raza} onChange={handleMascChange} placeholder="Ej: Poodle, Mestizo" />
                  </div>
                  <div className="form-field">
                    <label>Género</label>
                    <select name="genero" value={mascotaForm.genero} onChange={handleMascChange}>
                      <option>Macho</option>
                      <option>Hembra</option>
                    </select>
                  </div>
                </div>

                {/* Fila 3: Fecha Nacimiento y Edad */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Fecha Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={mascotaForm.fecha_nacimiento} onChange={handleMascChange} />
                  </div>
                  <div className="form-field">
                    <label>Edad Calculada</label>
                    <input type="text" value={mascotaForm.edad !== '' ? `${mascotaForm.edad} años` : ''} disabled style={{ background: '#f5f5f5' }} />
                  </div>
                </div>

                {/* Fila 4: Peso y Color */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                  <div className="form-field">
                    <label>Peso (Kg)</label>
                    <input type="number" step="0.1" name="peso" value={mascotaForm.peso} onChange={handleMascChange} placeholder="Ej: 4.5" />
                  </div>
                  <div className="form-field">
                    <label>Color</label>
                    <input name="color" value={mascotaForm.color} onChange={handleMascChange} placeholder="Ej: Blanco" />
                  </div>
                </div>

                {/* Fila 5: Temperamento y Tipo de Perro */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px', alignItems: 'end' }}>
                  <div className="form-field">
                    <label>Temperamento</label>
                    <input name="temperamento" value={mascotaForm.temperamento} onChange={handleMascChange} placeholder="Ej: Amigable, Nervioso" />
                  </div>

                  {mascotaForm.especie === 'Perro' ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <div className="form-field" style={{ flex: 1 }}>
                        <label>Tipo / Pelaje</label>
                        <select name="tipo_perro_id" value={mascotaForm.tipo_perro_id} onChange={handleMascChange}>
                          <option value="">Seleccione...</option>
                          {tiposPerro.map(t => <option key={t.id} value={t.id}>{t.tipo} ({t.tiempo_ducha} min)</option>)}
                        </select>
                      </div>
                      <button type="button" className="btn-secondary" style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} onClick={() => setShowTipoModal(true)}>+ Crear</button>
                    </div>
                  ) : (
                    <div></div> /* Espacio vacío para mantener la alineación de 2 columnas si no es Perro */
                  )}
                </div>

                {/* Checkboxes de Salud */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', margin: '16px 0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="vacunas" checked={mascotaForm.vacunas} onChange={handleMascChange} />
                    <span>💉 Vacunas al día</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="esterilizacion" checked={mascotaForm.esterilizacion} onChange={handleMascChange} />
                    <span>✂️ Esterilizado(a)</span>
                  </label>
                </div>

                {/* Acciones del Modal */}
                <div className="modal__actions">
                  <button type="button" className="btn-secondary" onClick={() => setStep(1)}>← Volver a Propietario</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Guardando...' : 'Guardar Mascota'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR TIPO PERRO */}
      {showTipoModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowTipoModal(false)} style={{ zIndex: 1010 }}>
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal__header">
              <h3>Nuevo Tipo de Perro</h3>
              <button className="modal__close" onClick={() => setShowTipoModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCrearTipo} className="modal__form">
              <div className="form-field">
                <label>Tipo / Tamaño (Ej: Pelo Largo)</label>
                <input required value={nuevoTipo.tipo} onChange={e => setNuevoTipo({...nuevoTipo, tipo: e.target.value})} />
              </div>
              <div className="form-field">                                                                                           
                <label>Tiempo de Ducha (minutos)</label>
                <input required type="number" min="1" value={nuevoTipo.tiempo_ducha} onChange={e => setNuevoTipo({...nuevoTipo, tiempo_ducha: e.target.value})} />
              </div>
              <div className="modal__actions">
                <button type="submit" className="btn-primary">Añadir Tipo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE MASCOTA */}
      {selectedMascota && (
        <div className="modal-overlay" onClick={() => setSelectedMascota(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{especieIcon(selectedMascota.especie)} {selectedMascota.nombre_mascota}</h3>
              <button className="modal__close" onClick={() => setSelectedMascota(null)}>✕</button>
            </div>
            <div className="modal__details" style={{ display: 'grid', gap: '10px' }}>
              <p><strong>Especie / Raza:</strong> {selectedMascota.especie} {selectedMascota.raza ? `(${selectedMascota.raza})` : ''}</p>
              <p><strong>Género:</strong> {selectedMascota.genero || '—'}</p>
              <p><strong>Edad / Peso:</strong> {selectedMascota.edad != null ? `${selectedMascota.edad} años` : '—'} | {selectedMascota.peso != null ? `${selectedMascota.peso} kg` : '—'}</p>
              <p><strong>Color:</strong> {selectedMascota.color || '—'}</p>
              <p><strong>Temperamento:</strong> {selectedMascota.temperamento || '—'}</p>
              <p><strong>Estado:</strong> {selectedMascota.vacunas ? '💉 Vacunado' : '❌ Sin vacunas'} | {selectedMascota.esterilizacion ? '✂️ Esterilizado' : '❌ Sin esterilizar'}</p>
              <hr />
              <h4>👤 Propietario</h4>
              <p><strong>Nombre:</strong> {selectedMascota.propietario?.nombre}</p>
              <p><strong>Cédula:</strong> {selectedMascota.propietario?.cedula}</p>
              <p><strong>Teléfono:</strong> {selectedMascota.propietario?.telefono || '—'}</p>
              <p><strong>Email:</strong> {selectedMascota.propietario?.email || '—'}</p>
              <p><strong>Dirección:</strong> {selectedMascota.propietario?.direccion || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MascotasPage;