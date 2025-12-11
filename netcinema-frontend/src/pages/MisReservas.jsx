// src/pages/MisReservas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService } from '../services/reservaService';
import { authService } from '../services/authService';

function MisReservas() {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODAS');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const user = authService.getUser();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            const response = await reservaService.getAll();
            if (response.success) {
                // Filtrar solo las reservas del usuario actual
                const misReservas = response.data.filter(
                    r => r.emailCliente === user.email ||
                        (r.usuario && r.usuario.id === user.id)
                );
                setReservas(misReservas);
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            alert('Error al cargar tus reservas');
        } finally {
            setLoading(false);
        }
    };

    const clasificarReservas = () => {
        const ahora = new Date();

        return {
            activas: reservas.filter(r => {
                const fechaFuncion = new Date(r.funcion.fechaHora);
                return r.estado === 'CONFIRMADA' && fechaFuncion > ahora;
            }),
            pasadas: reservas.filter(r => {
                const fechaFuncion = new Date(r.funcion.fechaHora);
                return (r.estado === 'CONFIRMADA' && fechaFuncion <= ahora) ||
                    r.estado === 'PENDIENTE';
            }),
            canceladas: reservas.filter(r => r.estado === 'CANCELADA')
        };
    };

    const getReservasFiltradas = () => {
        const clasificadas = clasificarReservas();

        switch(filtro) {
            case 'ACTIVAS':
                return clasificadas.activas;
            case 'PASADAS':
                return clasificadas.pasadas;
            case 'CANCELADAS':
                return clasificadas.canceladas;
            default:
                return reservas;
        }
    };

    const getEstadoBadgeStyle = (reserva) => {
        const ahora = new Date();
        const fechaFuncion = new Date(reserva.funcion.fechaHora);

        if (reserva.estado === 'CANCELADA') {
            return {
                backgroundColor: '#f8d7da',
                color: '#721c24',
                label: 'Cancelada'
            };
        }

        if (reserva.estado === 'CONFIRMADA' && fechaFuncion > ahora) {
            return {
                backgroundColor: '#d4edda',
                color: '#155724',
                label: 'Activa'
            };
        }

        if (reserva.estado === 'CONFIRMADA' && fechaFuncion <= ahora) {
            return {
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                label: 'Completada'
            };
        }

        return {
            backgroundColor: '#fff3cd',
            color: '#856404',
            label: 'Pendiente'
        };
    };

    const handleCancelarReserva = async (reserva) => {
        const ahora = new Date();
        const fechaFuncion = new Date(reserva.funcion.fechaHora);
        const horasRestantes = (fechaFuncion - ahora) / (1000 * 60 * 60);

        if (horasRestantes < 2) {
            alert('No puedes cancelar una reserva con menos de 2 horas de anticipación.');
            return;
        }

        if (!window.confirm(`¿Estás seguro de cancelar tu reserva ${reserva.codigoReserva}?`)) {
            return;
        }

        try {
            await reservaService.cancelar(reserva.id);
            alert('Reserva cancelada exitosamente');
            setMostrarDetalle(false);
            cargarReservas();
        } catch (error) {
            console.error('Error al cancelar reserva:', error);
            alert('Error al cancelar la reserva');
        }
    };

    const verDetalle = (reserva) => {
        setReservaSeleccionada(reserva);
        setMostrarDetalle(true);
    };

    const handleVolver = () => {
        navigate('/cartelera');
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando tus reservas...</p>
            </div>
        );
    }

    const clasificadas = clasificarReservas();
    const reservasFiltradas = getReservasFiltradas();

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={handleVolver} style={styles.backButton}>
                    ← Volver
                </button>
                <h1 style={styles.title}>Mis Reservas</h1>
                <div style={styles.headerRight}>
                    <span style={styles.userName}>
                        {user?.nombre} {user?.apellido}
                    </span>
                </div>
            </header>

            <div style={styles.content}>
                {/* Resumen de Reservas */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <span style={styles.statIcon}>📊</span>
                        <div>
                            <h3 style={styles.statValue}>{reservas.length}</h3>
                            <p style={styles.statLabel}>Total</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statSuccess }}>
                        <span style={styles.statIcon}>✅</span>
                        <div>
                            <h3 style={styles.statValue}>{clasificadas.activas.length}</h3>
                            <p style={styles.statLabel}>Activas</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statInfo }}>
                        <span style={styles.statIcon}>🎬</span>
                        <div>
                            <h3 style={styles.statValue}>{clasificadas.pasadas.length}</h3>
                            <p style={styles.statLabel}>Pasadas</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statDanger }}>
                        <span style={styles.statIcon}>❌</span>
                        <div>
                            <h3 style={styles.statValue}>{clasificadas.canceladas.length}</h3>
                            <p style={styles.statLabel}>Canceladas</p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div style={styles.filtrosContainer}>
                    <button
                        onClick={() => setFiltro('TODAS')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'TODAS' && styles.filtroButtonActive)
                        }}
                    >
                        Todas ({reservas.length})
                    </button>
                    <button
                        onClick={() => setFiltro('ACTIVAS')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'ACTIVAS' && styles.filtroButtonActive)
                        }}
                    >
                        Activas ({clasificadas.activas.length})
                    </button>
                    <button
                        onClick={() => setFiltro('PASADAS')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'PASADAS' && styles.filtroButtonActive)
                        }}
                    >
                        Pasadas ({clasificadas.pasadas.length})
                    </button>
                    <button
                        onClick={() => setFiltro('CANCELADAS')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'CANCELADAS' && styles.filtroButtonActive)
                        }}
                    >
                        Canceladas ({clasificadas.canceladas.length})
                    </button>
                </div>

                {/* Lista de Reservas */}
                {reservasFiltradas.length === 0 ? (
                    <div style={styles.emptyState}>
                        <span style={styles.emptyIcon}>🎟️</span>
                        <h3 style={styles.emptyTitle}>No tienes reservas {filtro.toLowerCase()}</h3>
                        <p style={styles.emptyText}>
                            {filtro === 'TODAS'
                                ? 'Comienza a reservar tus películas favoritas'
                                : `No se encontraron reservas ${filtro.toLowerCase()}`
                            }
                        </p>
                        <button onClick={handleVolver} style={styles.carteleraButton}>
                            Ver Cartelera
                        </button>
                    </div>
                ) : (
                    <div style={styles.reservasGrid}>
                        {reservasFiltradas.map((reserva) => {
                            const estadoStyle = getEstadoBadgeStyle(reserva);
                            const fechaFuncion = new Date(reserva.funcion.fechaHora);
                            const ahora = new Date();
                            const puedeCancel = reserva.estado === 'CONFIRMADA' &&
                                fechaFuncion > ahora &&
                                (fechaFuncion - ahora) / (1000 * 60 * 60) >= 2;

                            return (
                                <div key={reserva.id} style={styles.reservaCard}>
                                    <div style={styles.reservaHeader}>
                                        <div>
                                            <h3 style={styles.reservaCodigo}>
                                                {reserva.codigoReserva}
                                            </h3>
                                            <span
                                                style={{
                                                    ...styles.estadoBadge,
                                                    backgroundColor: estadoStyle.backgroundColor,
                                                    color: estadoStyle.color
                                                }}
                                            >
                                                {estadoStyle.label}
                                            </span>
                                        </div>
                                        <div style={styles.reservaTotal}>
                                            ${reserva.total.toFixed(2)}
                                        </div>
                                    </div>

                                    <div style={styles.reservaBody}>
                                        <div style={styles.peliculaInfo}>
                                            <div style={styles.posterMini}>
                                                {reserva.funcion.pelicula.titulo.charAt(0)}
                                            </div>
                                            <div style={styles.peliculaDetails}>
                                                <h4 style={styles.peliculaTitulo}>
                                                    {reserva.funcion.pelicula.titulo}
                                                </h4>
                                                <p style={styles.peliculaMeta}>
                                                    {reserva.funcion.sala.nombre} ({reserva.funcion.sala.tipo})
                                                </p>
                                            </div>
                                        </div>

                                        <div style={styles.reservaInfo}>
                                            <div style={styles.infoRow}>
                                                <span style={styles.infoIcon}>📅</span>
                                                <div>
                                                    <p style={styles.infoLabel}>Fecha y Hora</p>
                                                    <p style={styles.infoValue}>
                                                        {fechaFuncion.toLocaleDateString('es-ES', {
                                                            weekday: 'short',
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })} • {fechaFuncion.toLocaleTimeString('es-ES', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={styles.infoRow}>
                                                <span style={styles.infoIcon}>💺</span>
                                                <div>
                                                    <p style={styles.infoLabel}>Asientos</p>
                                                    <p style={styles.infoValue}>
                                                        {reserva.asientos.join(', ')}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={styles.infoRow}>
                                                <span style={styles.infoIcon}>💳</span>
                                                <div>
                                                    <p style={styles.infoLabel}>Método de Pago</p>
                                                    <p style={styles.infoValue}>
                                                        {reserva.metodoPago || 'Pendiente'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.reservaFooter}>
                                        <button
                                            onClick={() => verDetalle(reserva)}
                                            style={styles.detalleButton}
                                        >
                                            👁️ Ver Detalle
                                        </button>
                                        {puedeCancel && (
                                            <button
                                                onClick={() => handleCancelarReserva(reserva)}
                                                style={styles.cancelarButton}
                                            >
                                                ❌ Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {mostrarDetalle && reservaSeleccionada && (
                <div style={styles.modalOverlay} onClick={() => setMostrarDetalle(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Detalle de Reserva</h2>
                            <button
                                onClick={() => setMostrarDetalle(false)}
                                style={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalBody}>
                            <div style={styles.codigoDestacado}>
                                <p style={styles.codigoLabel}>Código de Reserva</p>
                                <h2 style={styles.codigoValue}>
                                    {reservaSeleccionada.codigoReserva}
                                </h2>
                                <span
                                    style={{
                                        ...styles.estadoBadge,
                                        ...styles.estadoBadgeLarge,
                                        backgroundColor: getEstadoBadgeStyle(reservaSeleccionada).backgroundColor,
                                        color: getEstadoBadgeStyle(reservaSeleccionada).color
                                    }}
                                >
                                    {getEstadoBadgeStyle(reservaSeleccionada).label}
                                </span>
                            </div>

                            <div style={styles.detalleSection}>
                                <h3 style={styles.detalleSectionTitle}>🎬 Película</h3>
                                <div style={styles.peliculaDetalleCard}>
                                    <div style={styles.posterMini}>
                                        {reservaSeleccionada.funcion.pelicula.titulo.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={styles.peliculaTituloGrande}>
                                            {reservaSeleccionada.funcion.pelicula.titulo}
                                        </h4>
                                        <p style={styles.peliculaMetaDetalle}>
                                            {reservaSeleccionada.funcion.pelicula.clasificacion} • {reservaSeleccionada.funcion.pelicula.duracion} min
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.detalleSection}>
                                <h3 style={styles.detalleSectionTitle}>🏛️ Función</h3>
                                <div style={styles.detalleGrid}>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Sala:</span>
                                        <span style={styles.detalleValue}>
                                            {reservaSeleccionada.funcion.sala.nombre} ({reservaSeleccionada.funcion.sala.tipo})
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Fecha:</span>
                                        <span style={styles.detalleValue}>
                                            {new Date(reservaSeleccionada.funcion.fechaHora).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Hora:</span>
                                        <span style={styles.detalleValue}>
                                            {new Date(reservaSeleccionada.funcion.fechaHora).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Precio por asiento:</span>
                                        <span style={styles.detalleValue}>
                                            ${reservaSeleccionada.funcion.precio.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.detalleSection}>
                                <h3 style={styles.detalleSectionTitle}>💺 Asientos</h3>
                                <div style={styles.asientosContainer}>
                                    {reservaSeleccionada.asientos.map((asiento) => (
                                        <span key={asiento} style={styles.asientoChip}>
                                            {asiento}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.detalleSection}>
                                <h3 style={styles.detalleSectionTitle}>👤 Información de Compra</h3>
                                <div style={styles.detalleGrid}>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Cliente:</span>
                                        <span style={styles.detalleValue}>
                                            {reservaSeleccionada.nombreCliente}
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Email:</span>
                                        <span style={styles.detalleValue}>
                                            {reservaSeleccionada.emailCliente}
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Método de Pago:</span>
                                        <span style={styles.detalleValue}>
                                            {reservaSeleccionada.metodoPago || 'Pendiente'}
                                        </span>
                                    </div>
                                    <div style={styles.detalleItem}>
                                        <span style={styles.detalleLabel}>Fecha de Reserva:</span>
                                        <span style={styles.detalleValue}>
                                            {new Date(reservaSeleccionada.fechaCreacion).toLocaleString('es-ES')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.totalContainer}>
                                <span style={styles.totalLabel}>Total Pagado:</span>
                                <span style={styles.totalValue}>
                                    ${reservaSeleccionada.total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            {(() => {
                                const fechaFuncion = new Date(reservaSeleccionada.funcion.fechaHora);
                                const ahora = new Date();
                                const horasRestantes = (fechaFuncion - ahora) / (1000 * 60 * 60);
                                const puedeCancel = reservaSeleccionada.estado === 'CONFIRMADA' &&
                                    fechaFuncion > ahora &&
                                    horasRestantes >= 2;

                                return (
                                    <>
                                        {puedeCancel && (
                                            <button
                                                onClick={() => handleCancelarReserva(reservaSeleccionada)}
                                                style={styles.cancelarButtonModal}
                                            >
                                                ❌ Cancelar Reserva
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setMostrarDetalle(false)}
                                            style={styles.cerrarButton}
                                        >
                                            Cerrar
                                        </button>
                                    </>
                                );
                            })()}
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
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #e50914',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    loadingText: {
        marginTop: '20px',
        fontSize: '18px',
        color: '#666',
    },
    header: {
        backgroundColor: '#141414',
        color: 'white',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    },
    backButton: {
        backgroundColor: 'transparent',
        color: 'white',
        border: '1px solid white',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'all 0.3s ease',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        margin: 0,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
    },
    userName: {
        fontSize: '16px',
        fontWeight: '500',
    },
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
    },
    statSuccess: {
        borderLeft: '4px solid #28a745',
    },
    statInfo: {
        borderLeft: '4px solid #17a2b8',
    },
    statDanger: {
        borderLeft: '4px solid #dc3545',
    },
    statIcon: {
        fontSize: '32px',
    },
    statValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        margin: 0,
        color: '#333',
    },
    statLabel: {
        fontSize: '14px',
        color: '#666',
        margin: '5px 0 0 0',
    },
    filtrosContainer: {
        display: 'flex',
        gap: '15px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    filtroButton: {
        backgroundColor: 'white',
        color: '#333',
        border: '2px solid #ddd',
        padding: '12px 24px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
    },
    filtroButtonActive: {
        backgroundColor: '#e50914',
        color: 'white',
        borderColor: '#e50914',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    emptyIcon: {
        fontSize: '64px',
        marginBottom: '20px',
        display: 'block',
    },
    emptyTitle: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '10px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#666',
        marginBottom: '30px',
    },
    carteleraButton: {
        backgroundColor: '#e50914',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
    },
    reservasGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '25px',
    },
    reservaCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    reservaHeader: {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '1px solid #e9ecef',
    },
    reservaCodigo: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 10px 0',
    },
    estadoBadge: {
        display: 'inline-block',
        padding: '5px 12px',
        borderRadius: '15px',
        fontSize: '12px',
        fontWeight: 'bold',
    },
    estadoBadgeLarge: {
        padding: '8px 20px',
        fontSize: '14px',
    },
    reservaTotal: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#e50914',
    },
    reservaBody: {
        padding: '20px',
    },
    peliculaInfo: {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e9ecef',
    },
    posterMini: {
        width: '60px',
        height: '60px',
        backgroundColor: '#e50914',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        flexShrink: 0,
    },
    peliculaDetails: {
        flex: 1,
    },
    peliculaTitulo: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 5px 0',
    },
    peliculaMeta: {
        fontSize: '14px',
        color: '#666',
        margin: 0,
    },
    reservaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    infoRow: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: '20px',
        flexShrink: 0,
    },
    infoLabel: {
        fontSize: '12px',
        color: '#666',
        margin: '0 0 3px 0',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    infoValue: {
        fontSize: '14px',
        color: '#333',
        margin: 0,
        fontWeight: '500',
    },
    reservaFooter: {
        padding: '15px 20px',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #e9ecef',
    },
    detalleButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    cancelarButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    },
    modalHeader: {
        padding: '25px 30px',
        borderBottom: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
        margin: 0,
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: '28px',
        color: '#666',
        cursor: 'pointer',
        padding: '0',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
    },
    modalBody: {
        padding: '30px',
        overflowY: 'auto',
        flex: 1,
    },
    codigoDestacado: {
        textAlign: 'center',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '30px',
    },
    codigoLabel: {
        fontSize: '14px',
        color: '#666',
        textTransform: 'uppercase',
        fontWeight: '600',
        margin: '0 0 10px 0',
    },
    codigoValue: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#e50914',
        margin: '0 0 15px 0',
        letterSpacing: '2px',
    },
    detalleSection: {
        marginBottom: '30px',
    },
    detalleSectionTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '15px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e9ecef',
    },
    peliculaDetalleCard: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    peliculaTituloGrande: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 5px 0',
    },
    peliculaMetaDetalle: {
        fontSize: '14px',
        color: '#666',
        margin: 0,
    },
    detalleGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
    },
    detalleItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    detalleLabel: {
        fontSize: '12px',
        color: '#666',
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    detalleValue: {
        fontSize: '15px',
        color: '#333',
        fontWeight: '500',
    },
    asientosContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    asientoChip: {
        backgroundColor: '#e50914',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    totalContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginTop: '10px',
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#e50914',
    },
    modalFooter: {
        padding: '20px 30px',
        borderTop: '1px solid #e9ecef',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        backgroundColor: '#f8f9fa',
    },
    cancelarButtonModal: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    cerrarButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
};

// Añadir al final del archivo, antes del export default
export default MisReservas;