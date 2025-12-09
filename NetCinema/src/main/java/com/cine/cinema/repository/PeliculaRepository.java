package com.cine.cinema.repository;

import com.cine.cinema.model.Pelicula;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeliculaRepository extends MongoRepository<Pelicula, String> {

    // Buscar películas activas
    List<Pelicula> findByActivaTrue();

    // Buscar por título (case insensitive)
    List<Pelicula> findByTituloContainingIgnoreCase(String titulo);

    // Buscar por género
    List<Pelicula> findByGenerosContaining(String genero);

    // Buscar por clasificación
    List<Pelicula> findByClasificacion(String clasificacion);
}