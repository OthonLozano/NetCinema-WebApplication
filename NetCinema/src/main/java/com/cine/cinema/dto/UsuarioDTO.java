package com.cine.cinema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UsuarioDTO {

    @NotBlank(message = "El username es obligatorio")
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email debe ser válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "ADMIN|CLIENTE", message = "El rol debe ser ADMIN o CLIENTE")
    private String rol;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos")
    private String telefono;
}