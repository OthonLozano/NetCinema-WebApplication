package com.netcinema.SB.MongoDB.repository;

import com.netcinema.SB.MongoDB.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository; //
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    //buscar por email
    Optional<Usuario> findByEmail(String email);
    //verificar existencia por email
    Boolean existsByEmail(String email);

}