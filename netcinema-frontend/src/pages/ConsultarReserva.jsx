import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code'; //es para generar QR
import { Html5Qrcode } from 'html5-qrcode'; //es para manejo de QR
import {downloadSvgAsPng} from '../utils/qrUtils';
import { svgToPngDataUrl, generateReservationPdf } from '../utils/pdfUtils';

function ConsultarReserva() {
    const navigate = useNavigate();
    const [codigoReserva, setCodigoReserva] = useState('');
    const [reserva, setReserva] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false); // Nuevo estado para mostrar/ocultar el escáner
    const [scannerLoading, setScannerLoading] = useState(false); // Nuevo estado para indicar carga del escáner
    const scannerRef = useRef(null); // Referencia al contenedor del escáner
    const html5QrCodeRef = useRef(null); // Referencia a la instancia de Html5Qrcode

    const buscarReserva = async (codigo) => {
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8080/api/reservas/codigo/${codigo}`);
            const data = await response.json();

            if (data.success) {
                setReserva(data.data);
                setCodigoReserva(codigo);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        await buscarReserva(codigoReserva);
    };

    const startScanner = async () => {
        setScannerLoading(true);
        setError('');
        setShowScanner(true);

        try {
            // Esperar a que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 100));

            const html5QrCode = new Html5Qrcode("qr-reader");
            html5QrCodeRef.current = html5QrCode;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await html5QrCode.start(
                { facingMode: "environment" }, // Usar cámara trasera en móviles
                config,
                async (decodedText) => {
                    // QR escaneado exitosamente
                    console.log("QR escaneado:", decodedText);
                    
                    // Detener el scanner
                    await stopScanner();
                    
                    // Buscar la reserva
                    await buscarReserva(decodedText);
                },
                (errorMessage) => {
                    // Error al escanear (esto es normal, ocurre continuamente)
                    // No hacer nada aquí para evitar spam en consola
                }
            );

            setScannerLoading(false);
        } catch (err) {
            console.error("Error al iniciar scanner:", err);
            setError('Error al acceder a la cámara. Verifica los permisos.');
            setShowScanner(false);
            setScannerLoading(false);
        }
    };

    const stopScanner = async () => {
        try {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
            }
            html5QrCodeRef.current = null;
            setShowScanner(false);
        } catch (err) {
            console.error("Error al detener scanner:", err);
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
                        Ingresa tu código de reserva o escanea el código QR
                    </p>

                    {!showScanner ? (
                        <>
                            <form onSubmit={handleSubmit} style={styles.form}>
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

                            <div style={styles.divider}>
                                <span style={styles.dividerText}>O</span>
                            </div>

                            <button
                                onClick={startScanner}
                                style={styles.scanButton}
                                disabled={scannerLoading}
                            >
                                <span style={styles.scanIcon}>📷</span>
                                {scannerLoading ? 'Iniciando cámara...' : 'Escanear Código QR'}
                            </button>
                        </>
                    ) : (
                        <div style={styles.scannerContainer}>
                            <div style={styles.scannerHeader}>
                                <h3 style={styles.scannerTitle}>Escanea tu código QR</h3>
                                <p style={styles.scannerSubtitle}>
                                    Coloca el código QR dentro del recuadro
                                </p>
                            </div>
                            
                            <div style={styles.qrReaderWrapper}>
                                <div id="qr-reader" ref={scannerRef} style={styles.qrReader}></div>
                            </div>

                            {scannerLoading && (
                                <div style={styles.scannerLoadingContainer}>
                                    <div style={styles.spinner}></div>
                                    <p style={styles.scannerLoadingText}>
                                        Iniciando cámara...
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={stopScanner}
                                style={styles.cancelScanButton}
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>

                {reserva && (
                    <div style={styles.resultCard}>
                        <div style={styles.resultHeader}>
                            <h2 style={styles.resultTitle}>Detalles de la Reserva</h2>
                            <span style={getEstadoBadgeStyle(reserva.estado)}>
                                {reserva.estado}
                            </span>
                        </div>

                        {/* QR y descargar */}
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ display: 'inline-block', padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <div id={`qr-container-${reserva.id}`} style={{ background: 'white', padding: 8 }}>
                                    <QRCode value={reserva.codigoReserva} size={140} />
                                </div>
                            </div>
                            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    onClick={async () => {
                                        try {
                                            const svgEl = document.querySelector(`#qr-container-${reserva.id} svg`);
                                            await downloadSvgAsPng(svgEl, `${reserva.codigoReserva}.png`);
                                            alert('QR descargado');
                                        } catch (err) {
                                            console.error(err);
                                            alert('Error al descargar QR');
                                        }
                                    }}
                                    style={styles.downloadButton}
                                >
                                    📥 Descargar QR
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const svgEl = document.querySelector(`#qr-container-${reserva.id} svg`);
                                            if (!svgEl) { alert('QR no encontrado'); return; }
                                            const qrDataUrl = await svgToPngDataUrl(svgEl, 4);
                                            await generateReservationPdf(reserva, reserva.funcion, qrDataUrl);
                                        } catch (err) {
                                            console.error(err);
                                            alert('Error al generar PDF');
                                        }
                                    }}
                                    style={styles.pdfButton}
                                >
                                    📄 Descargar PDF
                                </button>
                            </div>
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
                                    setError('');
                                }}
                                style={styles.newSearchButton}
                            >
                                Nueva Búsqueda
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
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
        transition: 'all 0.3s ease',
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
        transition: 'all 0.3s ease',
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
    divider: {
        display: 'flex',
        alignItems: 'center',
        margin: '24px 0',
        gap: '16px',
    },
    dividerText: {
        padding: '0 16px',
        color: '#6c757d',
        fontWeight: '600',
        fontSize: '14px',
    },
    scanButton: {
        width: '100%',
        padding: '16px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
    },
    scanIcon: {
        fontSize: '24px',
    },
    scannerContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    scannerHeader: {
        textAlign: 'center',
    },
    scannerTitle: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '8px',
    },
    scannerSubtitle: {
        fontSize: '14px',
        color: '#6c757d',
        margin: 0,
    },
    qrReaderWrapper: {
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
    qrReader: {
        width: '100%',
    },
    scannerLoadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e9ecef',
        borderTop: '4px solid #28a745',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    scannerLoadingText: {
        color: '#6c757d',
        fontSize: '14px',
        margin: 0,
    },
    cancelScanButton: {
        padding: '14px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
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
    downloadButton: {
        padding: '12px 24px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    pdfButton: {
        padding: '12px 24px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
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
        transition: 'all 0.3s ease',
    },
};

export default ConsultarReserva;