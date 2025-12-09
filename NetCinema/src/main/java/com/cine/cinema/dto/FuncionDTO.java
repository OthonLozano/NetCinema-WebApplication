package com.cine.cinema.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FuncionDTO {

    @NotBlank(message = "El ID de la película es obligatorio")
    private String peliculaId;

    @NotBlank(message = "El ID de la sala es obligatorio")
    private String salaId;

    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 1, message = "El precio debe ser mayor a 0")
    private Double precio;
}