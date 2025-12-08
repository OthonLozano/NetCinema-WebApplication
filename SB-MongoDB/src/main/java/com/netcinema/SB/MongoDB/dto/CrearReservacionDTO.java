package com.netcinema.SB.MongoDB.dto;

import lombok.Data;
import java.util.List;

@Data
public class CrearReservacionDTO {
    private String usuarioId;
    private String funcionId;
    private List<AsientoSeleccionado> asientos;

    @Data
    public static class AsientoSeleccionado {
        private String fila;
        private String numero;
    }
}
