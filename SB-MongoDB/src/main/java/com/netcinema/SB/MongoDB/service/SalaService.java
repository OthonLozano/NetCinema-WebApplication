package com.netcinema.SB.MongoDB.service;

import com.netcinema.SB.MongoDB.repository.SalaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.netcinema.SB.MongoDB.model.Sala;

import java.util.List;

@Service
public class SalaService {

    @Autowired
    private SalaRepository salaRepository;

    //obtener todas
    public List<Sala> obtenerTodas() {
        return salaRepository.findAll();
    }
    //obtener todas las activas
    public List<Sala> obtenerSalasActivas() {
        return salaRepository.findByActivaTrue();
    }

    //obtenr por id
    public Sala obtenerPorId(String id) {
        return salaRepository.findById(id).orElseThrow(() -> new RuntimeException("Sala no encontrada"));
    }

    //obtener la capacidad de una sala por id
    public String obtenerCapacidadPorId(String id) {
        Sala sala = obtenerPorId(id);
        return sala.getFilas() * sala.getColumnas();
    }


}
