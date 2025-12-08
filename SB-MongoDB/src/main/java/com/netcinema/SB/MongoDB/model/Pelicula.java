package com.netcinema.SB.MongoDB.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "peliculas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pelicula {
    @Id
    private String id;

    private String titulo;
    private String sinopsis;
    private Integer duracion; //minutos
    private String clasificacion; // AA, A , B, B15, C, D
    private List<String> genero;
    private String director;
    private List<String> reparto;
    private String posterUrl;
    private String trailerUrl;
    private LocalDate fechaEstreno;

    @Builder.Default
    private boolean activa = true;

}
