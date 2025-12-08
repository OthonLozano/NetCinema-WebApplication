package com.netcinema.SB.MongoDB.dto;

import lombok.Builder;
import lombok.Data;

public class SalaDTO {
    private String id;
    private String nombre;
    private Integer capacidad;
    private Integer filas;
    private Integer columnas;
    private Boolean activa;
}
