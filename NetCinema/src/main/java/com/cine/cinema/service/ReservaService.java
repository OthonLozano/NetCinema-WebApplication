package com.cine.cinema.service;

import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Reserva;
import com.cine.cinema.model.Usuario;
import com.cine.cinema.repository.FuncionRepository;
import com.cine.cinema.repository.ReservaRepository;
import com.cine.cinema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final FuncionRepository funcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final FuncionService funcionService;

    // Crear reserva
    public Reserva crearReserva(Reserva reserva) {
        // Verificar que la función existe
        Funcion funcion = funcionRepository.findById(reserva.getFuncion().getId())
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        reserva.setFuncion(funcion);

        // Si hay usuario, cargarlo
        if (reserva.getUsuario() != null && reserva.getUsuario().getId() != null) {
            Usuario usuario = usuarioRepository.findById(reserva.getUsuario().getId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            reserva.setUsuario(usuario);
        }

        // Bloquear asientos temporalmente
        funcionService.bloquearAsientos(funcion.getId(), reserva.getAsientos());

        // Estado inicial: PENDIENTE
        reserva.setEstado("PENDIENTE");

        // Calcular total
        double total = funcion.getPrecio() * reserva.getAsientos().size();
        reserva.setTotal(total);

        return reservaRepository.save(reserva);
    }

    // Confirmar reserva (después del pago)
    public Reserva confirmarReserva(String reservaId, String metodoPago) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (!"PENDIENTE".equals(reserva.getEstado())) {
            throw new RuntimeException("La reserva ya fue procesada");
        }

        // Confirmar compra en la función (mover de bloqueados a ocupados)
        funcionService.confirmarCompra(reserva.getFuncion().getId(), reserva.getAsientos());

        // Actualizar estado
        reserva.setEstado("CONFIRMADA");
        reserva.setMetodoPago(metodoPago);

        return reservaRepository.save(reserva);
    }

    // Cancelar reserva
    public void cancelarReserva(String reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        // Liberar asientos
        if ("PENDIENTE".equals(reserva.getEstado())) {
            funcionService.liberarAsientos(reserva.getFuncion().getId(), reserva.getAsientos());
        }

        reserva.setEstado("CANCELADA");
        reservaRepository.save(reserva);
    }

    // Obtener todas las reservas
    public List<Reserva> obtenerTodas() {
        return reservaRepository.findAll();
    }

    // Obtener reserva por ID
    public Optional<Reserva> obtenerPorId(String id) {
        return reservaRepository.findById(id);
    }

    // Obtener reserva por código
    public Optional<Reserva> obtenerPorCodigo(String codigo) {
        return reservaRepository.findByCodigoReserva(codigo);
    }

    // Obtener reservas por usuario
    public List<Reserva> obtenerPorUsuario(String usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return reservaRepository.findByUsuario(usuario);
    }

    // Obtener reservas por email
    public List<Reserva> obtenerPorEmail(String email) {
        return reservaRepository.findByEmailCliente(email);
    }

    // Obtener reservas por función
    public List<Reserva> obtenerPorFuncion(String funcionId) {
        Funcion funcion = funcionRepository.findById(funcionId)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        return reservaRepository.findByFuncion(funcion);
    }

    // Obtener reservas por estado
    public List<Reserva> obtenerPorEstado(String estado) {
        return reservaRepository.findByEstado(estado);
    }

    // Eliminar reserva
    public void eliminarReserva(String id) {
        reservaRepository.deleteById(id);
    }
}