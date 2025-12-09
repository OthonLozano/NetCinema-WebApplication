package com.cine.cinema.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "salas")
public class Sala {

    @Id
    private String id;

    @NotBlank(message = "El nombre es obligatorio")
    @Indexed(unique = true)
    private String nombre; // Ej: "Sala 1", "Sala VIP A"

    @NotBlank(message = "El tipo es obligatorio")
    @Pattern(regexp = "2D|3D|IMAX|VIP", message = "El tipo debe ser 2D, 3D, IMAX o VIP")
    private String tipo;

    @Min(value = 1, message = "Debe tener al menos 1 fila")
    private Integer filas;

    @Min(value = 1, message = "Debe tener al menos 1 columna")
    private Integer columnas;

    private Integer capacidad; // filas * columnas

    private Boolean activa = true;

    // Método para calcular capacidad automáticamente
    public void calcularCapacidad() {
        this.capacidad = this.filas * this.columnas;
    }
}