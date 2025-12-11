import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/salas';

function GestionarSalas() {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('crear'); // 'crear' o 'editar'
    const [salaActual, setSalaActual] = useState(null);
    const [filtro, setFiltro] = useState('todas'); // 'todas', 'activas', 'inactivas'

    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '2D',
        filas: 8,
        columnas: 10,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        cargarSalas();
    }, []);

    const cargarSalas = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            if (response.data.success) {
                setSalas(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar salas:', error);
            alert('Error al cargar las salas');
        } finally {
            setLoading(false);
        }
    };

    const validarFormulario = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
        }

        if (formData.filas < 1 || formData.filas > 20) {
            newErrors.filas = 'Las filas deben estar entre 1 y 20';
        }

        if (formData.columnas < 1 || formData.columnas > 20) {
            newErrors.columnas = 'Las columnas deben estar entre 1 y 20';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'filas' || name === 'columnas' ? parseInt(value) || 0 : value,
        });
        // Limpiar error del campo
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const abrirModalCrear = () => {
        setModalMode('crear');
        setSalaActual(null);
        setFormData({
            nombre: '',
            tipo: '2D',
            filas: 8,
            columnas: 10,
        });
        setErrors({});
        setShowModal(true);
    };

    const abrirModalEditar = (sala) => {
        setModalMode('editar');
        setSalaActual(sala);
        setFormData({
            nombre: sala.nombre,
            tipo: sala.tipo,
            filas: sala.filas,
            columnas: sala.columnas,
        });
        setErrors({});
        setShowModal(true);
    };

    const cerrarModal = () => {
        setShowModal(false);
        setSalaActual(null);
        setFormData({
            nombre: '',
            tipo: '2D',
            filas: 8,
            columnas: 10,
        });
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        try {
            if (modalMode === 'crear') {
                const response = await axios.post(API_URL, formData);
                if (response.data.success) {
                    alert('Sala creada exitosamente');
                    cargarSalas();
                    cerrarModal();
                }
            } else {
                const response = await axios.put(`${API_URL}/${salaActual.id}`, formData);
                if (response.data.success) {
                    alert('Sala actualizada exitosamente');
                    cargarSalas();
                    cerrarModal();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Error al guardar la sala');
        }
    };

    const handleDesactivar = async (id) => {
        if (!window.confirm('¿Estás seguro de desactivar esta sala?')) {
            return;
        }

        try {
            const response = await axios.patch(`${API_URL}/${id}/desactivar`);
            if (response.data.success) {
                alert('Sala desactivada exitosamente');
                cargarSalas();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al desactivar la sala');
        }
    };

    const handleEliminar = async (id) => {
        if (!window.confirm('¿Estás seguro de ELIMINAR PERMANENTEMENTE esta sala? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            if (response.data.success) {
                alert('Sala eliminada exitosamente');
                cargarSalas();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar la sala');
        }
    };

    const salasFiltradas = salas.filter(sala => {
        if (filtro === 'activas') return sala.activa;
        if (filtro === 'inactivas') return !sala.activa;
        return true;
    });

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Cargando salas...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/admin')} style={styles.backButton}>
                    ← Volver al panel
                </button>
                <h1 style={styles.title}>Gestión de Salas</h1>
            </header>

            <div style={styles.content}>
                <div style={styles.toolbar}>
                    <div style={styles.filtros}>
                        <button
                            onClick={() => setFiltro('todas')}
                            style={{
                                ...styles.filtroButton,
                                ...(filtro === 'todas' && styles.filtroButtonActive),
                            }}
                        >
                            Todas ({salas.length})
                        </button>
                        <button
                            onClick={() => setFiltro('activas')}
                            style={{
                                ...styles.filtroButton,
                                ...(filtro === 'activas' && styles.filtroButtonActive),
                            }}
                        >
                            Activas ({salas.filter(s => s.activa).length})
                        </button>
                        <button
                            onClick={() => setFiltro('inactivas')}
                            style={{
                                ...styles.filtroButton,
                                ...(filtro === 'inactivas' && styles.filtroButtonActive),
                            }}
                        >
                            Inactivas ({salas.filter(s => !s.activa).length})
                        </button>
                    </div>
                    <button onClick={abrirModalCrear} style={styles.crearButton}>
                        + Nueva Sala
                    </button>
                </div>

                {salasFiltradas.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🏛️</span>
                        <h3>No hay salas {filtro !== 'todas' && filtro}</h3>
                        <p>Crea tu primera sala haciendo clic en "Nueva Sala"</p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {salasFiltradas.map((sala) => (
                            <div key={sala.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <div>
                                        <h3 style={styles.salaNombre}>{sala.nombre}</h3>
                                        <span style={styles.salaTipo}>{sala.tipo}</span>
                                    </div>
                                    <span
                                        style={{
                                            ...styles.estadoBadge,
                                            ...(sala.activa ? styles.estadoActivo : styles.estadoInactivo),
                                        }}
                                    >
                                        {sala.activa ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>

                                <div style={styles.cardBody}>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Filas:</span>
                                        <span style={styles.infoValue}>{sala.filas}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Columnas:</span>
                                        <span style={styles.infoValue}>{sala.columnas}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>Capacidad:</span>
                                        <span style={styles.capacidadValue}>
                                            {sala.capacidad} asientos
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.cardFooter}>
                                    <button
                                        onClick={() => abrirModalEditar(sala)}
                                        style={styles.editButton}
                                    >
                                        ✏️ Editar
                                    </button>
                                    {sala.activa ? (
                                        <button
                                            onClick={() => handleDesactivar(sala.id)}
                                            style={styles.deactivateButton}
                                        >
                                            🚫 Desactivar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEliminar(sala.id)}
                                            style={styles.deleteButton}
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={styles.modalOverlay} onClick={cerrarModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                {modalMode === 'crear' ? 'Nueva Sala' : 'Editar Sala'}
                            </h2>
                            <button onClick={cerrarModal} style={styles.closeButton}>
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre de la sala *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    style={{
                                        ...styles.input,
                                        ...(errors.nombre && styles.inputError),
                                    }}
                                    placeholder="Ej: Sala VIP A"
                                />
                                {errors.nombre && (
                                    <span style={styles.errorText}>{errors.nombre}</span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo de sala *</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                >
                                    <option value="2D">2D</option>
                                    <option value="3D">3D</option>
                                    <option value="IMAX">IMAX</option>
                                    <option value="VIP">VIP</option>
                                </select>
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Filas *</label>
                                    <input
                                        type="number"
                                        name="filas"
                                        value={formData.filas}
                                        onChange={handleInputChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.filas && styles.inputError),
                                        }}
                                        min="1"
                                        max="20"
                                    />
                                    {errors.filas && (
                                        <span style={styles.errorText}>{errors.filas}</span>
                                    )}
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Columnas *</label>
                                    <input
                                        type="number"
                                        name="columnas"
                                        value={formData.columnas}
                                        onChange={handleInputChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.columnas && styles.inputError),
                                        }}
                                        min="1"
                                        max="20"
                                    />
                                    {errors.columnas && (
                                        <span style={styles.errorText}>{errors.columnas}</span>
                                    )}
                                </div>
                            </div>

                            <div style={styles.capacidadPreview}>
                                <span style={styles.capacidadLabel}>Capacidad total:</span>
                                <span style={styles.capacidadNumber}>
                                    {formData.filas * formData.columnas} asientos
                                </span>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button onClick={cerrarModal} style={styles.cancelButton}>
                                Cancelar
                            </button>
                            <button onClick={handleSubmit} style={styles.saveButton}>
                                {modalMode === 'crear' ? 'Crear Sala' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e9ecef',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    header: {
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '16px',
    },
    filtros: {
        display: 'flex',
        gap: '12px',
    },
    filtroButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        color: '#6c757d',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    filtroButtonActive: {
        backgroundColor: '#667eea',
        color: 'white',
        borderColor: '#667eea',
    },
    crearButton: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardHeader: {
        padding: '20px',
        borderBottom: '2px solid #f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    salaNombre: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    salaTipo: {
        padding: '4px 12px',
        backgroundColor: '#f0f1f7',
        color: '#667eea',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '600',
    },
    estadoBadge: {
        padding: '6px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    estadoActivo: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    estadoInactivo: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },
    cardBody: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: '14px',
        color: '#6c757d',
    },
    infoValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    capacidadValue: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    cardFooter: {
        padding: '20px',
        borderTop: '2px solid #f8f9fa',
        display: 'flex',
        gap: '12px',
    },
    editButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    deactivateButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    deleteButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    emptyIcon: {
        fontSize: '80px',
        marginBottom: '20px',
        display: 'block',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        padding: '24px',
        borderBottom: '2px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    closeButton: {
        width: '40px',
        height: '40px',
        border: 'none',
        backgroundColor: 'transparent',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#6c757d',
        borderRadius: '8px',
    },
    modalBody: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    select: {
        padding: '12px 16px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    errorText: {
        fontSize: '12px',
        color: '#e74c3c',
    },
    capacidadPreview: {
        padding: '16px',
        backgroundColor: '#f0f1f7',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    capacidadLabel: {
        fontSize: '14px',
        color: '#6c757d',
    },
    capacidadNumber: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    modalFooter: {
        padding: '24px',
        borderTop: '2px solid #e9ecef',
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
    cancelButton: {
        padding: '12px 24px',
        backgroundColor: 'white',
        color: '#6c757d',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
    },
    saveButton: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
    },
};

export default GestionarSalas;