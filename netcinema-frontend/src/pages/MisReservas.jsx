import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService } from '../services/reservaService';
import { authService } from '../services/authService';
import QRCode from 'react-qr-code';
import { downloadSvgAsPng } from '../utils/qrUtils';
import { svgToPngDataUrl, generateReservationPdf } from '../utils/pdfUtils';

function MisReservas() {
    const navigate = useNavigate();
    const user = authService.getUser();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('TODAS'); // TODAS, CONFIRMADA, PENDIENTE, CANCELADA
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            const response = await reservaService.getByUsuario(user.id);
            if (response.success) {
                // Ordenar por fecha más reciente primero
                const reservasOrdenadas = response.data.sort(
                    (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
                );
                setReservas(reservasOrdenadas);
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
        } finally {
            setLoading(false);
        }
    };

    const reservasFiltradas = () => {
        if (filtro === 'TODAS') {
            return reservas;
        }
        return reservas.filter((r) => r.estado === filtro);
    };

    const abrirDetalle = (reserva) => {
        setReservaSeleccionada(reserva);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setReservaSeleccionada(null);
    };

    const handleCancelar = async (reservaId) => {
        if (
            window.confirm(
                '¿Estás seguro de cancelar esta reserva? Esta acción no se puede deshacer.'
            )
        ) {
            try {
                await reservaService.cancelar(reservaId);
                alert('Reserva cancelada exitosamente');
                cerrarModal();
                cargarReservas();
            } catch (error) {
                alert('Error al cancelar la reserva');
                console.error(error);
            }
        }
    };

    const getEstadoBadge = (estado) => {
        const estilos = {
            CONFIRMADA: { bg: '#d4edda', color: '#155724', text: '✓ Confirmada' },
            PENDIENTE: { bg: '#fff3cd', color: '#856404', text: '⏳ Pendiente' },
            CANCELADA: { bg: '#f8d7da', color: '#721c24', text: '✗ Cancelada' },
        };
        return estilos[estado] || estilos.PENDIENTE;
    };

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const esFuncionPasada = (fechaHora) => {
        return new Date(fechaHora) < new Date();
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p style={styles.loadingText}>Cargando tus reservas...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/cartelera')} style={styles.backButton}>
                    ← Volver a la Cartelera
                </button>
                <h1 style={styles.headerTitle}>Mis Reservas</h1>
                <button onClick={() => authService.logout() || navigate('/')} style={styles.logoutButton}>
                    Cerrar Sesión
                </button>
            </header>

            <div style={styles.content}>
                {/* Filtros */}
                <div style={styles.filtrosContainer}>
                    <button
                        onClick={() => setFiltro('TODAS')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'TODAS' && styles.filtroButtonActive),
                        }}
                    >
                        Todas ({reservas.length})
                    </button>
                    <button
                        onClick={() => setFiltro('CONFIRMADA')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'CONFIRMADA' && styles.filtroButtonActive),
                        }}
                    >
                        Confirmadas ({reservas.filter((r) => r.estado === 'CONFIRMADA').length})
                    </button>
                    <button
                        onClick={() => setFiltro('PENDIENTE')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'PENDIENTE' && styles.filtroButtonActive),
                        }}
                    >
                        Pendientes ({reservas.filter((r) => r.estado === 'PENDIENTE').length})
                    </button>
                    <button
                        onClick={() => setFiltro('CANCELADA')}
                        style={{
                            ...styles.filtroButton,
                            ...(filtro === 'CANCELADA' && styles.filtroButtonActive),
                        }}
                    >
                        Canceladas ({reservas.filter((r) => r.estado === 'CANCELADA').length})
                    </button>
                </div>

                {/* Lista de reservas */}
                {reservasFiltradas().length === 0 ? (
                    <div style={styles.emptyState}>
                        <h3 style={styles.emptyTitle}>No tienes reservas</h3>
                        <p style={styles.emptyText}>
                            {filtro === 'TODAS'
                                ? 'Aún no has realizado ninguna reserva'
                                : `No tienes reservas ${filtro.toLowerCase()}s`}
                        </p>
                        <button onClick={() => navigate('/cartelera')} style={styles.emptyButton}>
                            Ver Cartelera
                        </button>
                    </div>
                ) : (
                    <div style={styles.reservasGrid}>
                        {reservasFiltradas().map((reserva) => {
                            const estadoBadge = getEstadoBadge(reserva.estado);
                            const funcionPasada = esFuncionPasada(reserva.funcion.fechaHora);

                            return (
                                <div
                                    key={reserva.id}
                                    style={styles.reservaCard}
                                    onClick={() => abrirDetalle(reserva)}
                                >
                                    <div style={styles.reservaHeader}>
                                        <div>
                                            <h3 style={styles.reservaTitulo}>{reserva.funcion.pelicula.titulo}</h3>
                                            <p style={styles.reservaCodigo}>Código: {reserva.codigoReserva}</p>
                                        </div>
                                        <span
                                            style={{
                                                ...styles.estadoBadge,
                                                backgroundColor: estadoBadge.bg,
                                                color: estadoBadge.color,
                                            }}
                                        >
                      {estadoBadge.text}
                    </span>
                                    </div>

                                    <div style={styles.reservaInfo}>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoText}>
                        {formatearFecha(reserva.funcion.fechaHora)}
                      </span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoText}>
                        {reserva.funcion.sala.nombre} ({reserva.funcion.sala.tipo})
                      </span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoText}>
                        Asientos: {reserva.asientos.join(', ')}
                      </span>
                                        </div>
                                        <div style={styles.infoRow}>
                                            <span style={styles.infoText}>
                        Total: ${reserva.total.toFixed(2)}
                      </span>
                                        </div>
                                    </div>

                                    {funcionPasada && reserva.estado === 'CONFIRMADA' && (
                                        <div style={styles.pasadaBadge}>Función ya realizada</div>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirDetalle(reserva);
                                        }}
                                        style={styles.verDetalleButton}
                                    >
                                        Ver Detalle →
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {mostrarModal && reservaSeleccionada && (
                <div style={styles.modalOverlay} onClick={cerrarModal}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Detalle de Reserva</h2>
                            <button onClick={cerrarModal} style={styles.closeButton}>
                                ✕
                            </button>
                        </div>

                        <div style={styles.modalContent}>
                            {/* Código de reserva destacado */}
                            <div style={styles.codigoDestacado}>
                                <p style={styles.codigoLabel}>Código de Reserva</p>
                                <h3 style={styles.codigoValor}>{reservaSeleccionada.codigoReserva}</h3>
                            </div>

                            {/* QR en modal (si esta confirmada) */}
                            {reservaSeleccionada.estado === 'CONFIRMADA' && (
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8 }}>
                                        <div id={`qr-container-${reservaSeleccionada.id}`} style={{ background: 'white', padding: 8 }}>
                                            <QRCode value={reservaSeleccionada.codigoReserva} size={140} />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const svgEl = document.querySelector(`#qr-container-${reservaSeleccionada.id} svg`);
                                                    await downloadSvgAsPng(svgEl, `${reservaSeleccionada.codigoReserva}.png`);
                                                    alert('QR descargado');
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error al descargar QR');
                                                }
                                            }}
                                            style={styles.newSearchButton}
                                        >
                                            Descargar QR
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const svgEl = document.querySelector(`#qr-container-${reservaSeleccionada.id} svg`);
                                                    if (!svgEl) { alert('QR no encontrado'); return; }
                                                    const qrDataUrl = await svgToPngDataUrl(svgEl, 4);
                                                    await generateReservationPdf(reservaSeleccionada, reservaSeleccionada.funcion, qrDataUrl);
                                                } catch (err) {
                                                    console.error(err);
                                                    alert('Error al generar PDF');
                                                }
                                            }}
                                            style={styles.newSearchButton}
                                        >
                                            Descargar PDF
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Estado */}
                            <div style={styles.detalleSection}>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Estado:</span>
                                    <span
                                        style={{
                                            ...styles.estadoBadge,
                                            backgroundColor: getEstadoBadge(reservaSeleccionada.estado).bg,
                                            color: getEstadoBadge(reservaSeleccionada.estado).color,
                                        }}
                                    >
                    {getEstadoBadge(reservaSeleccionada.estado).text}
                  </span>
                                </div>
                            </div>

                            {/* Información de la película */}
                            <div style={styles.detalleSection}>
                                <h4 style={styles.sectionTitle}>Película</h4>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Título:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.funcion.pelicula.titulo}
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Clasificación:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.funcion.pelicula.clasificacion}
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Duración:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.funcion.pelicula.duracion} minutos
                  </span>
                                </div>
                            </div>

                            {/* Información de la función */}
                            <div style={styles.detalleSection}>
                                <h4 style={styles.sectionTitle}>Función</h4>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Fecha y Hora:</span>
                                    <span style={styles.detalleValor}>
                    {formatearFecha(reservaSeleccionada.funcion.fechaHora)}
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Sala:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.funcion.sala.nombre} (
                                        {reservaSeleccionada.funcion.sala.tipo})
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Asientos:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.asientos.join(', ')}
                  </span>
                                </div>
                            </div>

                            {/* Información del cliente */}
                            <div style={styles.detalleSection}>
                                <h4 style={styles.sectionTitle}>Cliente</h4>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Nombre:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.nombreCliente}
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Email:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.emailCliente}
                  </span>
                                </div>
                            </div>

                            {/* Información de pago */}
                            <div style={styles.detalleSection}>
                                <h4 style={styles.sectionTitle}>Pago</h4>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Método de pago:</span>
                                    <span style={styles.detalleValor}>
                    {reservaSeleccionada.metodoPago || 'No especificado'}
                  </span>
                                </div>
                                <div style={styles.detalleRow}>
                                    <span style={styles.detalleLabel}>Fecha de reserva:</span>
                                    <span style={styles.detalleValor}>
                    {formatearFecha(reservaSeleccionada.fechaCreacion)}
                  </span>
                                </div>
                                <div style={{ ...styles.detalleRow, ...styles.totalRow }}>
                                    <span style={styles.totalLabel}>Total Pagado:</span>
                                    <span style={styles.totalValor}>
                    ${reservaSeleccionada.total.toFixed(2)}
                  </span>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div style={styles.modalActions}>
                                {reservaSeleccionada.estado === 'PENDIENTE' && (
                                    <button
                                        onClick={() => handleCancelar(reservaSeleccionada.id)}
                                        style={styles.cancelarButton}
                                    >
                                        Cancelar Reserva
                                    </button>
                                )}
                                <button onClick={cerrarModal} style={styles.cerrarButton}>
                                    Cerrar
                                </button>
                            </div>
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
    loadingText: {
        marginTop: '20px',
        color: '#6c757d',
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
    logoutButton: {
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
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
    filtrosContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '30px',
        flexWrap: 'wrap',
    },
    filtroButton: {
        padding: '10px 20px',
        backgroundColor: 'white',
        color: '#6c757d',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'all 0.3s ease',
    },
    filtroButtonActive: {
        backgroundColor: '#667eea',
        color: 'white',
        borderColor: '#667eea',
    },
    reservasGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '24px',
    },
    reservaCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    reservaHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f8f9fa',
    },
    reservaTitulo: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '6px',
    },
    reservaCodigo: {
        fontSize: '13px',
        color: '#6c757d',
        fontFamily: 'monospace',
    },
    estadoBadge: {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    reservaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '16px',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    infoIcon: {
        fontSize: '16px',
    },
    infoText: {
        fontSize: '14px',
        color: '#495057',
    },
    pasadaBadge: {
        padding: '8px 12px',
        backgroundColor: '#e9ecef',
        color: '#6c757d',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '12px',
    },
    verDetalleButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    emptyState: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
    },
    emptyIcon: {
        fontSize: '80px',
        display: 'block',
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
        marginBottom: '24px',
    },
    emptyButton: {
        padding: '12px 32px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '16px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalHeader: {
        padding: '24px',
        borderBottom: '2px solid #f8f9fa',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 10,
    },
    modalTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: 0,
    },
    closeButton: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: '#f8f9fa',
        color: '#6c757d',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        padding: '24px',
    },
    codigoDestacado: {
        textAlign: 'center',
        padding: '24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '24px',
    },
    codigoLabel: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '8px',
    },
    codigoValor: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#667eea',
        fontFamily: 'monospace',
        letterSpacing: '2px',
    },
    detalleSection: {
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #f8f9fa',
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '16px',
    },
    detalleRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
    },
    detalleLabel: {
        fontSize: '14px',
        color: '#6c757d',
        fontWeight: '500',
    },
    detalleValor: {
        fontSize: '14px',
        color: '#2c3e50',
        fontWeight: '600',
        textAlign: 'right',
        maxWidth: '60%',
    },
    totalRow: {
        paddingTop: '16px',
        marginTop: '16px',
        borderTop: '2px solid #e9ecef',
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    totalValor: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
        flexWrap: 'wrap',
    },
    cancelarButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    imprimirButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    cerrarButton: {
        flex: 1,
        padding: '12px 24px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default MisReservas;