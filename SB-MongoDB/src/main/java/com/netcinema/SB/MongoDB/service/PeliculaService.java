package com.netcinema.SB.MongoDB.service;

import com.netcinema.SB.MongoDB.repository.PeliculaRepository;
import com.netcinema.SB.MongoDB.model.Pelicula;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

@Service
public class PeliculaService {

    @Autowired
    private PeliculaRepository peliculaRepository;

    //obtener todas las peliculas
    public List<Pelicula> obtenerTodas(){
        return peliculaRepository.findAll();
    }

    //obtener las activas
    public List<Pelicula> obtenerActivas(){
        return peliculaRepository.findByActivaTrue();
    }

    //obtener por id
    public Pelicula obtenerPorId(String id) {
        return peliculaRepository.findById(id).orElseThrow(() -> new RuntimeException("Pelicula no encontrada"));
    }

    //buscar por titulo (busqueda parcial)
    public List<Pelicula> buscarPorTitulo(String titulo) {
        return peliculaRepository.findByTituloContainingIgnoreCase(titulo);
    }

    //filtrar por genero (busqueda parcial)
    public List<Pelicula> filtrarPorGenero(String genero) {
        return peliculaRepository.findByGeneroContainingIgnoreCase(genero);
    }

    //obtener pelicula en cartelera con funciones activas
    public List<Pelicula> obtenerEnCartelera() {
        // Suponiendo que las peliculas en cartelera son las activas
        return peliculaRepository.findByActivaTrue();
    }

    //crear pelicula
    public Pelicula crear(Pelicula pelicula) {
        return peliculaRepository.save(pelicula);
    }

    //Actualizar pelicula
    public Pelicula actualizar(String id, Pelicula pelicula) {
        if(!peliculaRepository.existsById(id)) {
            throw new RuntimeException("Pelicula no encontrada");
        }
        pelicula.setId(id);
        return peliculaRepository.save(pelicula);
    }
}
