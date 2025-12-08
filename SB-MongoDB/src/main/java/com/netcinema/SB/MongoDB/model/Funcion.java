package com.netcinema.SB.MongoDB.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Document(collection="funciones")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Funcion {
    @Id
    private String id;

    private String peliculaId;
    private String salaId;
    private LocalDate fecha;
    private LocalTime hora;
    private Double precioBase;
    private String idioma;
    private String formato; // 2d,3d,imax
    private String subtitulos;

    private Integer asientosDisponibles;

    @Builder.Default
    private List<Asiento> asientosOcupados= new ArrayList<>();

    @Builder.Default
    private String estado ="PROGRAMADA"; //PROGRAMADA /EN_CURSO/FINALIZADA

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Asiento {
        private String fila;
        private String columna;
    }
}
