package com.cine.cinema.udp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Scanner;

/**
 * Cliente UDP de prueba para recibir notificaciones del servidor
 * Este cliente NO es parte de Spring Boot, se ejecuta independientemente
 */
public class UDPClienteTest {

    private static final String SERVIDOR_HOST = "localhost";
    private static final int SERVIDOR_PUERTO = 9090;
    private static DatagramSocket socket;
    private static ObjectMapper objectMapper;

    public static void main(String[] args) {
        try {
            System.out.println("==============================================");
            System.out.println("   🎬 Cliente UDP NetCinema - Modo Prueba");
            System.out.println("==============================================");
            System.out.println();

            // Crear socket UDP
            socket = new DatagramSocket();
            objectMapper = new ObjectMapper();
            objectMapper.registerModule(new JavaTimeModule());

            InetAddress servidorIP = InetAddress.getByName(SERVIDOR_HOST);

            // Registrarse en el servidor
            System.out.println("📡 Conectando al servidor UDP en " + SERVIDOR_HOST + ":" + SERVIDOR_PUERTO);
            enviarMensaje("REGISTER", servidorIP, SERVIDOR_PUERTO);

            System.out.println("✅ Registro enviado. Esperando confirmación...");

            // Esperar confirmación
            byte[] buffer = new byte[1024];
            DatagramPacket respuesta = new DatagramPacket(buffer, buffer.length);
            socket.setSoTimeout(5000); // 5 segundos timeout

            try {
                socket.receive(respuesta);
                String confirmacion = new String(respuesta.getData(), 0, respuesta.getLength());
                System.out.println("✅ Servidor responde: " + confirmacion);
            } catch (Exception e) {
                System.out.println("⚠️ No se recibió confirmación (timeout). Continuando...");
            }

            System.out.println();
            System.out.println("==============================================");
            System.out.println("✅ Cliente conectado correctamente!");
            System.out.println("📥 Escuchando notificaciones...");
            System.out.println("==============================================");
            System.out.println();

            // Iniciar hilo para enviar heartbeat
            Thread heartbeatThread = new Thread(() -> enviarHeartbeat(servidorIP, SERVIDOR_PUERTO));
            heartbeatThread.setDaemon(true);
            heartbeatThread.start();

            // Iniciar hilo para recibir notificaciones
            Thread receptorThread = new Thread(() -> recibirNotificaciones());
            receptorThread.setDaemon(true);
            receptorThread.start();

            // Mantener el programa corriendo
            System.out.println("💡 Presiona ENTER para desconectar...");
            new Scanner(System.in).nextLine();

            System.out.println("\n👋 Desconectando...");
            socket.close();

        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Enviar mensaje al servidor
    private static void enviarMensaje(String mensaje, InetAddress ip, int puerto) {
        try {
            byte[] buffer = mensaje.getBytes();
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length, ip, puerto);
            socket.send(packet);
        } catch (Exception e) {
            System.err.println("❌ Error al enviar mensaje: " + e.getMessage());
        }
    }

    // Enviar heartbeat cada 30 segundos
    private static void enviarHeartbeat(InetAddress ip, int puerto) {
        while (!socket.isClosed()) {
            try {
                Thread.sleep(30000); // 30 segundos
                enviarMensaje("HEARTBEAT", ip, puerto);
                System.out.println("💓 Heartbeat enviado");
            } catch (InterruptedException e) {
                break;
            }
        }
    }

    // Recibir notificaciones
    private static void recibirNotificaciones() {
        byte[] buffer = new byte[4096];

        while (!socket.isClosed()) {
            try {
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.setSoTimeout(0); // Sin timeout
                socket.receive(packet);

                String mensaje = new String(packet.getData(), 0, packet.getLength());

                // Ignorar respuestas simples
                if (mensaje.equals("OK")) {
                    continue;
                }

                // Intentar parsear como JSON (notificación)
                try {
                    Notificacion notificacion = objectMapper.readValue(mensaje, Notificacion.class);
                    mostrarNotificacion(notificacion);
                } catch (Exception e) {
                    // Si no es JSON, mostrar como texto plano
                    System.out.println("📥 Mensaje: " + mensaje);
                }

            } catch (Exception e) {
                if (!socket.isClosed()) {
                    System.err.println("❌ Error al recibir: " + e.getMessage());
                }
            }
        }
    }

    // Mostrar notificación formateada
    private static void mostrarNotificacion(Notificacion notificacion) {
        System.out.println();
        System.out.println("╔════════════════════════════════════════════");
        System.out.println("║ 🔔 NOTIFICACIÓN RECIBIDA");
        System.out.println("╠════════════════════════════════════════════");
        System.out.println("║ Tipo:     " + notificacion.getTipo());
        System.out.println("║ Mensaje:  " + notificacion.getMensaje());
        System.out.println("║ Hora:     " + notificacion.getTimestamp());

        if (notificacion.getData() != null) {
            System.out.println("║ Datos:    " + notificacion.getData());
        }

        System.out.println("╚════════════════════════════════════════════");
        System.out.println();
    }
}