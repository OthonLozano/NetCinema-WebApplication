package com.netcinema.SB.MongoDB.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="salas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sala {
    @Id
    private String id;

    private Integer numeroSala;
    private String nombre;
    private String capacidad;
    private String tipoSala; //2d,3d,imax,vip
    private ConfiguracionAsientos configuracionAsientos;

    @Builder.Default
    private boolean activa = true;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConfiguracionAsientos {
        private Integer filas;
        private Integer columnas;

    }
}
