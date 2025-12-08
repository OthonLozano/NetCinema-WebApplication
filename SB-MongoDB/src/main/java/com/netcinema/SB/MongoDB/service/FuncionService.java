package com.netcinema.SB.MongoDB.service;

import com.netcinema.SB.MongoDB.model.Funcion;
import com.netcinema.SB.MongoDB.model.Pelicula;
import com.netcinema.SB.MongoDB.repository.FuncionRepository;
import org.springframework.beans.factory.annotation.Autowired; //para inyectar dependencias
import org.springframework.stereotype.Service; //indica que es un servicio

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.time.LocalDate;

@Service
public class FuncionService {

    @Autowired
    private FuncionRepository funcionRepository;

    //estados validos para mostrar funciones activas
    private static final List<String> ESTADOS_ACTIVOS = Arrays.asList("PROGRAMADA", "EN_CURSO");

    //obtener todas las funciones activas
    public List<Funcion> obtenerFuncionesActivas(){
        return funcionRepository.findByEstadoIn(ESTADOS_ACTIVOS);
    }

    //obtener funcion por id
    public Funcion obtenerPorId(String id){
        return funcionRepository.findById(id).orElseThrow(() -> new RuntimeException("Funcion no encontrada"));
        //()-> new RuntimeException es una expresion lambda
    }

    //filtrar por pelicula
    public List<Funcion> filtrarPorPelicula(String peliculaId){
        return funcionRepository.findByPeliculaId(peliculaId);
    }

    //filtrar por idioma
    public List<Funcion> filtrarPorIdioma(String idioma){
        return funcionRepository.findByIdioma(idioma);
    }

    //filtrar por subtitulos
    public List<Funcion> filtrarPorSubtitulos(String subtitulos){
        return funcionRepository.findBySubtitulos(subtitulos);
    }

    //filtrar por rango de horarios
    public List<Funcion> filtrarPorHorario(LocalTime horaInicio, LocalTime horaFin){
        return funcionRepository.findByHoraBetween(horaInicio, horaFin);
    }

    //filto convinado (parametros pueden ser null)
    public List<Funcion> filrarFunciones(String peliculaId, String idioma,
                                         String subtitulos, LocalTime horaInicio, LocalTime horaFin){
        return funcionRepository.findByFiltros(peliculaId, idioma, subtitulos, horaInicio, horaFin);
    }

    //obtener por fecha
    public List<Funcion> obtenerPorFecha(LocalDate fecha) {
        return funcionRepository.findByFecha(fecha);
    }
}
