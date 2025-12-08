package com.netcinema.SB.MongoDB.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioDTO {
    private String id;
    private String nombre;
    private String email;
}
