import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { peliculaService } from '../services/peliculaService';
import { authService } from '../services/authService';

function Cartelera() {
    const [peliculas, setPeliculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = authService.getUser();

    useEffect(() => {
        cargarCartelera();
    }, []);

    const cargarCartelera = async () => {
        try {
            const response = await peliculaService.getCartelera();
            if (response.success) {
                setPeliculas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar cartelera:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    const handleVerFunciones = (peliculaId) => {
        navigate(`/funciones/${peliculaId}`);
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando cartelera...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}>NetCinema - Cartelera</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/mis-reservas')} style={styles.reservasButton}>
                        🎟️ Mis Reservas
                    </button>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Cartelera</h2>
                    <p style={styles.sectionSubtitle}>
                        {peliculas.length} {peliculas.length === 1 ? 'película disponible' : 'películas disponibles'}
                    </p>
                </div>

                {peliculas.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🎬</div>
                        <h3 style={styles.emptyTitle}>No hay películas disponibles</h3>
                        <p style={styles.emptyText}>
                            Por el momento no tenemos películas en cartelera
                        </p>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {peliculas.map((pelicula) => (
                            <div key={pelicula.id} style={styles.card}>
                                <div style={styles.posterContainer}>
                                    <div style={styles.posterPlaceholder}>
                                        {pelicula.titulo.charAt(0)}
                                    </div>
                                    <div style={styles.clasificacionBadge}>
                                        {pelicula.clasificacion}
                                    </div>
                                </div>
                                <div style={styles.cardContent}>
                                    <h3 style={styles.peliculaTitulo}>{pelicula.titulo}</h3>
                                    <p style={styles.duracion}>⏱ {pelicula.duracion} minutos</p>
                                    <div style={styles.generosContainer}>
                                        {pelicula.generos.slice(0, 3).map((genero, index) => (
                                            <span key={index} style={styles.generoTag}>
                        {genero}
                      </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => handleVerFunciones(pelicula.id)}
                                        style={styles.button}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#5568d3';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#667eea';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        Ver Funciones →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        width: '100%',
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
    header: {
        backgroundColor: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    headerContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    logoutButton: {
        padding: '10px 24px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'all 0.3s ease',
    },
    mainContent: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    sectionHeader: {
        marginBottom: '30px',
    },
    sectionTitle: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    sectionSubtitle: {
        fontSize: '16px',
        color: '#6c757d',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        height: 'fit-content',
    },
    posterContainer: {
        position: 'relative',
        height: '380px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    posterPlaceholder: {
        fontSize: '120px',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: 'bold',
        textShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    clasificacionBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: '#333',
        padding: '6px 12px',
        borderRadius: '20px',
        fontWeight: 'bold',
        fontSize: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    },
    cardContent: {
        padding: '24px',
    },
    peliculaTitulo: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#2c3e50',
        lineHeight: '1.3',
    },
    duracion: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    generosContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '20px',
    },
    generoTag: {
        padding: '4px 12px',
        backgroundColor: '#f0f1f7',
        color: '#667eea',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
    },
    button: {
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
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    emptyIcon: {
        fontSize: '80px',
        marginBottom: '20px',
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
    reservasButton: {
        padding: '10px 20px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default Cartelera;