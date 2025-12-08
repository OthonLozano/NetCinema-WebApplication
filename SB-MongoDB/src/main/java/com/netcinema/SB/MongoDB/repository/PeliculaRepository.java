package com.netcinema.SB.MongoDB.repository;

import com.netcinema.SB.MongoDB.model.Pelicula;
import com.netcinema.SB.MongoDB.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PeliculaRepository extends MongoRepository<Pelicula, String> {
    //buscae activas
    List<Pelicula> findByActivaTrue();
    //Busqueda parcial por genero
    List<Pelicula> findByGeneroContainingIgnoreCase(String genero);

    //Busqueda parcial por titulo
    List<Pelicula> findByTituloContainingIgnoreCase(String titulo);
}
