package com.netcinema.SB.MongoDB.dto;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class PeliculaDTO {
    private String id;
    private String titulo;
    private String sinopsis;
    private String genero;
    private Integer duracion; // en minutos
    private String clasificacion;
    private String posterUrl;
    private Boolean enCartelera;
    private String director;
}
