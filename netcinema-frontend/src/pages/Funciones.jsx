import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funcionService } from '../services/funcionService';
import { peliculaService } from '../services/peliculaService';

function Funciones() {
    const { peliculaId } = useParams();
    const navigate = useNavigate();
    const [pelicula, setPelicula] = useState(null);
    const [funciones, setFunciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [peliculaId]);

    // Agrega esta función al principio de Funciones.jsx, después de los imports
    const convertirYoutubeUrl = (url) => {
        if (!url) return null;

        // Si ya está en formato embed, retornarla tal cual
        if (url.includes('youtube.com/embed/')) {
            return url;
        }

        // Extraer el ID del video de diferentes formatos
        let videoId = null;

        // Formato: https://youtu.be/VIDEO_ID
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        // Formato: https://www.youtube.com/watch?v=VIDEO_ID
        else if (url.includes('youtube.com/watch')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            videoId = urlParams.get('v');
        }

        // Retornar en formato embed
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };
    const cargarDatos = async () => {
        try {
            // Cargar película
            const peliculaResponse = await peliculaService.getById(peliculaId);
            if (peliculaResponse.success) {
                setPelicula(peliculaResponse.data);
            }

            // Cargar funciones
            const funcionesResponse = await funcionService.getByPelicula(peliculaId);
            if (funcionesResponse.success) {
                setFunciones(funcionesResponse.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fechaHora) => {
        const fecha = new Date(fechaHora);
        const opciones = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return fecha.toLocaleDateString('es-ES', opciones);
    };

    const formatearHora = (fechaHora) => {
        const fecha = new Date(fechaHora);
        return fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSeleccionarFuncion = (funcionId) => {
        navigate(`/asientos/${funcionId}`);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando funciones...</p>
            </div>
        );
    }

    if (!pelicula) {
        return (
            <div style={styles.errorContainer}>
                <p>Película no encontrada</p>
                <button onClick={() => navigate('/cartelera')} style={styles.backButton}>
                    Volver a la cartelera
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/cartelera')} style={styles.backButton}>
                    ← Volver a la cartelera
                </button>
            </header>

            <div style={styles.content}>
                <div style={styles.peliculaInfo}>
                    <div style={styles.posterContainer}>
                        <img
                            src={pelicula.posterUrl || 'https://via.placeholder.com/300x450/667eea/ffffff?text=' + pelicula.titulo.charAt(0)}
                            alt={pelicula.titulo}
                            style={styles.posterImage}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div style={{...styles.posterPlaceholder, display: 'none'}}>
                            {pelicula.titulo.charAt(0)}
                        </div>
                    </div>
                    <div style={styles.peliculaDetails}>
                        <h1 style={styles.titulo}>{pelicula.titulo}</h1>
                        <div style={styles.metaInfo}>
              <span style={styles.clasificacion}>
                {pelicula.clasificacion}
              </span>
                            <span style={styles.duracion}>
                {pelicula.duracion} min
              </span>
                        </div>
                        <div style={styles.generosContainer}>
                            {pelicula.generos.map((genero, index) => (
                                <span key={index} style={styles.generoTag}>
                  {genero}
                </span>
                            ))}
                        </div>
                        <p style={styles.descripcion}>{pelicula.descripcion}</p>
                        <div style={styles.creditosContainer}>
                            <div style={styles.creditoItem}>
                                <span style={styles.creditoLabel}>Director:</span>
                                <span style={styles.creditoValue}>{pelicula.director}</span>
                            </div>
                            <div style={styles.creditoItem}>
                                <span style={styles.creditoLabel}>Actores:</span>
                                <span style={styles.creditoValue}>
                  {pelicula.actores.join(', ')}
                </span>
                            </div>
                        </div>
                        {pelicula.trailerUrl && (
                            <div style={styles.trailerContainer}>
                                <h3 style={styles.trailerTitle}>Tráiler</h3>
                                <div style={styles.trailerWrapper}>
                                    <iframe
                                        width="100%"
                                        height="400"
                                        src={convertirYoutubeUrl(pelicula.trailerUrl)}  // ← Usa la función aquí
                                        title={`Tráiler de ${pelicula.titulo}`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        style={styles.trailerIframe}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.funcionesSection}>
                    <h2 style={styles.funcionesTitle}>
                        Horarios Disponibles
                    </h2>

                    {funciones.length === 0 ? (
                        <div style={styles.emptyState}>
                            <h3 style={styles.emptyTitle}>
                                No hay funciones disponibles
                            </h3>
                            <p style={styles.emptyText}>
                                Por el momento no hay horarios programados para esta película
                            </p>
                        </div>
                    ) : (
                        <div style={styles.funcionesGrid}>
                            {funciones.map((funcion) => (
                                <div key={funcion.id} style={styles.funcionCard}>
                                    <div style={styles.funcionHeader}>
                                        <div>
                                            <div style={styles.funcionFecha}>
                                                {formatearFecha(funcion.fechaHora)}
                                            </div>
                                            <div style={styles.funcionHora}>
                                                {formatearHora(funcion.fechaHora)}
                                            </div>
                                        </div>
                                        <div style={styles.funcionPrecio}>
                                            ${funcion.precio.toFixed(2)}
                                        </div>
                                    </div>

                                    <div style={styles.funcionInfo}>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Sala:</span>
                                            <span style={styles.infoValue}>
                        {funcion.sala.nombre} ({funcion.sala.tipo})
                      </span>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <span style={styles.infoLabel}>Asientos disponibles:</span>
                                            <span style={styles.infoValue}>
                        {funcion.sala.capacidad - funcion.asientosOcupados.length}
                                                /{funcion.sala.capacidad}
                      </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSeleccionarFuncion(funcion.id)}
                                        style={styles.seleccionarButton}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#5568d3';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#667eea';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Seleccionar Asientos
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
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
        backgroundColor: '#f8f9fa',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid #e9ecef',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '20px',
        color: '#6c757d',
        fontSize: '16px',
    },
    errorContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
    },
    header: {
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    backButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    peliculaInfo: {
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '40px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '40px',
    },
    posterContainer: {
        borderRadius: '12px',
        overflow: 'hidden',
        height: '450px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    posterPlaceholder: {
        fontSize: '150px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 'bold',
    },
    peliculaDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    titulo: {
        fontSize: '40px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '12px',
    },
    metaInfo: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
    },
    clasificacion: {
        padding: '6px 16px',
        backgroundColor: '#667eea',
        color: 'white',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '14px',
    },
    duracion: {
        fontSize: '16px',
        color: '#6c757d',
    },
    generosContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    generoTag: {
        padding: '8px 16px',
        backgroundColor: '#f0f1f7',
        color: '#667eea',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '500',
    },
    descripcion: {
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#495057',
    },
    creditosContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingTop: '20px',
        borderTop: '1px solid #e9ecef',
    },
    creditoItem: {
        display: 'flex',
        gap: '12px',
    },
    creditoLabel: {
        fontWeight: '600',
        color: '#2c3e50',
        minWidth: '80px',
    },
    creditoValue: {
        color: '#6c757d',
    },
    funcionesSection: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    funcionesTitle: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '30px',
    },
    funcionesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
    },
    funcionCard: {
        border: '2px solid #e9ecef',
        borderRadius: '12px',
        padding: '24px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    funcionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e9ecef',
    },
    funcionFecha: {
        fontSize: '14px',
        color: '#6c757d',
        textTransform: 'capitalize',
        marginBottom: '6px',
    },
    funcionHora: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    funcionPrecio: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    funcionInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '20px',
    },
    infoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
    },
    infoLabel: {
        color: '#6c757d',
    },
    infoValue: {
        fontWeight: '600',
        color: '#2c3e50',
    },
    seleccionarButton: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '15px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
    },
    emptyIcon: {
        fontSize: '80px',
        marginBottom: '20px',
        display: 'block',
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '12px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#6c757d',
    },
    posterImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    trailerContainer: {
        marginTop: '30px',
        paddingTop: '30px',
        borderTop: '1px solid #e9ecef',
    },
    trailerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    trailerWrapper: {
        position: 'relative',
        paddingBottom: '56.25%', // Aspect ratio 16:9
        height: 0,
        overflow: 'hidden',
        borderRadius: '12px',
        backgroundColor: '#000',
    },
    trailerIframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '12px',
    },
};

export default Funciones;