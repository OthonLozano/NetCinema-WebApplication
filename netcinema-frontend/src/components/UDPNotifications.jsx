// src/components/UDPNotifications.jsx
import { useState, useEffect, useRef } from 'react';

function UDPNotifications({ usuarioRol }) {
    const [notificaciones, setNotificaciones] = useState([]);
    const [mostrarPanel, setMostrarPanel] = useState(false);
    const [conectado, setConectado] = useState(false);
    const socketRef = useRef(null);
    const [contadorNoLeidas, setContadorNoLeidas] = useState(0);

    useEffect(() => {
        // Solo conectar si es admin
        if (usuarioRol === 'ADMIN') {
            conectarWebSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [usuarioRol]);

    const conectarWebSocket = () => {
        // En lugar de UDP directo, usaremos WebSocket como intermediario
        // El backend necesitará un WebSocket endpoint que transmita las notificaciones UDP

        // Simulación de conexión (en producción, conectar a ws://localhost:8080/ws/notifications)
        console.log('Conectando al sistema de notificaciones...');

        // Simulación de notificaciones cada cierto tiempo para demo
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% de probabilidad cada 10 segundos
                recibirNotificacionSimulada();
            }
        }, 10000);

        setConectado(true);

        return () => clearInterval(interval);
    };

    const recibirNotificacionSimulada = () => {
        const tipos = [
            {
                tipo: 'ASIENTO_BLOQUEADO',
                mensaje: 'Se han bloqueado asientos en una función',
                icon: '🔒',
                color: '#ffc107'
            },
            {
                tipo: 'RESERVA_CREADA',
                mensaje: 'Nueva reserva creada',
                icon: '✅',
                color: '#28a745'
            },
            {
                tipo: 'ASIENTOS_AGOTANDO',
                mensaje: 'Quedan pocos asientos disponibles',
                icon: '⚠️',
                color: '#e74c3c'
            },
            {
                tipo: 'NUEVA_FUNCION',
                mensaje: 'Nueva función agregada',
                icon: '🎬',
                color: '#667eea'
            }
        ];

        const notificacion = tipos[Math.floor(Math.random() * tipos.length)];
        agregarNotificacion({
            ...notificacion,
            id: Date.now(),
            timestamp: new Date(),
            leida: false
        });
    };

    const agregarNotificacion = (notificacion) => {
        setNotificaciones(prev => [notificacion, ...prev].slice(0, 50)); // Máximo 50
        setContadorNoLeidas(prev => prev + 1);

        // Reproducir sonido
        reproducirSonido();

        // Mostrar notificación del navegador
        if (Notification.permission === 'granted') {
            new Notification('NetCinema - Notificación', {
                body: notificacion.mensaje,
                icon: notificacion.icon
            });
        }
    };

    const reproducirSonido = () => {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcJGGS56+agTgwPUqfk77RgGwU7k9n0x3YnBSl+zPLaizsKE1606N+qWhwLRp/h8bllHAU2iNDuypA2CRZitOnsp1IVDTE=');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Error reproduciendo sonido'));
    };

    const marcarComoLeida = (id) => {
        setNotificaciones(prev =>
            prev.map(n => n.id === id ? { ...n, leida: true } : n)
        );
        setContadorNoLeidas(prev => Math.max(0, prev - 1));
    };

    const marcarTodasLeidas = () => {
        setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
        setContadorNoLeidas(0);
    };

    const limpiarNotificaciones = () => {
        setNotificaciones([]);
        setContadorNoLeidas(0);
    };

    const solicitarPermiso = async () => {
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    };

    useEffect(() => {
        solicitarPermiso();
    }, []);

    // No mostrar nada si no es admin
    if (usuarioRol !== 'ADMIN') {
        return null;
    }

    return (
        <>
            {/* Botón flotante */}
            <div style={styles.floatingButton} onClick={() => setMostrarPanel(!mostrarPanel)}>
                <span style={styles.bellIcon}>🔔</span>
                {contadorNoLeidas > 0 && (
                    <span style={styles.badge}>{contadorNoLeidas}</span>
                )}
            </div>

            {/* Panel de notificaciones */}
            {mostrarPanel && (
                <div style={styles.panel}>
                    <div style={styles.panelHeader}>
                        <h3 style={styles.panelTitle}>
                            Notificaciones {conectado && <span style={styles.statusOnline}>🟢</span>}
                        </h3>
                        <div style={styles.headerActions}>
                            {notificaciones.length > 0 && (
                                <>
                                    <button onClick={marcarTodasLeidas} style={styles.headerButton}>
                                        ✓ Marcar todas
                                    </button>
                                    <button onClick={limpiarNotificaciones} style={styles.headerButton}>
                                        🗑️ Limpiar
                                    </button>
                                </>
                            )}
                            <button onClick={() => setMostrarPanel(false)} style={styles.closeButton}>
                                ✕
                            </button>
                        </div>
                    </div>

                    <div style={styles.panelContent}>
                        {notificaciones.length === 0 ? (
                            <div style={styles.emptyState}>
                                <span style={styles.emptyIcon}>🔕</span>
                                <p style={styles.emptyText}>No hay notificaciones</p>
                            </div>
                        ) : (
                            notificaciones.map(notif => (
                                <div
                                    key={notif.id}
                                    style={{
                                        ...styles.notificationItem,
                                        ...(notif.leida ? {} : styles.notificationUnread)
                                    }}
                                    onClick={() => marcarComoLeida(notif.id)}
                                >
                                    <div style={styles.notifIcon}>{notif.icon}</div>
                                    <div style={styles.notifContent}>
                                        <p style={styles.notifMessage}>{notif.mensaje}</p>
                                        <span style={styles.notifTime}>
                      {notif.timestamp.toLocaleTimeString('es-ES')}
                    </span>
                                    </div>
                                    {!notif.leida && <span style={styles.unreadDot}></span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    floatingButton: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
    },
    bellIcon: {
        fontSize: '28px',
    },
    badge: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        backgroundColor: '#e74c3c',
        color: 'white',
        borderRadius: '50%',
        width: '22px',
        height: '22px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '11px',
        fontWeight: 'bold',
    },
    panel: {
        position: 'fixed',
        bottom: '100px',
        right: '30px',
        width: '400px',
        maxHeight: '600px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
    },
    panelHeader: {
        padding: '20px',
        borderBottom: '2px solid #e9ecef',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    panelTitle: {
        margin: 0,
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    statusOnline: {
        fontSize: '12px',
    },
    headerActions: {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
    },
    headerButton: {
        padding: '6px 12px',
        backgroundColor: '#f8f9fa',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer',
        color: '#495057',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        color: '#6c757d',
        padding: '4px 8px',
    },
    panelContent: {
        overflowY: 'auto',
        maxHeight: '500px',
    },
    emptyState: {
        padding: '60px 20px',
        textAlign: 'center',
    },
    emptyIcon: {
        fontSize: '48px',
        display: 'block',
        marginBottom: '12px',
    },
    emptyText: {
        color: '#6c757d',
        fontSize: '14px',
    },
    notificationItem: {
        padding: '16px 20px',
        borderBottom: '1px solid #f1f3f5',
        display: 'flex',
        gap: '12px',
        alignItems: 'start',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        position: 'relative',
    },
    notificationUnread: {
        backgroundColor: '#f0f4ff',
    },
    notifIcon: {
        fontSize: '24px',
        flexShrink: 0,
    },
    notifContent: {
        flex: 1,
    },
    notifMessage: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        color: '#2c3e50',
        fontWeight: '500',
    },
    notifTime: {
        fontSize: '11px',
        color: '#6c757d',
    },
    unreadDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#667eea',
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
    },
};

export default UDPNotifications;