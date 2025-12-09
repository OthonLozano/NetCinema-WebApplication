package com.cine.cinema.repository;

import com.cine.cinema.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    // Métodos personalizados (Spring los implementa automáticamente)
    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}