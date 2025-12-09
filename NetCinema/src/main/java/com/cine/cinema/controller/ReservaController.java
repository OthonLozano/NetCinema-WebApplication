package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.dto.ReservaDTO;
import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Reserva;
import com.cine.cinema.model.Usuario;
import com.cine.cinema.service.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReservaController {

    private final ReservaService reservaService;

    // Crear reserva
    @PostMapping
    public ResponseEntity<ApiResponse> crearReserva(@Valid @RequestBody ReservaDTO reservaDTO) {
        try {
            Reserva reserva = new Reserva();

            // Crear referencia a función
            Funcion funcion = new Funcion();
            funcion.setId(reservaDTO.getFuncionId());
            reserva.setFuncion(funcion);

            // Si hay usuario, crear referencia
            if (reservaDTO.getUsuarioId() != null && !reservaDTO.getUsuarioId().isEmpty()) {
                Usuario usuario = new Usuario();
                usuario.setId(reservaDTO.getUsuarioId());
                reserva.setUsuario(usuario);
            }

            reserva.setNombreCliente(reservaDTO.getNombreCliente());
            reserva.setEmailCliente(reservaDTO.getEmailCliente());
            reserva.setAsientos(reservaDTO.getAsientos());

            Reserva reservaCreada = reservaService.crearReserva(reserva);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Reserva creada exitosamente", reservaCreada));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Confirmar reserva (después del pago)
    @PostMapping("/{id}/confirmar")
    public ResponseEntity<ApiResponse> confirmarReserva(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String metodoPago = request.get("metodoPago");
            Reserva reservaConfirmada = reservaService.confirmarReserva(id, metodoPago);

            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Reserva confirmada exitosamente",
                    reservaConfirmada
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Cancelar reserva
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<ApiResponse> cancelarReserva(@PathVariable String id) {
        try {
            reservaService.cancelarReserva(id);
            return ResponseEntity.ok(new ApiResponse(true, "Reserva cancelada exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener todas las reservas
    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodas() {
        try {
            List<Reserva> reservas = reservaService.obtenerTodas();
            return ResponseEntity.ok(new ApiResponse(true, "Reservas obtenidas", reservas));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener reservas: " + e.getMessage()));
        }
    }

    // Obtener reserva por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerPorId(@PathVariable String id) {
        try {
            Reserva reserva = reservaService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Reserva encontrada", reserva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener reserva por código
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse> obtenerPorCodigo(@PathVariable String codigo) {
        try {
            Reserva reserva = reservaService.obtenerPorCodigo(codigo)
                    .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

            return ResponseEntity.ok(new ApiResponse(true, "Reserva encontrada", reserva));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener reservas por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponse> obtenerPorUsuario(@PathVariable String usuarioId) {
        try {
            List<Reserva> reservas = reservaService.obtenerPorUsuario(usuarioId);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Reservas del usuario obtenidas",
                    reservas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener reservas: " + e.getMessage()));
        }
    }

    // Obtener reservas por email
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse> obtenerPorEmail(@PathVariable String email) {
        try {
            List<Reserva> reservas = reservaService.obtenerPorEmail(email);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Reservas del email obtenidas",
                    reservas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener reservas: " + e.getMessage()));
        }
    }

    // Obtener reservas por función
    @GetMapping("/funcion/{funcionId}")
    public ResponseEntity<ApiResponse> obtenerPorFuncion(@PathVariable String funcionId) {
        try {
            List<Reserva> reservas = reservaService.obtenerPorFuncion(funcionId);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Reservas de la función obtenidas",
                    reservas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener reservas: " + e.getMessage()));
        }
    }

    // Obtener reservas por estado
    @GetMapping("/estado/{estado}")
    public ResponseEntity<ApiResponse> obtenerPorEstado(@PathVariable String estado) {
        try {
            List<Reserva> reservas = reservaService.obtenerPorEstado(estado);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Reservas con estado obtenidas",
                    reservas
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener reservas: " + e.getMessage()));
        }
    }

    // Eliminar reserva
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarReserva(@PathVariable String id) {
        try {
            reservaService.eliminarReserva(id);
            return ResponseEntity.ok(new ApiResponse(true, "Reserva eliminada permanentemente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}