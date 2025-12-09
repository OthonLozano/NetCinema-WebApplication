package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.service.PeliculaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/peliculas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PeliculaController {

    private final PeliculaService peliculaService;

    // Crear película
    @PostMapping
    public ResponseEntity<ApiResponse> crearPelicula(@Valid @RequestBody Pelicula pelicula) {
        try {
            Pelicula peliculaCreada = peliculaService.crearPelicula(pelicula);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Película creada exitosamente", peliculaCreada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener todas las películas
    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodas() {
        try {
            List<Pelicula> peliculas = peliculaService.obtenerTodas();
            return ResponseEntity.ok(new ApiResponse(true, "Películas obtenidas", peliculas));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener películas: " + e.getMessage()));
        }
    }

    // Obtener cartelera (películas activas)
    @GetMapping("/cartelera")
    public ResponseEntity<ApiResponse> obtenerCartelera() {
        try {
            List<Pelicula> cartelera = peliculaService.obtenerCartelera();
            return ResponseEntity.ok(new ApiResponse(true, "Cartelera obtenida", cartelera));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener cartelera: " + e.getMessage()));
        }
    }

    // Obtener película por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerPorId(@PathVariable String id) {
        try {
            Pelicula pelicula = peliculaService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Película no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Película encontrada", pelicula));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Buscar películas por título
    @GetMapping("/buscar/titulo/{titulo}")
    public ResponseEntity<ApiResponse> buscarPorTitulo(@PathVariable String titulo) {
        try {
            List<Pelicula> peliculas = peliculaService.buscarPorTitulo(titulo);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Búsqueda completada",
                    peliculas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error en la búsqueda: " + e.getMessage()));
        }
    }

    // Buscar por género
    @GetMapping("/buscar/genero/{genero}")
    public ResponseEntity<ApiResponse> buscarPorGenero(@PathVariable String genero) {
        try {
            List<Pelicula> peliculas = peliculaService.buscarPorGenero(genero);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Películas del género encontradas",
                    peliculas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error en la búsqueda: " + e.getMessage()));
        }
    }

    // Buscar por clasificación
    @GetMapping("/buscar/clasificacion/{clasificacion}")
    public ResponseEntity<ApiResponse> buscarPorClasificacion(@PathVariable String clasificacion) {
        try {
            List<Pelicula> peliculas = peliculaService.buscarPorClasificacion(clasificacion);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Películas con clasificación encontradas",
                    peliculas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error en la búsqueda: " + e.getMessage()));
        }
    }

    // Actualizar película
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarPelicula(
            @PathVariable String id,
            @Valid @RequestBody Pelicula pelicula) {
        try {
            Pelicula peliculaActualizada = peliculaService.actualizarPelicula(id, pelicula);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Película actualizada exitosamente",
                    peliculaActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Desactivar película (soft delete)
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ApiResponse> desactivarPelicula(@PathVariable String id) {
        try {
            peliculaService.desactivarPelicula(id);
            return ResponseEntity.ok(new ApiResponse(true, "Película desactivada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Eliminar película permanentemente
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarPelicula(@PathVariable String id) {
        try {
            peliculaService.eliminarPelicula(id);
            return ResponseEntity.ok(new ApiResponse(true, "Película eliminada permanentemente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}