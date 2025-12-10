package com.cine.cinema.udp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.net.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@Slf4j
public class UDPServer {

    private static final int PUERTO_UDP = 9090;
    private DatagramSocket socket;
    private boolean running = false;
    private ExecutorService executorService;
    private ObjectMapper objectMapper;

    // Mapa de clientes conectados (IP:Puerto -> última actividad)
    private Map<String, Long> clientesConectados = new ConcurrentHashMap<>();

    @PostConstruct
    public void iniciar() {
        try {
            socket = new DatagramSocket(PUERTO_UDP);
            running = true;
            executorService = Executors.newFixedThreadPool(2);

            // Configurar ObjectMapper para serializar LocalDateTime
            objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());

            log.info("Servidor UDP iniciado en puerto {}", PUERTO_UDP);

            // Iniciar hilo para recibir mensajes de clientes
            executorService.submit(this::recibirMensajes);

            // Iniciar hilo de limpieza de clientes inactivos
            executorService.submit(this::limpiarClientesInactivos);

        } catch (Exception e) {
            log.error("Error al iniciar servidor UDP: {}", e.getMessage());
        }
    }

    // Recibir mensajes de clientes (registro, heartbeat)
    private void recibirMensajes() {
        byte[] buffer = new byte[1024];

        while (running) {
            try {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);

                String mensaje = new String(packet.getData(), 0, packet.getLength());
                InetAddress clienteIP = packet.getAddress();
                int clientePuerto = packet.getPort();
                String clienteKey = clienteIP.getHostAddress() + ":" + clientePuerto;

                log.info("Mensaje UDP recibido de {}: {}", clienteKey, mensaje);

                // Registrar cliente o actualizar heartbeat
                if (mensaje.startsWith("REGISTER") || mensaje.startsWith("HEARTBEAT")) {
                    clientesConectados.put(clienteKey, System.currentTimeMillis());
                    log.info("Cliente registrado/actualizado: {} (Total: {})",
                            clienteKey, clientesConectados.size());

                    // Enviar confirmación
                    String respuesta = "OK";
                    enviarMensaje(respuesta, clienteIP, clientePuerto);
                }

            } catch (Exception e) {
                if (running) {
                    log.error("Error al recibir mensaje UDP: {}", e.getMessage());
                }
            }
        }
    }

    // Limpiar clientes inactivos (sin heartbeat por 60 segundos)
    private void limpiarClientesInactivos() {
        while (running) {
            try {
                Thread.sleep(30000); // Cada 30 segundos

                long ahora = System.currentTimeMillis();
                clientesConectados.entrySet().removeIf(entry -> {
                    boolean inactivo = (ahora - entry.getValue()) > 60000; // 60 segundos
                    if (inactivo) {
                        log.info("Cliente inactivo eliminado: {}", entry.getKey());
                    }
                    return inactivo;
                });

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
    }

    // Enviar notificación a un cliente específico
    public void enviarMensaje(String mensaje, InetAddress direccion, int puerto) {
        try {
            byte[] buffer = mensaje.getBytes();
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length, direccion, puerto);
            socket.send(packet);
            log.info("Mensaje UDP enviado a {}:{}", direccion.getHostAddress(), puerto);
        } catch (Exception e) {
            log.error("Error al enviar mensaje UDP: {}", e.getMessage());
        }
    }

    // Broadcast: enviar notificación a todos los clientes conectados
    public void enviarNotificacionBroadcast(Notificacion notificacion) {
        try {
            String json = objectMapper.writeValueAsString(notificacion);
            log.info("📢 Broadcasting notificación: {} a {} clientes",
                    notificacion.getTipo(), clientesConectados.size());

            for (String clienteKey : clientesConectados.keySet()) {
                try {
                    String[] partes = clienteKey.split(":");
                    InetAddress ip = InetAddress.getByName(partes[0]);
                    int puerto = Integer.parseInt(partes[1]);

                    enviarMensaje(json, ip, puerto);
                } catch (Exception e) {
                    log.error("Error al enviar a cliente {}: {}", clienteKey, e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Error al serializar notificación: {}", e.getMessage());
        }
    }

    // Obtener número de clientes conectados
    public int getClientesConectados() {
        return clientesConectados.size();
    }

    @PreDestroy
    public void detener() {
        running = false;
        if (socket != null && !socket.isClosed()) {
            socket.close();
        }
        if (executorService != null) {
            executorService.shutdown();
        }
        log.info("Servidor UDP detenido");
    }
}