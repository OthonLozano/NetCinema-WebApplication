package com.netcinema.SB.MongoDB.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReservacionDTO {
    private String id;
    private String usuarioId;
    private String funcionId;
    private String peliiculaTitulo;
    private LocalDateTime fechaReservacion;
    private LocalDateTime fechaExpiracion;
    private List<AsientoReservadoDTO> asientos; // Lista de IDs de asientos reservados
    private Double total;
    private String estado; // Ejemplo: "CONFIRMADA", "CANCELADA"

    @Data
    @Builder
    public static class AsientoReservadoDTO {
        private String fila;
        private String numero;
        private Double precio;
    }
}
