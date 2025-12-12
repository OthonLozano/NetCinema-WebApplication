package com.cine.cinema.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "peliculas")
public class Pelicula {

    @Id
    private String id;

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotEmpty(message = "Debe tener al menos un género")
    private List<String> generos; // Ej: ["Acción", "Aventura"]

    @Min(value = 1, message = "La duración debe ser mayor a 0")
    private Integer duracion; // En minutos

    @NotBlank(message = "La clasificación es obligatoria")
    private String clasificacion; // AA, A, B, B15, C, D

    @NotBlank(message = "El director es obligatorio")
    private String director;

    @NotEmpty(message = "Debe tener al menos un actor")
    private List<String> actores;

    private String posterUrl; // URL del póster
    private String trailerUrl; // URL del trailer

    private Boolean activa = true;
}