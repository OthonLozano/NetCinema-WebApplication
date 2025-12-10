package com.cine.cinema.udp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {

    private String tipo; // ASIENTO_BLOQUEADO, ASIENTO_LIBERADO, RESERVA_CREADA, etc.
    private String mensaje;
    private Object data; // Información adicional
    private LocalDateTime timestamp;

    public Notificacion(String tipo, String mensaje, Object data) {
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }
}