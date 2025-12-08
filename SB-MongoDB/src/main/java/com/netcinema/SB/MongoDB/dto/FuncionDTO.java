package com.netcinema.SB.MongoDB.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.time.LocalTime;


@Data
@Builder
public class FuncionDTO {
    private String id;
    private String peliculaId;
    private String peliculaTitulo; //para mostrar sin hacer otra consulta
    private String salaId;
    private String salaNombre; //para mostrar sin hacer otra consulta
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String idioma;
    private Double precio;
    private String estado;
    private List<String> asientos;

    @Data
    @Builder
    public static class AsientoDTO {
        private String fila;
        private String numero;
        private Boolean disponible;
    }
}

