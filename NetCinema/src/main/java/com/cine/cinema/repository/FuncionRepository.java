package com.cine.cinema.repository;

import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.model.Sala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FuncionRepository extends MongoRepository<Funcion, String> {

    // Buscar funciones activas
    List<Funcion> findByActivaTrue();

    // Buscar por película
    List<Funcion> findByPelicula(Pelicula pelicula);

    // Buscar por sala
    List<Funcion> findBySala(Sala sala);

    // Buscar funciones futuras
    List<Funcion> findByFechaHoraAfter(LocalDateTime fecha);

    // Buscar funciones de una película activas y futuras
    List<Funcion> findByPeliculaAndActivaTrueAndFechaHoraAfter(
            Pelicula pelicula,
            LocalDateTime fecha
    );

    // Buscar funciones en un rango de fechas
    List<Funcion> findByFechaHoraBetween(
            LocalDateTime inicio,
            LocalDateTime fin
    );

    // Buscar funciones de una sala en un rango de fechas (para evitar conflictos)
    List<Funcion> findBySalaAndFechaHoraBetween(
            Sala sala,
            LocalDateTime inicio,
            LocalDateTime fin
    );
}