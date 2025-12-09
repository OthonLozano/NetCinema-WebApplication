package com.cine.cinema.service;

import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.model.Sala;
import com.cine.cinema.repository.FuncionRepository;
import com.cine.cinema.repository.PeliculaRepository;
import com.cine.cinema.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FuncionService {

    private final FuncionRepository funcionRepository;
    private final PeliculaRepository peliculaRepository;
    private final SalaRepository salaRepository;

    // Crear función
    public Funcion crearFuncion(Funcion funcion) {
        // Verificar que la película existe
        if (funcion.getPelicula() == null || funcion.getPelicula().getId() == null) {
            throw new RuntimeException("Debe especificar una película válida");
        }

        // Verificar que la sala existe
        if (funcion.getSala() == null || funcion.getSala().getId() == null) {
            throw new RuntimeException("Debe especificar una sala válida");
        }

        // Cargar película completa
        Pelicula pelicula = peliculaRepository.findById(funcion.getPelicula().getId())
                .orElseThrow(() -> new RuntimeException("Película no encontrada"));

        // Cargar sala completa
        Sala sala = salaRepository.findById(funcion.getSala().getId())
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        funcion.setPelicula(pelicula);
        funcion.setSala(sala);

        // Verificar conflictos de horario
        if (existeConflictoHorario(funcion)) {
            throw new RuntimeException("Ya existe una función en esa sala en ese horario");
        }

        // Inicializar listas vacías
        if (funcion.getAsientosOcupados() == null) {
            funcion.setAsientosOcupados(new ArrayList<>());
        }
        if (funcion.getAsientosBloqueados() == null) {
            funcion.setAsientosBloqueados(new java.util.HashMap<>());
        }

        return funcionRepository.save(funcion);
    }

    // Verificar si existe conflicto de horario
    private boolean existeConflictoHorario(Funcion nuevaFuncion) {
        // Calcular inicio y fin de la nueva función
        LocalDateTime inicio = nuevaFuncion.getFechaHora();
        LocalDateTime fin = inicio.plusMinutes(nuevaFuncion.getPelicula().getDuracion() + 30); // +30 min de limpieza

        // Buscar funciones en la misma sala en ese rango
        List<Funcion> funcionesConflicto = funcionRepository.findBySalaAndFechaHoraBetween(
                nuevaFuncion.getSala(),
                inicio.minusMinutes(30),
                fin
        );

        // Si estamos actualizando, excluir la función actual
        if (nuevaFuncion.getId() != null) {
            funcionesConflicto.removeIf(f -> f.getId().equals(nuevaFuncion.getId()));
        }

        return !funcionesConflicto.isEmpty();
    }

    // Obtener todas las funciones
    public List<Funcion> obtenerTodas() {
        return funcionRepository.findAll();
    }

    // Obtener funciones activas
    public List<Funcion> obtenerActivas() {
        return funcionRepository.findByActivaTrue();
    }

    // Obtener funciones futuras
    public List<Funcion> obtenerFuturas() {
        return funcionRepository.findByFechaHoraAfter(LocalDateTime.now());
    }

    // Obtener función por ID
    public Optional<Funcion> obtenerPorId(String id) {
        return funcionRepository.findById(id);
    }

    // Obtener funciones por película
    public List<Funcion> obtenerPorPelicula(String peliculaId) {
        Pelicula pelicula = peliculaRepository.findById(peliculaId)
                .orElseThrow(() -> new RuntimeException("Película no encontrada"));

        return funcionRepository.findByPeliculaAndActivaTrueAndFechaHoraAfter(
                pelicula,
                LocalDateTime.now()
        );
    }

    // Obtener funciones por sala
    public List<Funcion> obtenerPorSala(String salaId) {
        Sala sala = salaRepository.findById(salaId)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        return funcionRepository.findBySala(sala);
    }

    // Actualizar función
    public Funcion actualizarFuncion(String id, Funcion funcionActualizada) {
        Funcion funcion = funcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        // Cargar película si cambió
        if (funcionActualizada.getPelicula() != null) {
            Pelicula pelicula = peliculaRepository.findById(funcionActualizada.getPelicula().getId())
                    .orElseThrow(() -> new RuntimeException("Película no encontrada"));
            funcion.setPelicula(pelicula);
        }

        // Cargar sala si cambió
        if (funcionActualizada.getSala() != null) {
            Sala sala = salaRepository.findById(funcionActualizada.getSala().getId())
                    .orElseThrow(() -> new RuntimeException("Sala no encontrada"));
            funcion.setSala(sala);
        }

        funcion.setFechaHora(funcionActualizada.getFechaHora());
        funcion.setPrecio(funcionActualizada.getPrecio());
        funcion.setActiva(funcionActualizada.getActiva());

        // Verificar conflictos de horario
        if (existeConflictoHorario(funcion)) {
            throw new RuntimeException("Ya existe una función en esa sala en ese horario");
        }

        return funcionRepository.save(funcion);
    }

    // Desactivar función
    public void desactivarFuncion(String id) {
        Funcion funcion = funcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        funcion.setActiva(false);
        funcionRepository.save(funcion);
    }

    // Eliminar función permanentemente
    public void eliminarFuncion(String id) {
        funcionRepository.deleteById(id);
    }

    // Bloquear asientos temporalmente (15 minutos)
    public synchronized Funcion bloquearAsientos(String funcionId, List<String> asientos) {
        Funcion funcion = funcionRepository.findById(funcionId)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        // Limpiar bloqueos expirados primero
        limpiarBloqueosExpirados(funcion);

        // Verificar disponibilidad de todos los asientos
        for (String asiento : asientos) {
            if (!funcion.isAsientoDisponible(asiento)) {
                throw new RuntimeException("El asiento " + asiento + " no está disponible");
            }
        }

        // Bloquear los asientos (15 minutos = 900000 ms)
        long expiracion = System.currentTimeMillis() + 900000;
        for (String asiento : asientos) {
            funcion.getAsientosBloqueados().put(asiento, expiracion);
        }

        return funcionRepository.save(funcion);
    }

    // Limpiar bloqueos expirados
    public void limpiarBloqueosExpirados(Funcion funcion) {
        long ahora = System.currentTimeMillis();
        funcion.getAsientosBloqueados().entrySet()
                .removeIf(entry -> entry.getValue() < ahora);
    }

    // Confirmar compra (mover de bloqueados a ocupados)
    public synchronized Funcion confirmarCompra(String funcionId, List<String> asientos) {
        Funcion funcion = funcionRepository.findById(funcionId)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        // Verificar que los asientos estén bloqueados
        for (String asiento : asientos) {
            if (!funcion.getAsientosBloqueados().containsKey(asiento)) {
                throw new RuntimeException("El asiento " + asiento + " no está bloqueado");
            }
        }

        // Mover de bloqueados a ocupados
        for (String asiento : asientos) {
            funcion.getAsientosBloqueados().remove(asiento);
            funcion.getAsientosOcupados().add(asiento);
        }

        return funcionRepository.save(funcion);
    }

    // Liberar asientos bloqueados (cancelar selección)
    public synchronized Funcion liberarAsientos(String funcionId, List<String> asientos) {
        Funcion funcion = funcionRepository.findById(funcionId)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        for (String asiento : asientos) {
            funcion.getAsientosBloqueados().remove(asiento);
        }

        return funcionRepository.save(funcion);
    }
}