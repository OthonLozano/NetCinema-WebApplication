package com.cine.cinema.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Handler simple para notificaciones en tiempo real
 * Gestiona múltiples dispositivos conectados
 */
@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    // Mapa de sesiones activas: sessionId -> WebSocketSession
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    // Mapa de usuarios conectados: userId -> sessionId
    private final ConcurrentHashMap<String, String> userSessions = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Se ejecuta cuando un dispositivo se conecta
     */
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        sessions.put(sessionId, session);

        System.out.println("🔌 Dispositivo conectado: " + sessionId);
        System.out.println("📱 Total dispositivos: " + sessions.size());

        // Enviar confirmación de conexión
        enviarMensaje(session, "CONNECTED", Map.of(
                "sessionId", sessionId,
                "mensaje", "Conectado exitosamente"
        ));
    }

    /**
     * Se ejecuta cuando se recibe un mensaje del dispositivo
     */
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> data = objectMapper.readValue(payload, Map.class);
            String tipo = (String) data.get("tipo");

            switch (tipo) {
                case "REGISTER":
                    // Registrar usuario con su sesión
                    String userId = (String) data.get("userId");
                    registrarUsuario(session.getId(), userId);
                    break;

                case "PING":
                    // Responder a ping
                    enviarMensaje(session, "PONG", Map.of("timestamp", System.currentTimeMillis()));
                    break;

                default:
                    System.out.println("📨 Mensaje recibido: " + tipo);
            }

        } catch (Exception e) {
            System.err.println("Error al procesar mensaje: " + e.getMessage());
        }
    }

    /**
     * Se ejecuta cuando un dispositivo se desconecta
     */
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        sessions.remove(sessionId);

        // Remover de userSessions
        userSessions.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));

        System.out.println("❌ Dispositivo desconectado: " + sessionId);
        System.out.println("📱 Total dispositivos: " + sessions.size());
    }

    /**
     * Registra un usuario con su sesión
     */
    private void registrarUsuario(String sessionId, String userId) {
        userSessions.put(userId, sessionId);
        System.out.println("👤 Usuario registrado: " + userId);
    }

    /**
     * Envía un mensaje a una sesión específica
     */
    private void enviarMensaje(WebSocketSession session, String tipo, Map<String, Object> data) {
        try {
            Map<String, Object> mensaje = Map.of(
                    "tipo", tipo,
                    "data", data,
                    "timestamp", System.currentTimeMillis()
            );

            String json = objectMapper.writeValueAsString(mensaje);
            session.sendMessage(new TextMessage(json));

        } catch (IOException e) {
            System.err.println("Error al enviar mensaje: " + e.getMessage());
        }
    }

    /**
     * Envía notificación a un usuario específico
     */
    public void notificarUsuario(String userId, String tipo, Map<String, Object> data) {
        String sessionId = userSessions.get(userId);
        if (sessionId != null) {
            WebSocketSession session = sessions.get(sessionId);
            if (session != null && session.isOpen()) {
                enviarMensaje(session, tipo, data);
            }
        }
    }

    /**
     * Envía notificación a TODOS los dispositivos conectados
     */
    public void notificarATodos(String tipo, Map<String, Object> data) {
        sessions.values().forEach(session -> {
            if (session.isOpen()) {
                enviarMensaje(session, tipo, data);
            }
        });
    }

    /**
     * Obtiene el número de dispositivos conectados
     */
    public int getDispositivosConectados() {
        return sessions.size();
    }
}