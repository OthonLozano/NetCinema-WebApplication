package com.netcinema.SB.MongoDB.controller;

import com.netcinema.SB.MongoDB.model.Pelicula;
import com.netcinema.SB.MongoDB.service.PeliculaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController//indica que esta clase es un controlador REST
@RequestMapping("/api/peliculas")//ruta base para todas las solicitudes
@CrossOrigin(origins="*") //permite solicitudes desde cualquier origen
public class PeliculaController {
    @Autowired
    private PeliculaService peliculaService;


    @GetMapping
    public ResponseEntity<List<Pelicula>> obtenerTodas() { //solo las activas
        return ResponseEntity.ok(peliculaService.obtenerActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            Pelicula pelicula = peliculaService.obtenerPorId(id);
            return ResponseEntity.ok(pelicula);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Pelicula>> buscarPorTitulo(@RequestParam String titulo) {
        return ResponseEntity.ok(peliculaService.buscarPorTitulo(titulo));
    }

    @GetMapping("/genero/{genero}")
    public ResponseEntity<List<Pelicula>> filtrarPorGenero(@PathVariable String genero) {
        return ResponseEntity.ok(peliculaService.filtrarPorGenero(genero));
    }

}
