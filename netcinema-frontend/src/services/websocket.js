
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Conectar al WebSocket del backend
     * Llamar esto después del login exitoso
     */
    connect(userId) {
        // Detectar si estamos en producción o desarrollo
        const host = window.location.hostname;
        const port = window.location.port || '8080';
        const wsUrl = `ws://${host}:${port}/ws/notifications`;

        console.log('Conectando a WebSocket:', wsUrl);

        try {
            this.socket = new WebSocket(wsUrl);

            // Cuando se conecta
            this.socket.onopen = () => {
                console.log('WebSocket conectado');
                this.connected = true;
                this.reconnectAttempts = 0;

                // Registrar usuario
                this.send({
                    tipo: 'REGISTER',
                    userId: userId
                });
            };

            // Cuando recibe un mensaje
            this.socket.onmessage = (event) => {
                try {
                    const mensaje = JSON.parse(event.data);
                    this.handleMessage(mensaje);
                } catch (error) {
                    console.error('Error al parsear mensaje:', error);
                }
            };

            // Cuando se desconecta
            this.socket.onclose = () => {
                console.log('WebSocket desconectado');
                this.connected = false;
                this.attemptReconnect(userId);
            };

            // Cuando hay un error
            this.socket.onerror = (error) => {
                console.error('Error WebSocket:', error);
            };

        } catch (error) {
            console.error('Error al conectar WebSocket:', error);
        }
    }

    /**
     * Intenta reconectar automáticamente
     */
    attemptReconnect(userId) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reintentando conexión (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

            setTimeout(() => {
                this.connect(userId);
            }, 3000);
        }
    }

    /**
     * Maneja los mensajes recibidos del servidor
     */
    handleMessage(mensaje) {
        const { tipo, data } = mensaje;

        console.log('Mensaje recibido:', tipo, data);

        switch (tipo) {
            case 'CONNECTED':
                console.log( data.mensaje);
                break;

            case 'NUEVA_RESERVA':
                this.mostrarNotificacion('Nueva Reserva', data.mensaje);
                // Aquí puedes actualizar tu UI
                this.actualizarListaReservas();
                break;

            case 'RESERVA_CANCELADA':
                this.mostrarNotificacion('Reserva Cancelada', data.mensaje);
                this.actualizarListaReservas();
                break;

            case 'RESERVA_CONFIRMADA':
                this.mostrarNotificacion('¡Confirmada!', data.mensaje);
                break;

            case 'PONG':
                console.log('Pong recibido');
                break;

            default:
                console.log('Mensaje no manejado:', tipo);
        }
    }

    /**
     * Envía un mensaje al servidor
     */
    send(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        }
    }

    /**
     * Muestra una notificación en pantalla
     */
    mostrarNotificacion(titulo, mensaje) {
        // Opción 1: Usar notificaciones del navegador
        if (Notification.permission === 'granted') {
            new Notification(titulo, {
                body: mensaje,
                icon: '/logo.png'
            });
        }

        // Opción 2: Usar tu sistema de notificaciones existente
        // Por ejemplo, si usas toast notifications:
        // toast.success(mensaje);

        // Opción 3: Simplemente un alert (para testing)
        console.log(`🔔 ${titulo}: ${mensaje}`);
    }

    /**
     * Actualiza la lista de reservas (llama a tu función existente)
     */
    actualizarListaReservas() {


        console.log('Actualizando lista de reservas...');
    }

    /**
     * Desconectar
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.connected = false;
        }
    }

    /**
     * Verifica si está conectado
     */
    isConnected() {
        return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

// Crear instancia global
const websocketManager = new WebSocketManager();

export default websocketManager;
