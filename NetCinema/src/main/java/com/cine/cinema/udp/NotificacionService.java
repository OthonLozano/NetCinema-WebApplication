package com.cine.cinema.udp;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificacionService {

    private final UDPServer udpServer;

    // Notificar cuando se bloquean asientos
    public void notificarAsientosBloqueados(String funcionId, List<String> asientos) {
        Map<String, Object> data = new HashMap<>();
        data.put("funcionId", funcionId);
        data.put("asientos", asientos);

        Notificacion notificacion = new Notificacion(
                "ASIENTO_BLOQUEADO",
                "Se han bloqueado " + asientos.size() + " asiento(s)",
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("📢 Notificación enviada: Asientos bloqueados en función {}", funcionId);
    }

    // Notificar cuando se liberan asientos
    public void notificarAsientosLiberados(String funcionId, List<String> asientos) {
        Map<String, Object> data = new HashMap<>();
        data.put("funcionId", funcionId);
        data.put("asientos", asientos);

        Notificacion notificacion = new Notificacion(
                "ASIENTO_LIBERADO",
                "Se han liberado " + asientos.size() + " asiento(s)",
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Asientos liberados en función {}", funcionId);
    }

    // Notificar cuando se crea una reserva
    public void notificarReservaCreada(String reservaId, String codigoReserva) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservaId", reservaId);
        data.put("codigoReserva", codigoReserva);

        Notificacion notificacion = new Notificacion(
                "RESERVA_CREADA",
                "Nueva reserva creada: " + codigoReserva,
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Reserva creada {}", codigoReserva);
    }

    // Notificar cuando se confirma una reserva
    public void notificarReservaConfirmada(String reservaId, String codigoReserva) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservaId", reservaId);
        data.put("codigoReserva", codigoReserva);

        Notificacion notificacion = new Notificacion(
                "RESERVA_CONFIRMADA",
                "Reserva confirmada: " + codigoReserva,
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Reserva confirmada {}", codigoReserva);
    }

    // Notificar cuando se cancela una reserva
    public void notificarReservaCancelada(String reservaId, String codigoReserva) {
        Map<String, Object> data = new HashMap<>();
        data.put("reservaId", reservaId);
        data.put("codigoReserva", codigoReserva);

        Notificacion notificacion = new Notificacion(
                "RESERVA_CANCELADA",
                "Reserva cancelada: " + codigoReserva,
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Reserva cancelada {}", codigoReserva);
    }

    // Notificar cuando se agrega una nueva película
    public void notificarNuevaPelicula(String peliculaId, String titulo) {
        Map<String, Object> data = new HashMap<>();
        data.put("peliculaId", peliculaId);
        data.put("titulo", titulo);

        Notificacion notificacion = new Notificacion(
                "NUEVA_PELICULA",
                "Nueva película en cartelera: " + titulo,
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Nueva película {}", titulo);
    }

    // Notificar cuando se agrega una nueva función
    public void notificarNuevaFuncion(String funcionId, String peliculaTitulo) {
        Map<String, Object> data = new HashMap<>();
        data.put("funcionId", funcionId);
        data.put("peliculaTitulo", peliculaTitulo);

        Notificacion notificacion = new Notificacion(
                "NUEVA_FUNCION",
                "Nueva función disponible: " + peliculaTitulo,
                data
        );

        udpServer.enviarNotificacionBroadcast(notificacion);
        log.info("Notificación enviada: Nueva función {}", peliculaTitulo);
    }

    // Obtener estadísticas
    public int getClientesConectados() {
        return udpServer.getClientesConectados();
    }
}