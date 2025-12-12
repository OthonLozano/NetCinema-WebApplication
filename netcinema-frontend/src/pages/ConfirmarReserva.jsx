import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { reservaService } from '../services/reservaService';
import { authService } from '../services/authService';

function ConfirmarReserva() {
    const location = useLocation();
    const navigate = useNavigate();
    const { funcionId, asientos, total, funcion } = location.state || {};

    const user = authService.getUser();

    const [formData, setFormData] = useState({
        nombreCliente: user ? `${user.nombre} ${user.apellido}` : '',
        emailCliente: user ? user.email : '',
        metodoPago: 'TARJETA',
    });

    const [procesando, setProcesando] = useState(false);
    const [reservaCreada, setReservaCreada] = useState(null);
    const [error, setError] = useState('');

    if (!funcionId || !asientos || !funcion) {
        return (
            <div style={styles.errorContainer}>
                <h2>Error: Datos de reserva no encontrados</h2>
                <button onClick={() => navigate('/cartelera')} style={styles.button}>
                    Volver a la cartelera
                </button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleConfirmarReserva = async () => {
        if (!formData.nombreCliente || !formData.emailCliente) {
            setError('Por favor completa todos los campos');
            return;
        }

        setProcesando(true);
        setError('');

        try {
            console.log('Creando reserva con datos:', {
                funcionId,
                usuarioId: user?.id,
                nombreCliente: formData.nombreCliente,
                emailCliente: formData.emailCliente,
                asientos,
            });

            // 1. Crear reserva
            const reservaData = {
                funcionId: funcionId,
                usuarioId: user ? user.id : null,
                nombreCliente: formData.nombreCliente,
                emailCliente: formData.emailCliente,
                asientos: asientos,
            };

            const reservaResponse = await reservaService.create(reservaData);
            console.log('Respuesta crear reserva:', reservaResponse);

            if (!reservaResponse.success) {
                throw new Error(reservaResponse.message || 'Error al crear la reserva');
            }

            const reserva = reservaResponse.data;

            // 2. Confirmar reserva con método de pago
            console.log('Confirmando reserva:', reserva.id);
            const confirmarResponse = await reservaService.confirmar(
                reserva.id,
                formData.metodoPago
            );
            console.log('Respuesta confirmar:', confirmarResponse);

            if (!confirmarResponse.success) {
                throw new Error(confirmarResponse.message || 'Error al confirmar la reserva');
            }

            setReservaCreada(confirmarResponse.data);

        } catch (error) {
            console.error('Error completo:', error);

            let errorMessage = 'Error al procesar la reserva. Por favor intenta de nuevo.';

            if (error.response) {
                // Error de respuesta del servidor
                errorMessage = error.response.data?.message ||
                    `Error del servidor: ${error.response.status}`;
            } else if (error.message) {
                // Error personalizado
                errorMessage = error.message;
            }

            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setProcesando(false);
        }
    };

    // Pantalla de éxito
    if (reservaCreada) {
        return (
            <div style={styles.container}>
                <div style={styles.successCard}>
                    <h1 style={styles.successTitle}>¡Reserva Confirmada!</h1>
                    <p style={styles.successText}>
                        Tu reserva ha sido procesada exitosamente
                    </p>

                    <div style={styles.codigoCard}>
                        <p style={styles.codigoLabel}>Código de reserva:</p>
                        <h2 style={styles.codigoValue}>{reservaCreada.codigoReserva}</h2>
                        <p style={styles.codigoHint}>
                            Guarda este código para consultar tu reserva
                        </p>
                    </div>

                    <div style={styles.detallesCard}>
                        <h3 style={styles.detallesTitle}>Detalles de la reserva</h3>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Película:</span>
                            <span style={styles.detalleValue}>{funcion.pelicula.titulo}</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Sala:</span>
                            <span style={styles.detalleValue}>
                {funcion.sala.nombre} ({funcion.sala.tipo})
              </span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Fecha y hora:</span>
                            <span style={styles.detalleValue}>
                {new Date(funcion.fechaHora).toLocaleString('es-ES')}
              </span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Asientos:</span>
                            <span style={styles.detalleValue}>
                {reservaCreada.asientos.join(', ')}
              </span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Cliente:</span>
                            <span style={styles.detalleValue}>{reservaCreada.nombreCliente}</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Email:</span>
                            <span style={styles.detalleValue}>{reservaCreada.emailCliente}</span>
                        </div>
                        <div style={styles.detalleItem}>
                            <span style={styles.detalleLabel}>Método de pago:</span>
                            <span style={styles.detalleValue}>{reservaCreada.metodoPago}</span>
                        </div>
                        <div style={styles.totalItem}>
                            <span style={styles.totalLabel}>Total pagado:</span>
                            <span style={styles.totalValue}>${reservaCreada.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div style={styles.buttonsContainer}>
                        <button
                            onClick={() => navigate('/cartelera')}
                            style={styles.primaryButton}
                        >
                            Volver a la cartelera
                        </button>

                    </div>
                </div>
            </div>
        );
    }

    // Formulario de confirmación
    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backButton}>
                    ← Volver
                </button>
                <h1 style={styles.headerTitle}>Confirmar Reserva</h1>
            </header>

            <div style={styles.content}>
                <div style={styles.mainCard}>
                    <div style={styles.leftSection}>
                        <h2 style={styles.sectionTitle}>Detalles de la función</h2>

                        <div style={styles.movieInfo}>
                            <div style={styles.posterMini}>
                                {funcion.pelicula.titulo.charAt(0)}
                            </div>
                            <div>
                                <h3 style={styles.movieTitle}>{funcion.pelicula.titulo}</h3>
                                <p style={styles.movieMeta}>
                                    {funcion.pelicula.clasificacion} • {funcion.pelicula.duracion} min
                                </p>
                            </div>
                        </div>

                        <div style={styles.infoGrid}>
                            <div style={styles.infoItem}>

                                <div>
                                    <p style={styles.infoLabel}>Sala</p>
                                    <p style={styles.infoValue}>
                                        {funcion.sala.nombre} ({funcion.sala.tipo})
                                    </p>
                                </div>
                            </div>

                            <div style={styles.infoItem}>

                                <div>
                                    <p style={styles.infoLabel}>Fecha</p>
                                    <p style={styles.infoValue}>
                                        {new Date(funcion.fechaHora).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.infoItem}>

                                <div>
                                    <p style={styles.infoLabel}>Hora</p>
                                    <p style={styles.infoValue}>
                                        {new Date(funcion.fechaHora).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.infoItem}>
                                <div>
                                    <p style={styles.infoLabel}>Asientos</p>
                                    <p style={styles.infoValue}>{asientos.join(', ')}</p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.precioSection}>
                            <div style={styles.precioDetalle}>
                                <span>Precio por asiento:</span>
                                <span>${funcion.precio.toFixed(2)}</span>
                            </div>
                            <div style={styles.precioDetalle}>
                                <span>Cantidad de asientos:</span>
                                <span>{asientos.length}</span>
                            </div>
                            <div style={styles.precioTotal}>
                                <span>Total a pagar:</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.rightSection}>
                        <h2 style={styles.sectionTitle}>Datos del cliente</h2>

                        {error && (
                            <div style={styles.errorBox}>

                                <span>{error}</span>
                            </div>
                        )}

                        <div style={styles.form}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombreCliente"
                                    value={formData.nombreCliente}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email *</label>
                                <input
                                    type="email"
                                    name="emailCliente"
                                    value={formData.emailCliente}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="tu@email.com"
                                    required
                                />
                                <p style={styles.hint}>
                                    Recibirás la confirmación en este correo
                                </p>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Método de pago *</label>
                                <select
                                    name="metodoPago"
                                    value={formData.metodoPago}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                >
                                    <option value="TARJETA">Tarjeta de crédito/débito</option>
                                    <option value="EFECTIVO">Efectivo en taquilla</option>
                                    <option value="TRANSFERENCIA">Transferencia bancaria</option>
                                </select>
                            </div>

                            {formData.metodoPago === 'TARJETA' && (
                                <div style={styles.paymentInfo}>
                                    <p style={styles.paymentNote}>
                                        Simulación de pago con tarjeta
                                    </p>
                                    <p style={styles.paymentText}>
                                        En un sistema real, aquí se integraría una pasarela de pago
                                        (Stripe, PayPal, etc.)
                                    </p>
                                </div>
                            )}

                            {formData.metodoPago === 'EFECTIVO' && (
                                <div style={styles.paymentInfo}>
                                    <p style={styles.paymentNote}>Pago en taquilla</p>
                                    <p style={styles.paymentText}>
                                        Deberás presentar tu código de reserva y pagar en la taquilla
                                        del cine antes de la función.
                                    </p>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={handleConfirmarReserva}
                                disabled={procesando}
                                style={{
                                    ...styles.confirmarButton,
                                    ...(procesando && styles.confirmarButtonDisabled),
                                }}
                            >
                                {procesando ? 'Procesando...' : 'Confirmar y pagar'}
                            </button>
                        </div>
                    </div>
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
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px',
    },
    mainCard: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    leftSection: {
        borderRight: '2px solid #e9ecef',
        paddingRight: '30px',
    },
    rightSection: {
        paddingLeft: '30px',
    },
    sectionTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '24px',
    },
    errorBox: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '14px',
        color: '#c62828',
    },
    errorIcon: {
        fontSize: '18px',
    },
    movieInfo: {
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
    },
    posterMini: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '32px',
        color: 'white',
        fontWeight: 'bold',
    },
    movieTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '6px',
    },
    movieMeta: {
        fontSize: '14px',
        color: '#6c757d',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px',
    },
    infoItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: '24px',
    },
    infoLabel: {
        fontSize: '12px',
        color: '#6c757d',
        marginBottom: '4px',
    },
    infoValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    precioSection: {
        padding: '24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
    },
    precioDetalle: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
        fontSize: '14px',
        color: '#6c757d',
    },
    precioTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '16px',
        marginTop: '16px',
        borderTop: '2px solid #dee2e6',
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.3s',
    },
    select: {
        padding: '12px 16px',
        border: '2px solid #e9ecef',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    hint: {
        fontSize: '12px',
        color: '#6c757d',
        marginTop: '4px',
    },
    paymentInfo: {
        padding: '16px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff',
    },
    paymentNote: {
        fontWeight: '600',
        color: '#0066cc',
        marginBottom: '8px',
    },
    paymentText: {
        fontSize: '13px',
        color: '#495057',
        lineHeight: '1.5',
    },
    confirmarButton: {
        padding: '16px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginTop: '16px',
    },
    confirmarButtonDisabled: {
        backgroundColor: '#dee2e6',
        color: '#adb5bd',
        cursor: 'not-allowed',
    },
    // Estilos para pantalla de éxito
    successCard: {
        maxWidth: '800px',
        margin: '80px auto',
        backgroundColor: 'white',
        padding: '60px',
        borderRadius: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        textAlign: 'center',
    },
    successIcon: {
        fontSize: '80px',
        marginBottom: '24px',
    },
    successTitle: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '12px',
    },
    successText: {
        fontSize: '18px',
        color: '#6c757d',
        marginBottom: '40px',
    },
    codigoCard: {
        padding: '32px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        marginBottom: '40px',
    },
    codigoLabel: {
        fontSize: '14px',
        color: '#6c757d',
        marginBottom: '8px',
    },
    codigoValue: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#667eea',
        letterSpacing: '2px',
        marginBottom: '12px',
    },
    codigoHint: {
        fontSize: '13px',
        color: '#6c757d',
    },
    detallesCard: {
        textAlign: 'left',
        padding: '32px',
        backgroundColor: '#fff',
        border: '2px solid #e9ecef',
        borderRadius: '12px',
        marginBottom: '32px',
    },
    detallesTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    detalleItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f1f3f5',
    },
    detalleLabel: {
        fontSize: '14px',
        color: '#6c757d',
    },
    detalleValue: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'right',
    },
    totalItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 0 0',
        marginTop: '12px',
        borderTop: '2px solid #e9ecef',
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
    buttonsContainer: {
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
    },
    primaryButton: {
        padding: '14px 32px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    secondaryButton: {
        padding: '14px 32px',
        backgroundColor: 'white',
        color: '#667eea',
        border: '2px solid #667eea',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    errorContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
    },
    button: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
    },
};

export default ConfirmarReserva;