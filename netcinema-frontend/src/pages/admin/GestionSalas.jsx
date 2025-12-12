// src/pages/admin/GestionSalas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salaService } from '../../services/salaService';

function GestionSalas() {
    const navigate = useNavigate();
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [salaSeleccionada, setSalaSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '2D',
        filas: '',
        columnas: '',
        activa: true,
    });

    useEffect(() => {
        cargarSalas();
    }, []);

    const cargarSalas = async () => {
        try {
            const response = await salaService.getAll();
            if (response.success) {
                setSalas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar salas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setSalaSeleccionada(null);
        setFormData({
            nombre: '',
            tipo: '2D',
            filas: '',
            columnas: '',
            activa: true,
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (sala) => {
        setModoEdicion(true);
        setSalaSeleccionada(sala);
        setFormData({
            nombre: sala.nombre,
            tipo: sala.tipo,
            filas: sala.filas.toString(),
            columnas: sala.columnas.toString(),
            activa: sala.activa,
        });
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setSalaSeleccionada(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const salaData = {
            nombre: formData.nombre,
            tipo: formData.tipo,
            filas: parseInt(formData.filas),
            columnas: parseInt(formData.columnas),
            activa: formData.activa,
        };

        try {
            if (modoEdicion) {
                await salaService.update(salaSeleccionada.id, salaData);
                alert('Sala actualizada exitosamente');
            } else {
                await salaService.create(salaData);
                alert('Sala creada exitosamente');
            }
            cerrarModal();
            cargarSalas();
        } catch (error) {
            alert('Error al guardar la sala');
            console.error(error);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta sala?')) {
            try {
                await salaService.delete(id);
                alert('Sala eliminada exitosamente');
                cargarSalas();
            } catch (error) {
                alert('Error al eliminar la sala');
                console.error(error);
            }
        }
    };

    const handleDesactivar = async (id) => {
        try {
            await salaService.desactivar(id);
            alert('Sala desactivada exitosamente');
            cargarSalas();
        } catch (error) {
            alert('Error al desactivar la sala');
            console.error(error);
        }
    };

    if (loading) {
        return <div style={styles.container}><p>Cargando salas...</p></div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/admin')} style={styles.backButton}>
                    ← Volver al Panel
                </button>
                <h1 style={styles.title}>Gestión de Salas</h1>
                <button onClick={abrirModalNuevo} style={styles.addButton}>
                    + Nueva Sala
                </button>
            </header>

            <div style={styles.content}>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Nombre</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Dimensiones</th>
                            <th style={styles.th}>Capacidad</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {salas.map((sala) => (
                            <tr key={sala.id} style={styles.tableRow}>
                                <td style={styles.td}><strong>{sala.nombre}</strong></td>
                                <td style={styles.td}>
                                    <span style={styles.tipoBadge}>{sala.tipo}</span>
                                </td>
                                <td style={styles.td}>
                                    {sala.filas} filas × {sala.columnas} columnas
                                </td>
                                <td style={styles.td}>
                                    <strong>{sala.capacidad} asientos</strong>
                                </td>
                                <td style={styles.td}>
                    <span
                        style={{
                            ...styles.badge,
                            ...(sala.activa ? styles.badgeActive : styles.badgeInactive),
                        }}
                    >
                      {sala.activa ? 'Activa' : 'Inactiva'}
                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => abrirModalEditar(sala)}
                                        style={styles.editButton}
                                    >
                                        Editar
                                    </button>
                                    {sala.activa && (
                                        <button
                                            onClick={() => handleDesactivar(sala.id)}
                                            style={styles.disableButton}
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEliminar(sala.id)}
                                        style={styles.deleteButton}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {mostrarModal && (
                <div style={styles.modalOverlay} onClick={cerrarModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>
                            {modoEdicion ? 'Editar Sala' : 'Nueva Sala'}
                        </h2>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Ej: Sala 1, Sala VIP A"
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo *</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
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
                                        style={styles.input}
                                        min="1"
                                        max="26"
                                        required
                                    />
                                    <p style={styles.hint}>Máximo 26 filas (A-Z)</p>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Columnas *</label>
                                    <input
                                        type="number"
                                        name="columnas"
                                        value={formData.columnas}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        min="1"
                                        max="50"
                                        required
                                    />
                                    <p style={styles.hint}>Asientos por fila</p>
                                </div>
                            </div>

                            {formData.filas && formData.columnas && (
                                <div style={styles.capacityInfo}>
                                    <span style={styles.capacityIcon}>💺</span>
                                    <div>
                                        <p style={styles.capacityLabel}>Capacidad total:</p>
                                        <p style={styles.capacityValue}>
                                            {parseInt(formData.filas) * parseInt(formData.columnas)} asientos
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    name="activa"
                                    checked={formData.activa}
                                    onChange={handleInputChange}
                                    style={styles.checkbox}
                                />
                                <label style={styles.checkboxLabel}>Sala activa</label>
                            </div>

                            <div style={styles.modalButtons}>
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    style={styles.cancelButton}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" style={styles.saveButton}>
                                    {modoEdicion ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
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
    header: {
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addButton: {
        padding: '10px 20px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    tableContainer: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
    },
    th: {
        padding: '16px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '2px solid #dee2e6',
    },
    tableRow: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '16px',
        color: '#495057',
    },
    tipoBadge: {
        padding: '4px 12px',
        backgroundColor: '#e7f3ff',
        color: '#0066cc',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
    },
    badgeActive: {
        backgroundColor: '#d4edda',
        color: '#155724',
    },
    badgeInactive: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
    },
    editButton: {
        padding: '6px 12px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        fontSize: '13px',
    },
    disableButton: {
        padding: '6px 12px',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        fontSize: '13px',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
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
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '24px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '10px 12px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
    },
    hint: {
        fontSize: '11px',
        color: '#6c757d',
        margin: 0,
    },
    capacityInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '2px solid #b3d9ff',
    },
    capacityIcon: {
        fontSize: '32px',
    },
    capacityLabel: {
        fontSize: '12px',
        color: '#6c757d',
        margin: '0 0 4px 0',
    },
    capacityValue: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#0066cc',
        margin: 0,
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
    },
    checkboxLabel: {
        fontSize: '14px',
        color: '#495057',
        cursor: 'pointer',
    },
    modalButtons: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
    },
    cancelButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default GestionSalas;