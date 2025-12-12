import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ConsultarReserva() {
    const navigate = useNavigate();
    const [codigoReserva, setCodigoReserva] = useState('');
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const buscarReserva = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/reservas/codigo/${codigoReserva}`);
            const data = await response.json();

            if (data.success) {
                setReserva(data.data);
            } else {
                setError('Reserva no encontrada');
            }
        } catch (err) {
            setError('Error al buscar la reserva');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoBadgeStyle = (estado) => {
        const baseStyle = {
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
        };

        switch (estado) {
            case 'CONFIRMADA':
                return { ...baseStyle, backgroundColor: '#d4edda', color: '#155724' };
            case 'PENDIENTE':
                return { ...baseStyle, backgroundColor: '#fff3cd', color: '#856404' };
            case 'CANCELADA':
                return { ...baseStyle, backgroundColor: '#f8d7da', color: '#721c24' };
            default:
                return baseStyle;
        }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/')} style={styles.backButton}>
                    ← Volver al inicio
                </button>
                <h1 style={styles.headerTitle}>🎬 NetCinema</h1>
                <div style={{ width: '120px' }}></div>
            </header>

            <div style={styles.content}>
                <div style={styles.searchCard}>
                    <div style={styles.iconContainer}>
                        <span style={styles.icon}>🔍</span>
                    </div>
                    <h1 style={styles.title}>Consultar Reserva</h1>
                    <p style={styles.subtitle}>
                        Ingresa tu código de reserva para ver los detalles
                    </p>

                    <form onSubmit={buscarReserva} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <input
                                type="text"
                                value={codigoReserva}
                                onChange={(e) => setCodigoReserva(e.target.value.toUpperCase())}
                                style={styles.input}
                                placeholder="Ej: RES-ABC12345"
                                required
                            />
                        </div>

                        {error && (
                            <div style={styles.errorContainer}>
                                <p style={styles.error}>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? 'Buscando...' : 'Buscar Reserva'}
                        </button>
                    </form>
                </div>

                {reserva && (
                    <div style={styles.resultCard}>
                        <div style={styles.resultHeader}>
                            <h2 style={styles.resultTitle}>Detalles de la Reserva</h2>
                            <span style={getEstadoBadgeStyle(reserva.estado)}>
                {reserva.estado}
              </span>
                        </div>

                        <div style={styles.infoSection}>
                            <div style={styles.infoItem}>
                                <span style={styles.label}>Código de Reserva:</span>
                                <span style={styles.value}>{reserva.codigoReserva}</span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Cliente:</span>
                                <span style={styles.value}>{reserva.nombreCliente}</span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Email:</span>
                                <span style={styles.value}>{reserva.emailCliente}</span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Película:</span>
                                <span style={styles.value}>{reserva.funcion.pelicula.titulo}</span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Sala:</span>
                                <span style={styles.value}>
                  {reserva.funcion.sala.nombre} ({reserva.funcion.sala.tipo})
                </span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Fecha y Hora:</span>
                                <span style={styles.value}>
                  {new Date(reserva.funcion.fechaHora).toLocaleString('es-ES')}
                </span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Asientos:</span>
                                <span style={styles.value}>{reserva.asientos.join(', ')}</span>
                            </div>

                            <div style={styles.infoItem}>
                                <span style={styles.label}>Método de Pago:</span>
                                <span style={styles.value}>{reserva.metodoPago || 'Pendiente'}</span>
                            </div>

                            <div style={styles.totalItem}>
                                <span style={styles.totalLabel}>Total:</span>
                                <span style={styles.totalValue}>${reserva.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div style={styles.actions}>
                            <button
                                onClick={() => {
                                    setReserva(null);
                                    setCodigoReserva('');
                                }}
                                style={styles.newSearchButton}
                            >
                                Nueva Búsqueda
                            </button>
                        </div>
                    </div>
                )}
            </div>
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
    headerTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    content: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    searchCard: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        textAlign: 'center',
        marginBottom: '30px',
    },
    iconContainer: {
        width: '80px',
        height: '80px',
        margin: '0 auto 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: '40px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6c757d',
        marginBottom: '32px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '16px',
        border: '2px solid #e9ecef',
        borderRadius: '10px',
        fontSize: '16px',
        textAlign: 'center',
        fontWeight: '600',
        letterSpacing: '1px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    button: {
        padding: '16px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    errorContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: '#fee',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #fcc',
    },
    error: {
        color: '#c62828',
        fontSize: '14px',
        margin: 0,
    },
    resultCard: {
        backgroundColor: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    resultHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e9ecef',
    },
    resultTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    infoSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
    },
    infoItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f1f3f5',
    },
    label: {
        fontSize: '14px',
        color: '#6c757d',
        fontWeight: '500',
    },
    value: {
        fontSize: '14px',
        color: '#2c3e50',
        fontWeight: '600',
        textAlign: 'right',
    },
    totalItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 0',
        marginTop: '12px',
        borderTop: '2px solid #e9ecef',
    },
    totalLabel: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    totalValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    actions: {
        display: 'flex',
        gap: '12px',
    },
    printButton: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    newSearchButton: {
        flex: 1,
        padding: '14px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default ConsultarReserva;