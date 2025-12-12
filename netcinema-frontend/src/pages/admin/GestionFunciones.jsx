// src/pages/admin/GestionFunciones.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { funcionService } from '../../services/funcionService';
import { peliculaService } from '../../services/peliculaService';
import { salaService } from '../../services/salaService';

function GestionFunciones() {
    const navigate = useNavigate();
    const [funciones, setFunciones] = useState([]);
    const [peliculas, setPeliculas] = useState([]);
    const [salas, setSalas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [funcionSeleccionada, setFuncionSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        peliculaId: '',
        salaId: '',
        fechaHora: '',
        precio: '',
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            const [funcionesRes, peliculasRes, salasRes] = await Promise.all([
                funcionService.getAll(),
                peliculaService.getAll(),
                salaService.getAll(),
            ]);

            if (funcionesRes.success) setFunciones(funcionesRes.data);
            if (peliculasRes.success) setPeliculas(peliculasRes.data);
            if (salasRes.success) setSalas(salasRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const abrirModalNuevo = () => {
        setModoEdicion(false);
        setFuncionSeleccionada(null);
        setFormData({
            peliculaId: '',
            salaId: '',
            fechaHora: '',
            precio: '',
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (funcion) => {
        setModoEdicion(true);
        setFuncionSeleccionada(funcion);

        // Formatear fecha para input datetime-local
        const fecha = new Date(funcion.fechaHora);
        const fechaFormateada = fecha.toISOString().slice(0, 16);

        setFormData({
            peliculaId: funcion.pelicula.id,
            salaId: funcion.sala.id,
            fechaHora: fechaFormateada,
            precio: funcion.precio.toString(),
        });
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setFuncionSeleccionada(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (modoEdicion) {
                await funcionService.update(funcionSeleccionada.id, formData);
                alert('Función actualizada exitosamente');
            } else {
                await funcionService.create(formData);
                alert('Función creada exitosamente');
            }
            cerrarModal();
            cargarDatos();
        } catch (error) {
            alert('Error al guardar la función');
            console.error(error);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta función?')) {
            try {
                await funcionService.delete(id);
                alert('Función eliminada exitosamente');
                cargarDatos();
            } catch (error) {
                alert('Error al eliminar la función');
                console.error(error);
            }
        }
    };

    const handleDesactivar = async (id) => {
        try {
            await funcionService.desactivar(id);
            alert('Función desactivada exitosamente');
            cargarDatos();
        } catch (error) {
            alert('Error al desactivar la función');
            console.error(error);
        }
    };

    if (loading) {
        return <div style={styles.container}><p>Cargando funciones...</p></div>;
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/admin')} style={styles.backButton}>
                    ← Volver al Panel
                </button>
                <h1 style={styles.title}>Gestión de Funciones</h1>
                <button onClick={abrirModalNuevo} style={styles.addButton}>
                    + Nueva Función
                </button>
            </header>

            <div style={styles.content}>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Película</th>
                            <th style={styles.th}>Sala</th>
                            <th style={styles.th}>Fecha y Hora</th>
                            <th style={styles.th}>Precio</th>
                            <th style={styles.th}>Ocupación</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {funciones.map((funcion) => (
                            <tr key={funcion.id} style={styles.tableRow}>
                                <td style={styles.td}>{funcion.pelicula.titulo}</td>
                                <td style={styles.td}>
                                    {funcion.sala.nombre} ({funcion.sala.tipo})
                                </td>
                                <td style={styles.td}>
                                    {new Date(funcion.fechaHora).toLocaleString('es-ES')}
                                </td>
                                <td style={styles.td}>${funcion.precio.toFixed(2)}</td>
                                <td style={styles.td}>
                                    {funcion.asientosOcupados.length}/{funcion.sala.capacidad}
                                </td>
                                <td style={styles.td}>
                    <span
                        style={{
                            ...styles.badge,
                            ...(funcion.activa ? styles.badgeActive : styles.badgeInactive),
                        }}
                    >
                      {funcion.activa ? 'Activa' : 'Inactiva'}
                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => abrirModalEditar(funcion)}
                                        style={styles.editButton}
                                    >
                                        Editar
                                    </button>
                                    {funcion.activa && (
                                        <button
                                            onClick={() => handleDesactivar(funcion.id)}
                                            style={styles.disableButton}
                                        >
                                            Desactivar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEliminar(funcion.id)}
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
                            {modoEdicion ? 'Editar Función' : 'Nueva Función'}
                        </h2>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Película *</label>
                                <select
                                    name="peliculaId"
                                    value={formData.peliculaId}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Seleccionar película</option>
                                    {peliculas.filter(p => p.activa).map((pelicula) => (
                                        <option key={pelicula.id} value={pelicula.id}>
                                            {pelicula.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Sala *</label>
                                <select
                                    name="salaId"
                                    value={formData.salaId}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                >
                                    <option value="">Seleccionar sala</option>
                                    {salas.filter(s => s.activa).map((sala) => (
                                        <option key={sala.id} value={sala.id}>
                                            {sala.nombre} ({sala.tipo}) - Capacidad: {sala.capacidad}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Fecha y Hora *</label>
                                <input
                                    type="datetime-local"
                                    name="fechaHora"
                                    value={formData.fechaHora}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Precio *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="0.00"
                                    required
                                />
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
        fontSize: '14px',
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
        fontSize: '12px',
    },
    disableButton: {
        padding: '6px 12px',
        backgroundColor: '#f39c12',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        fontSize: '12px',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
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

export default GestionFunciones;