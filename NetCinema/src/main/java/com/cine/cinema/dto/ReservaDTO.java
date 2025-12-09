package com.cine.cinema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReservaDTO {

    @NotBlank(message = "El ID de la función es obligatorio")
    private String funcionId;

    private String usuarioId; // Opcional, puede ser compra sin registro

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombreCliente;

    @NotBlank(message = "El email del cliente es obligatorio")
    @Email(message = "Email debe ser válido")
    private String emailCliente;

    @NotEmpty(message = "Debe seleccionar al menos un asiento")
    private List<String> asientos;
}