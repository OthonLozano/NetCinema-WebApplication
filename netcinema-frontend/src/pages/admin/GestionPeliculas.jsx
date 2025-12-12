import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { peliculaService } from '../../services/peliculaService';

function GestionPeliculas() {
    const navigate = useNavigate();
    const [peliculas, setPeliculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        generos: '',
        duracion: '',
        clasificacion: '',
        director: '',
        actores: '',
        posterUrl: '',
        trailerUrl: '',
        activa: true,
    });

    useEffect(() => {
        cargarPeliculas();
    }, []);

    const cargarPeliculas = async () => {
        try {
            const response = await peliculaService.getAll();
            if (response.success) {
                setPeliculas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar películas:', error);
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
        setPeliculaSeleccionada(null);
        setFormData({
            titulo: '',
            descripcion: '',
            generos: '',
            duracion: '',
            clasificacion: '',
            director: '',
            actores: '',
            posterUrl: '',
            trailerUrl: '',
            activa: true,
        });
        setMostrarModal(true);
    };

    const abrirModalEditar = (pelicula) => {
        setModoEdicion(true);
        setPeliculaSeleccionada(pelicula);
        setFormData({
            titulo: pelicula.titulo,
            descripcion: pelicula.descripcion,
            generos: pelicula.generos.join(', '),
            duracion: pelicula.duracion.toString(),
            clasificacion: pelicula.clasificacion,
            director: pelicula.director,
            actores: pelicula.actores.join(', '),
            posterUrl: pelicula.posterUrl || '',
            trailerUrl: pelicula.trailerUrl || '',
            activa: pelicula.activa,
        });
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setPeliculaSeleccionada(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const peliculaData = {
            titulo: formData.titulo,
            descripcion: formData.descripcion,
            generos: formData.generos.split(',').map((g) => g.trim()),
            duracion: parseInt(formData.duracion),
            clasificacion: formData.clasificacion,
            director: formData.director,
            actores: formData.actores.split(',').map((a) => a.trim()),
            posterUrl: formData.posterUrl,
            trailerUrl: formData.trailerUrl,
            activa: formData.activa,
        };

        try {
            if (modoEdicion) {
                await peliculaService.update(peliculaSeleccionada.id, peliculaData);
                alert('Película actualizada exitosamente');
            } else {
                await peliculaService.create(peliculaData);
                alert('Película creada exitosamente');
            }
            cerrarModal();
            cargarPeliculas();
        } catch (error) {
            alert('Error al guardar la película');
            console.error(error);
        }
    };

    const handleEliminar = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta película?')) {
            try {
                await peliculaService.delete(id);
                alert('Película eliminada exitosamente');
                cargarPeliculas();
            } catch (error) {
                alert('Error al eliminar la película');
                console.error(error);
            }
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <p>Cargando películas...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/admin')} style={styles.backButton}>
                    ← Volver al Panel
                </button>
                <h1 style={styles.title}>Gestión de Películas</h1>
                <button onClick={abrirModalNuevo} style={styles.addButton}>
                    + Nueva Película
                </button>
            </header>

            <div style={styles.content}>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Título</th>
                            <th style={styles.th}>Clasificación</th>
                            <th style={styles.th}>Duración</th>
                            <th style={styles.th}>Director</th>
                            <th style={styles.th}>Géneros</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {peliculas.map((pelicula) => (
                            <tr key={pelicula.id} style={styles.tableRow}>
                                <td style={styles.td}>{pelicula.titulo}</td>
                                <td style={styles.td}>{pelicula.clasificacion}</td>
                                <td style={styles.td}>{pelicula.duracion} min</td>
                                <td style={styles.td}>{pelicula.director}</td>
                                <td style={styles.td}>{pelicula.generos.join(', ')}</td>
                                <td style={styles.td}>
                    <span
                        style={{
                            ...styles.badge,
                            ...(pelicula.activa ? styles.badgeActive : styles.badgeInactive),
                        }}
                    >
                      {pelicula.activa ? 'Activa' : 'Inactiva'}
                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => abrirModalEditar(pelicula)}
                                        style={styles.editButton}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleEliminar(pelicula.id)}
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
                            {modoEdicion ? 'Editar Película' : 'Nueva Película'}
                        </h2>

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Título *</label>
                                <input
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Descripción *</label>
                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    style={{ ...styles.input, minHeight: '80px' }}
                                    required
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Duración (min) *</label>
                                    <input
                                        type="number"
                                        name="duracion"
                                        value={formData.duracion}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Clasificación *</label>
                                    <select
                                        name="clasificacion"
                                        value={formData.clasificacion}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="AA">AA</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="B15">B15</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Director *</label>
                                <input
                                    type="text"
                                    name="director"
                                    value={formData.director}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Géneros (separados por comas) *</label>
                                <input
                                    type="text"
                                    name="generos"
                                    value={formData.generos}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Acción, Drama, Comedia"
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Actores (separados por comas) *</label>
                                <input
                                    type="text"
                                    name="actores"
                                    value={formData.actores}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Actor 1, Actor 2, Actor 3"
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL del Póster</label>
                                <input
                                    type="text"
                                    name="posterUrl"
                                    value={formData.posterUrl}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="https://..."
                                />
                                {formData.posterUrl && (
                                    <small style={styles.helper}>
                                        Vista previa disponible al guardar
                                    </small>
                                )}
                            </div>


                            <div style={styles.formGroup}>
                                <label style={styles.label}>URL del Tráiler (YouTube)</label>
                                <input
                                    type="text"
                                    name="trailerUrl"
                                    value={formData.trailerUrl}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="https://youtu.be/... o https://www.youtube.com/watch?v=..."
                                />
                                <small style={styles.helper}>
                                    Puedes pegar cualquier URL de YouTube
                                </small>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    name="activa"
                                    checked={formData.activa}
                                    onChange={handleInputChange}
                                    style={styles.checkbox}
                                />
                                <label style={styles.checkboxLabel}>Película activa</label>
                            </div>

                            <div style={styles.modalButtons}>
                                <button type="button" onClick={cerrarModal} style={styles.cancelButton}>
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
        overflow: 'hidden',
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
    helper: { // 🆕 Estilo para texto de ayuda
        fontSize: '12px',
        color: '#6c757d',
        marginTop: '4px',
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

export default GestionPeliculas;