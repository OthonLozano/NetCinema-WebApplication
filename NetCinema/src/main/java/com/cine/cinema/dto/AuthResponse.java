package com.cine.cinema.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String tipo = "Bearer";
    private String username;
    private String rol;
    private String mensaje;

    public AuthResponse(String token, String username, String rol) {
        this.token = token;
        this.username = username;
        this.rol = rol;
        this.mensaje = "Login exitoso";
    }
}