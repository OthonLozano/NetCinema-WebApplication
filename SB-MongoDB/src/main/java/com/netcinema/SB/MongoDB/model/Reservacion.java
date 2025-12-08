package com.netcinema.SB.MongoDB.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;


@Document(collection = "reservaciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reservacion {
    @Id
    private String id;

    private String funcionId;
    private String usuarioId;
    private List<AsientoReservado> asientos;

    @Builder.Default
    private String estado = "RESERVADO"; //RESERVADO/ PAGADO/ LIBERADO /EXPIRADO

    private LocalDateTime fechaReservacion;
    private LocalDateTime fechaExpiracion; //10 min despues

    private Double total;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AsientoReservado {
        private String fila;
        private String numero;
        private Double precio;
    }
}
