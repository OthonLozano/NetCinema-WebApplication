package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.model.Sala;
import com.cine.cinema.service.SalaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalaController {

    private final SalaService salaService;

    // Crear sala
    @PostMapping
    public ResponseEntity<ApiResponse> crearSala(@Valid @RequestBody Sala sala) {
        try {
            Sala salaCreada = salaService.crearSala(sala);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Sala creada exitosamente", salaCreada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener todas las salas
    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodas() {
        try {
            List<Sala> salas = salaService.obtenerTodas();
            return ResponseEntity.ok(new ApiResponse(true, "Salas obtenidas", salas));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener salas: " + e.getMessage()));
        }
    }

    // Obtener salas activas
    @GetMapping("/activas")
    public ResponseEntity<ApiResponse> obtenerActivas() {
        try {
            List<Sala> salas = salaService.obtenerActivas();
            return ResponseEntity.ok(new ApiResponse(true, "Salas activas obtenidas", salas));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener salas: " + e.getMessage()));
        }
    }

    // Obtener sala por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerPorId(@PathVariable String id) {
        try {
            Sala sala = salaService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Sala encontrada", sala));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener sala por nombre
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<ApiResponse> obtenerPorNombre(@PathVariable String nombre) {
        try {
            Sala sala = salaService.obtenerPorNombre(nombre)
                    .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Sala encontrada", sala));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Buscar por tipo
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<ApiResponse> buscarPorTipo(@PathVariable String tipo) {
        try {
            List<Sala> salas = salaService.buscarPorTipo(tipo);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Salas del tipo encontradas",
                    salas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error en la búsqueda: " + e.getMessage()));
        }
    }

    // Actualizar sala
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarSala(
            @PathVariable String id,
            @Valid @RequestBody Sala sala) {
        try {
            Sala salaActualizada = salaService.actualizarSala(id, sala);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Sala actualizada exitosamente",
                    salaActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Desactivar sala (soft delete)
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ApiResponse> desactivarSala(@PathVariable String id) {
        try {
            salaService.desactivarSala(id);
            return ResponseEntity.ok(new ApiResponse(true, "Sala desactivada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Eliminar sala permanentemente
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarSala(@PathVariable String id) {
        try {
            salaService.eliminarSala(id);
            return ResponseEntity.ok(new ApiResponse(true, "Sala eliminada permanentemente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}