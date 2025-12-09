package com.cine.cinema.service;

import com.cine.cinema.model.Sala;
import com.cine.cinema.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SalaService {

    private final SalaRepository salaRepository;

    // Crear sala
    public Sala crearSala(Sala sala) {
        // Verificar si el nombre ya existe
        if (salaRepository.existsByNombre(sala.getNombre())) {
            throw new RuntimeException("Ya existe una sala con ese nombre");
        }

        // Calcular capacidad automáticamente
        sala.calcularCapacidad();

        return salaRepository.save(sala);
    }

    // Obtener todas las salas
    public List<Sala> obtenerTodas() {
        return salaRepository.findAll();
    }

    // Obtener salas activas
    public List<Sala> obtenerActivas() {
        return salaRepository.findByActivaTrue();
    }

    // Obtener sala por ID
    public Optional<Sala> obtenerPorId(String id) {
        return salaRepository.findById(id);
    }

    // Obtener sala por nombre
    public Optional<Sala> obtenerPorNombre(String nombre) {
        return salaRepository.findByNombre(nombre);
    }

    // Buscar por tipo
    public List<Sala> buscarPorTipo(String tipo) {
        return salaRepository.findByTipo(tipo);
    }

    // Actualizar sala
    public Sala actualizarSala(String id, Sala salaActualizada) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        sala.setNombre(salaActualizada.getNombre());
        sala.setTipo(salaActualizada.getTipo());
        sala.setFilas(salaActualizada.getFilas());
        sala.setColumnas(salaActualizada.getColumnas());
        sala.setActiva(salaActualizada.getActiva());

        // Recalcular capacidad
        sala.calcularCapacidad();

        return salaRepository.save(sala);
    }

    // Desactivar sala (soft delete)
    public void desactivarSala(String id) {
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        sala.setActiva(false);
        salaRepository.save(sala);
    }

    // Eliminar sala permanentemente
    public void eliminarSala(String id) {
        salaRepository.deleteById(id);
    }
}