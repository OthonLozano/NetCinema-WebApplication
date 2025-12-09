package com.cine.cinema.repository;

import com.cine.cinema.model.Sala;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends MongoRepository<Sala, String> {

    // Buscar salas activas
    List<Sala> findByActivaTrue();

    // Buscar por nombre
    Optional<Sala> findByNombre(String nombre);

    // Buscar por tipo
    List<Sala> findByTipo(String tipo);

    // Verificar si existe por nombre
    boolean existsByNombre(String nombre);
}