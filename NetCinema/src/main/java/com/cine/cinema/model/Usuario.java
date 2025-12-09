package com.cine.cinema.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    @NotBlank(message = "El username es obligatorio")
    @Indexed(unique = true)
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email debe ser válido")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password; // Se guardará encriptada con BCrypt

    @NotBlank(message = "El rol es obligatorio")
    @Pattern(regexp = "ADMIN|CLIENTE", message = "El rol debe ser ADMIN o CLIENTE")
    private String rol; // ADMIN o CLIENTE

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @Pattern(regexp = "^[0-9]{10}$", message = "El teléfono debe tener 10 dígitos")
    private String telefono;

    private Boolean activo = true;

    private LocalDateTime fechaRegistro = LocalDateTime.now();
}