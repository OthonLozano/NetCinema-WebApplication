package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.dto.FuncionDTO;
import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.model.Sala;
import com.cine.cinema.service.FuncionService;
import com.cine.cinema.udp.NotificacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/funciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FuncionController {

    private final FuncionService funcionService;
    private final NotificacionService notificacionService; // NotificacionService

    // Crear función
    @PostMapping
    public ResponseEntity<ApiResponse> crearFuncion(@Valid @RequestBody FuncionDTO funcionDTO) {
        try {
            Funcion funcion = new Funcion();

            Pelicula pelicula = new Pelicula();
            pelicula.setId(funcionDTO.getPeliculaId());
            funcion.setPelicula(pelicula);

            Sala sala = new Sala();
            sala.setId(funcionDTO.getSalaId());
            funcion.setSala(sala);

            funcion.setFechaHora(funcionDTO.getFechaHora());
            funcion.setPrecio(funcionDTO.getPrecio());

            Funcion funcionCreada = funcionService.crearFuncion(funcion);

            // Enviar notificación UDP
            notificacionService.notificarNuevaFuncion(
                    funcionCreada.getId(),
                    funcionCreada.getPelicula().getTitulo()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Función creada exitosamente", funcionCreada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodas() {
        try {
            List<Funcion> funciones = funcionService.obtenerTodas();
            return ResponseEntity.ok(new ApiResponse(true, "Funciones obtenidas", funciones));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener funciones: " + e.getMessage()));
        }
    }

    @GetMapping("/activas")
    public ResponseEntity<ApiResponse> obtenerActivas() {
        try {
            List<Funcion> funciones = funcionService.obtenerActivas();
            return ResponseEntity.ok(new ApiResponse(true, "Funciones activas obtenidas", funciones));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener funciones: " + e.getMessage()));
        }
    }

    @GetMapping("/futuras")
    public ResponseEntity<ApiResponse> obtenerFuturas() {
        try {
            List<Funcion> funciones = funcionService.obtenerFuturas();
            return ResponseEntity.ok(new ApiResponse(true, "Funciones futuras obtenidas", funciones));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener funciones: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerPorId(@PathVariable String id) {
        try {
            Funcion funcion = funcionService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Función no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Función encontrada", funcion));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @GetMapping("/pelicula/{peliculaId}")
    public ResponseEntity<ApiResponse> obtenerPorPelicula(@PathVariable String peliculaId) {
        try {
            List<Funcion> funciones = funcionService.obtenerPorPelicula(peliculaId);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Funciones de la película obtenidas",
                    funciones
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener funciones: " + e.getMessage()));
        }
    }

    @GetMapping("/sala/{salaId}")
    public ResponseEntity<ApiResponse> obtenerPorSala(@PathVariable String salaId) {
        try {
            List<Funcion> funciones = funcionService.obtenerPorSala(salaId);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Funciones de la sala obtenidas",
                    funciones
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener funciones: " + e.getMessage()));
        }
    }

    // Bloquear asientos
    @PostMapping("/{id}/bloquear-asientos")
    public ResponseEntity<ApiResponse> bloquearAsientos(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> asientos = request.get("asientos");
            Funcion funcionActualizada = funcionService.bloquearAsientos(id, asientos);

            // Enviar notificación UDP
            notificacionService.notificarAsientosBloqueados(id, asientos);

            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Asientos bloqueados exitosamente",
                    funcionActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Liberar asientos
    @PostMapping("/{id}/liberar-asientos")
    public ResponseEntity<ApiResponse> liberarAsientos(
            @PathVariable String id,
            @RequestBody Map<String, List<String>> request) {
        try {
            List<String> asientos = request.get("asientos");
            Funcion funcionActualizada = funcionService.liberarAsientos(id, asientos);

            // Enviar notificación UDP
            notificacionService.notificarAsientosLiberados(id, asientos);

            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Asientos liberados exitosamente",
                    funcionActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarFuncion(
            @PathVariable String id,
            @Valid @RequestBody FuncionDTO funcionDTO) {
        try {
            Funcion funcion = new Funcion();

            Pelicula pelicula = new Pelicula();
            pelicula.setId(funcionDTO.getPeliculaId());
            funcion.setPelicula(pelicula);

            Sala sala = new Sala();
            sala.setId(funcionDTO.getSalaId());
            funcion.setSala(sala);

            funcion.setFechaHora(funcionDTO.getFechaHora());
            funcion.setPrecio(funcionDTO.getPrecio());

            Funcion funcionActualizada = funcionService.actualizarFuncion(id, funcion);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Función actualizada exitosamente",
                    funcionActualizada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<ApiResponse> desactivarFuncion(@PathVariable String id) {
        try {
            funcionService.desactivarFuncion(id);
            return ResponseEntity.ok(new ApiResponse(true, "Función desactivada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarFuncion(@PathVariable String id) {
        try {
            funcionService.eliminarFuncion(id);
            return ResponseEntity.ok(new ApiResponse(true, "Función eliminada permanentemente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}