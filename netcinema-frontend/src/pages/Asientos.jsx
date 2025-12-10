import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funcionService } from '../services/funcionService';
import { reservaService } from '../services/reservaService';
import { authService } from '../services/authService';

function Asientos() {
    const { funcionId } = useParams();
    const navigate = useNavigate();
    const [funcion, setFuncion] = useState(null);
    const [asientosSeleccionados, setAsientosSeleccionados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const user = authService.getUser();

    useEffect(() => {
        cargarFuncion();
        const interval = setInterval(cargarFuncion, 5000); // Actualizar cada 5 segundos
        return () => clearInterval(interval);
    }, [funcionId]);

    const cargarFuncion = async () => {
        try {
            const response = await funcionService.getById(funcionId);
            if (response.success) {
                setFuncion(response.data);
            }
        } catch (error) {
            console.error('Error al cargar función:', error);
        } finally {
            setLoading(false);
        }
    };

    const generarAsientos = () => {
        if (!funcion) return [];

        const filas = funcion.sala.filas;
        const columnas = funcion.sala.columnas;
        const asientos = [];

        for (let i = 0; i < filas; i++) {
            const fila = String.fromCharCode(65 + i); // A, B, C, ...
            for (let j = 1; j <= columnas; j++) {
                const asientoId = `${fila}${j}`;
                const ocupado = funcion.asientosOcupados.includes(asientoId);
                const bloqueado = Object.keys(funcion.asientosBloqueados || {}).includes(asientoId);
                const seleccionado = asientosSeleccionados.includes(asientoId);

                asientos.push({
                    id: asientoId,
                    fila: fila,
                    numero: j,
                    ocupado,
                    bloqueado,
                    seleccionado,
                    disponible: !ocupado && !bloqueado,
                });
            }
        }

        return asientos;
    };

    const toggleAsiento = (asientoId, disponible) => {
        if (!disponible) return;

        setAsientosSeleccionados((prev) => {
            if (prev.includes(asientoId)) {
                return prev.filter((id) => id !== asientoId);
            } else {
                return [...prev, asientoId];
            }
        });
    };

    const calcularTotal = () => {
        return funcion ? funcion.precio * asientosSeleccionados.length : 0;
    };

    const handleContinuar = async () => {
        if (asientosSeleccionados.length === 0) {
            alert('Debes seleccionar al menos un asiento');
            return;
        }

        setProcesando(true);

        try {
            // Bloquear asientos
            await funcionService.bloquearAsientos(funcionId, asientosSeleccionados);

            // Navegar a confirmación con los datos
            navigate('/confirmar-reserva', {
                state: {
                    funcionId,
                    asientos: asientosSeleccionados,
                    total: calcularTotal(),
                    funcion: funcion,
                },
            });
        } catch (error) {
            alert('Error al bloquear asientos. Intenta de nuevo.');
            console.error(error);
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando asientos...</p>
            </div>
        );
    }

    if (!funcion) {
        return (
            <div style={styles.errorContainer}>
                <p>Función no encontrada</p>
                <button onClick={() => navigate('/cartelera')}>
                    Volver a la cartelera
                </button>
            </div>
        );
    }

    const asientos = generarAsientos();

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Volver
                </button>
                <h1 style={styles.headerTitle}>Selecciona tus asientos</h1>
            </header>

            <div style={styles.content}>
                <div style={styles.infoCard}>
                    <h2 style={styles.peliculaTitulo}>{funcion.pelicula.titulo}</h2>
                    <div style={styles.funcionInfo}>
                        <span>🏛️ {funcion.sala.nombre} ({funcion.sala.tipo})</span>
                        <span>⏰ {new Date(funcion.fechaHora).toLocaleString('es-ES')}</span>
                        <span>💵 ${funcion.precio.toFixed(2)} por asiento</span>
                    </div>
                </div>

                <div style={styles.salaContainer}>
                    <div style={styles.pantalla}>
                        <div style={styles.pantallaTexto}>PANTALLA</div>
                    </div>

                    <div style={styles.asientosGrid}>
                        {asientos.map((asiento) => (
                            <div
                                key={asiento.id}
                                style={{
                                    ...styles.asiento,
                                    ...(asiento.ocupado && styles.asientoOcupado),
                                    ...(asiento.bloqueado && styles.asientoBloqueado),
                                    ...(asiento.seleccionado && styles.asientoSeleccionado),
                                    ...(asiento.disponible && styles.asientoDisponible),
                                }}
                                onClick={() => toggleAsiento(asiento.id, asiento.disponible)}
                                title={
                                    asiento.ocupado
                                        ? 'Ocupado'
                                        : asiento.bloqueado
                                            ? 'Bloqueado temporalmente'
                                            : asiento.seleccionado
                                                ? 'Seleccionado'
                                                : 'Disponible'
                                }
                            >
                                {asiento.id}
                            </div>
                        ))}
                    </div>

                    <div style={styles.leyenda}>
                        <div style={styles.leyendaItem}>
                            <div style={{ ...styles.leyendaColor, ...styles.asientoDisponible }}></div>
                            <span>Disponible</span>
                        </div>
                        <div style={styles.leyendaItem}>
                            <div style={{ ...styles.leyendaColor, ...styles.asientoSeleccionado }}></div>
                            <span>Seleccionado</span>
                        </div>
                        <div style={styles.leyendaItem}>
                            <div style={{ ...styles.leyendaColor, ...styles.asientoOcupado }}></div>
                            <span>Ocupado</span>
                        </div>
                        <div style={styles.leyendaItem}>
                            <div style={{ ...styles.leyendaColor, ...styles.asientoBloqueado }}></div>
                            <span>Bloqueado</span>
                        </div>
                    </div>
                </div>

                <div style={styles.resumenCard}>
                    <h3 style={styles.resumenTitulo}>Resumen de compra</h3>
                    <div style={styles.resumenDetalle}>
                        <div style={styles.resumenItem}>
                            <span>Asientos seleccionados:</span>
                            <span style={styles.resumenValor}>
                {asientosSeleccionados.length > 0
                    ? asientosSeleccionados.join(', ')
                    : 'Ninguno'}
              </span>
                        </div>
                        <div style={styles.resumenItem}>
                            <span>Cantidad:</span>
                            <span style={styles.resumenValor}>{asientosSeleccionados.length}</span>
                        </div>
                        <div style={styles.resumenItem}>
                            <span>Precio unitario:</span>
                            <span style={styles.resumenValor}>${funcion.precio.toFixed(2)}</span>
                        </div>
                        <div style={styles.resumenTotal}>
                            <span>Total:</span>
                            <span style={styles.totalValor}>${calcularTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleContinuar}
                        disabled={asientosSeleccionados.length === 0 || procesando}
                        style={{
                            ...styles.continuarButton,
                            ...(asientosSeleccionados.length === 0 && styles.continuarButtonDisabled),
                        }}
                    >
                        {procesando ? 'Procesando...' : 'Continuar con la compra'}
                    </button>
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
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
    },
    infoCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
    },
    peliculaTitulo: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '16px',
    },
    funcionInfo: {
        display: 'flex',
        gap: '24px',
        fontSize: '14px',
        color: '#6c757d',
        flexWrap: 'wrap',
    },
    salaContainer: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
    },
    pantalla: {
        width: '80%',
        margin: '0 auto 40px',
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center',
    },
    pantallaTexto: {
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '4px',
    },
    asientosGrid: {
        display: 'grid',
        gridTemplateColumns: `repeat(${10}, 1fr)`,
        gap: '12px',
        maxWidth: '800px',
        margin: '0 auto 30px',
    },
    asiento: {
        aspectRatio: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '8px 8px 0 0',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '2px solid transparent',
    },
    asientoDisponible: {
        backgroundColor: '#e9ecef',
        color: '#495057',
    },
    asientoSeleccionado: {
        backgroundColor: '#667eea',
        color: 'white',
        border: '2px solid #5568d3',
        transform: 'scale(1.05)',
    },
    asientoOcupado: {
        backgroundColor: '#e74c3c',
        color: 'white',
        cursor: 'not-allowed',
        opacity: 0.6,
    },
    asientoBloqueado: {
        backgroundColor: '#f39c12',
        color: 'white',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    leyenda: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        flexWrap: 'wrap',
    },
    leyendaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#6c757d',
    },
    leyendaColor: {
        width: '24px',
        height: '24px',
        borderRadius: '4px',
    },
    resumenCard: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    resumenTitulo: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '24px',
    },
    resumenDetalle: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
    },
    resumenItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '16px',
        color: '#6c757d',
    },
    resumenValor: {
        fontWeight: '600',
        color: '#2c3e50',
    },
    resumenTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '20px',
        fontWeight: 'bold',
        paddingTop: '16px',
        borderTop: '2px solid #e9ecef',
        marginTop: '8px',
    },
    totalValor: {
        color: '#667eea',
        fontSize: '24px',
    },
    continuarButton: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    continuarButtonDisabled: {
        backgroundColor: '#dee2e6',
        color: '#adb5bd',
        cursor: 'not-allowed',
    },
};

export default Asientos;