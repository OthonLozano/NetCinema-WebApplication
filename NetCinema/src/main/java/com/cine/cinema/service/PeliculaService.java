package com.cine.cinema.service;

import com.cine.cinema.model.Pelicula;
import com.cine.cinema.repository.PeliculaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;

    // Crear película
    public Pelicula crearPelicula(Pelicula pelicula) {
        return peliculaRepository.save(pelicula);
    }

    // Obtener todas las películas
    public List<Pelicula> obtenerTodas() {
        return peliculaRepository.findAll();
    }

    // Obtener películas activas (cartelera)
    public List<Pelicula> obtenerCartelera() {
        return peliculaRepository.findByActivaTrue();
    }

    // Obtener película por ID
    public Optional<Pelicula> obtenerPorId(String id) {
        return peliculaRepository.findById(id);
    }

    // Buscar películas por título
    public List<Pelicula> buscarPorTitulo(String titulo) {
        return peliculaRepository.findByTituloContainingIgnoreCase(titulo);
    }

    // Buscar por género
    public List<Pelicula> buscarPorGenero(String genero) {
        return peliculaRepository.findByGenerosContaining(genero);
    }

    // Buscar por clasificación
    public List<Pelicula> buscarPorClasificacion(String clasificacion) {
        return peliculaRepository.findByClasificacion(clasificacion);
    }

    // Actualizar película
    public Pelicula actualizarPelicula(String id, Pelicula peliculaActualizada) {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Película no encontrada"));

        pelicula.setTitulo(peliculaActualizada.getTitulo());
        pelicula.setDescripcion(peliculaActualizada.getDescripcion());
        pelicula.setGeneros(peliculaActualizada.getGeneros());
        pelicula.setDuracion(peliculaActualizada.getDuracion());
        pelicula.setClasificacion(peliculaActualizada.getClasificacion());
        pelicula.setDirector(peliculaActualizada.getDirector());
        pelicula.setActores(peliculaActualizada.getActores());
        pelicula.setPosterUrl(peliculaActualizada.getPosterUrl());
        pelicula.setActiva(peliculaActualizada.getActiva());

        return peliculaRepository.save(pelicula);
    }

    // Desactivar película (soft delete)
    public void desactivarPelicula(String id) {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Película no encontrada"));

        pelicula.setActiva(false);
        peliculaRepository.save(pelicula);
    }

    // Eliminar película permanentemente
    public void eliminarPelicula(String id) {
        peliculaRepository.deleteById(id);
    }
}