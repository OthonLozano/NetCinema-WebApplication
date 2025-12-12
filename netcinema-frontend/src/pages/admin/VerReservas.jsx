// src/pages/admin/VerReservas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservaService } from '../../services/reservaService';

function VerReservas() {
    const navigate = useNavigate();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('TODAS');
    const [busqueda, setBusqueda] = useState('');
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            const response = await reservaService.getAll();
            if (response.success) {
                setReservas(response.data);
            }
        } catch (error) {
            console.error('Error al cargar reservas:', error);
        } finally {
            setLoading(false);
        }
    };

    const filtrarReservas = () => {
        let reservasFiltradas = reservas;

        // Filtrar por estado
        if (filtroEstado !== 'TODAS') {
            reservasFiltradas = reservasFiltradas.filter(
                (r) => r.estado === filtroEstado
            );
        }

        // Filtrar por búsqueda (código, nombre, email)
        if (busqueda) {
            reservasFiltradas = reservasFiltradas.filter(
                (r) =>
                    r.codigoReserva.toLowerCase().includes(busqueda.toLowerCase()) ||
                    r.nombreCliente.toLowerCase().includes(busqueda.toLowerCase()) ||
                    r.emailCliente.toLowerCase().includes(busqueda.toLowerCase())
            );
        }

        return reservasFiltradas;
    };

    const getEstadoBadgeStyle = (estado) => {
        const baseStyle = {
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
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

    const handleCancelarReserva = async (reservaId) => {
        if (window.confirm('¿Estás seguro de cancelar esta reserva?')) {
            try {
                await reservaService.cancelar(reservaId);
                alert('Reserva cancelada exitosamente');
                cargarReservas();
            } catch (error) {
                alert('Error al cancelar la reserva');
                console.error(error);
            }
        }
    };

    const verDetalle = (reserva) => {
        setReservaSeleccionada(reserva);
        setMostrarDetalle(true);
    };

    const estadisticas = {
        total: reservas.length,
        confirmadas: reservas.filter((r) => r.estado === 'CONFIRMADA').length,
        pendientes: reservas.filter((r) => r.estado === 'PENDIENTE').length,
        canceladas: reservas.filter((r) => r.estado === 'CANCELADA').length,
        ingresoTotal: reservas
            .filter((r) => r.estado === 'CONFIRMADA')
            .reduce((sum, r) => sum + r.total, 0),
    };

    if (loading) {
        return <div style={styles.container}><p>Cargando reservas...</p></div>;
    }

    const reservasFiltradas = filtrarReservas();

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate('/admin')} style={styles.backButton}>
                    ← Volver al Panel
                </button>
                <h1 style={styles.title}>Todas las Reservas</h1>
            </header>

            <div style={styles.content}>
                {/* Estadísticas */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div>
                            <h3 style={styles.statValue}>{estadisticas.total}</h3>
                            <p style={styles.statLabel}>Total Reservas</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statSuccess }}>
                        <div>
                            <h3 style={styles.statValue}>{estadisticas.confirmadas}</h3>
                            <p style={styles.statLabel}>Confirmadas</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statWarning }}>
                        <div>
                            <h3 style={styles.statValue}>{estadisticas.pendientes}</h3>
                            <p style={styles.statLabel}>Pendientes</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statDanger }}>
                        <div>
                            <h3 style={styles.statValue}>{estadisticas.canceladas}</h3>
                            <p style={styles.statLabel}>Canceladas</p>
                        </div>
                    </div>
                    <div style={{ ...styles.statCard, ...styles.statPrimary }}>
                        <div>
                            <h3 style={styles.statValue}>${estadisticas.ingresoTotal.toFixed(2)}</h3>
                            <p style={styles.statLabel}>Ingresos Totales</p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div style={styles.filtersCard}>
                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Buscar:</label>
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            style={styles.searchInput}
                            placeholder="Código, nombre o email..."
                        />
                    </div>

                    <div style={styles.filterGroup}>
                        <label style={styles.filterLabel}>Estado:</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            style={styles.filterSelect}
                        >
                            <option value="TODAS">Todas</option>
                            <option value="CONFIRMADA">Confirmadas</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="CANCELADA">Canceladas</option>
                        </select>
                    </div>

                    <div style={styles.filterResults}>
                        Mostrando {reservasFiltradas.length} de {reservas.length} reservas
                    </div>
                </div>

                {/* Tabla de reservas */}
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr style={styles.tableHeader}>
                            <th style={styles.th}>Código</th>
                            <th style={styles.th}>Cliente</th>
                            <th style={styles.th}>Película</th>
                            <th style={styles.th}>Fecha/Hora Función</th>
                            <th style={styles.th}>Asientos</th>
                            <th style={styles.th}>Total</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {reservasFiltradas.map((reserva) => (
                            <tr key={reserva.id} style={styles.tableRow}>
                                <td style={styles.td}>
                                    <strong>{reserva.codigoReserva}</strong>
                                </td>
                                <td style={styles.td}>
                                    <div>{reserva.nombreCliente}</div>
                                    <div style={styles.email}>{reserva.emailCliente}</div>
                                </td>
                                <td style={styles.td}>{reserva.funcion.pelicula.titulo}</td>
                                <td style={styles.td}>
                                    {new Date(reserva.funcion.fechaHora).toLocaleString('es-ES')}
                                </td>
                                <td style={styles.td}>{reserva.asientos.join(', ')}</td>
                                <td style={styles.td}>
                                    <strong>${reserva.total.toFixed(2)}</strong>
                                </td>
                                <td style={styles.td}>
                    <span style={getEstadoBadgeStyle(reserva.estado)}>
                      {reserva.estado}
                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button
                                        onClick={() => verDetalle(reserva)}
                                        style={styles.viewButton}
                                    >
                                        Ver
                                    </button>
                                    {reserva.estado !== 'CANCELADA' && (
                                        <button
                                            onClick={() => handleCancelarReserva(reserva.id)}
                                            style={styles.cancelButton}
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Detalle */}
            {mostrarDetalle && reservaSeleccionada && (
                <div style={styles.modalOverlay} onClick={() => setMostrarDetalle(false)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 style={styles.modalTitle}>Detalle de Reserva</h2>

                        <div style={styles.detalleGrid}>
                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Código:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.codigoReserva}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Estado:</span>
                                <span style={getEstadoBadgeStyle(reservaSeleccionada.estado)}>
                  {reservaSeleccionada.estado}
                </span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Cliente:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.nombreCliente}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Email:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.emailCliente}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Película:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.funcion.pelicula.titulo}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Sala:</span>
                                <span style={styles.detalleValue}>
                  {reservaSeleccionada.funcion.sala.nombre} ({reservaSeleccionada.funcion.sala.tipo})
                </span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Fecha/Hora:</span>
                                <span style={styles.detalleValue}>
                  {new Date(reservaSeleccionada.funcion.fechaHora).toLocaleString('es-ES')}
                </span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Asientos:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.asientos.join(', ')}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Método de Pago:</span>
                                <span style={styles.detalleValue}>{reservaSeleccionada.metodoPago || 'Pendiente'}</span>
                            </div>

                            <div style={styles.detalleItem}>
                                <span style={styles.detalleLabel}>Fecha de Creación:</span>
                                <span style={styles.detalleValue}>
                  {new Date(reservaSeleccionada.fechaCreacion).toLocaleString('es-ES')}
                </span>
                            </div>

                            <div style={styles.totalDetalle}>
                                <span style={styles.totalLabel}>Total:</span>
                                <span style={styles.totalValue}>${reservaSeleccionada.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setMostrarDetalle(false)}
                            style={styles.closeButton}
                        >
                            Cerrar
                        </button>
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
    content: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
    },
    statCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    statSuccess: {
        borderLeft: '4px solid #28a745',
    },
    statWarning: {
        borderLeft: '4px solid #ffc107',
    },
    statDanger: {
        borderLeft: '4px solid #dc3545',
    },
    statPrimary: {
        borderLeft: '4px solid #667eea',
    },
    statIcon: {
        fontSize: '32px',
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        margin: '0 0 4px 0',
    },
    statLabel: {
        fontSize: '12px',
        color: '#6c757d',
        margin: 0,
    },
    filtersCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '30px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    filterGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        flex: 1,
        minWidth: '200px',
    },
    filterLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6c757d',
    },
    searchInput: {
        padding: '10px 12px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
    },
    filterSelect: {
        padding: '10px 12px',
        border: '2px solid #e9ecef',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        backgroundColor: 'white',
    },
    filterResults: {
        fontSize: '14px',
        color: '#6c757d',
        marginLeft: 'auto',
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
        fontSize: '13px',
    },
    tableRow: {
        borderBottom: '1px solid #dee2e6',
    },
    td: {
        padding: '16px',
        color: '#495057',
        fontSize: '13px',
    },
    email: {
        fontSize: '11px',
        color: '#6c757d',
    },
    viewButton: {
        padding: '6px 12px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '8px',
        fontSize: '12px',
    },
    cancelButton: {
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
        maxWidth: '700px',
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
    detalleGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
    },
    detalleItem: {
        padding: '12px',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
    },
    detalleLabel: {
        display: 'block',
        fontSize: '11px',
        color: '#6c757d',
        fontWeight: '600',
        marginBottom: '4px',
    },
    detalleValue: {
        display: 'block',
        fontSize: '14px',
        color: '#2c3e50',
        fontWeight: '500',
    },
    totalDetalle: {
        gridColumn: '1 / -1',
        padding: '16px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    totalValue: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#667eea',
    },
    closeButton: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default VerReservas;