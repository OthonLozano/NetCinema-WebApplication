package com.netcinema.SB.MongoDB.repository;

import com.netcinema.SB.MongoDB.model.Funcion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface FuncionRepository extends MongoRepository<Funcion,String> {
    //buscar funciones por pelicula y fecha
    List<Funcion> findByPeliculaIdAndFecha(String peliculaId, LocalDate fecha);

    //buscar solo por fecha
    List<Funcion> findByFecha(LocalDate fecha);

    //busca por frcha y estado
    List<Funcion> findByFechaAndEstado(LocalDate fecha, String estado);

    //buscar funciones activas (PROGRAMADA o EN_CURSO)
    List<Funcion> findByEstadoIn(List<String> estados);

    //Filtrar por pelicula
    List<Funcion> findByPeliculaId(String peliculaId);

    //filtrar por subtitulos
    List<Funcion> findBySubtitulos(String subtitulos);

    //filtar por idioma
    List<Funcion> findByIdioma(String idioma);

    //filtrar por rango de horarios
    @Query("{'hora': {$gte: ?0, $lte: ?1}}")
    List<Funcion> findByHoraBetween(LocalTime horaInicio, java.time.LocalTime horaFin);

    //filtro conbinado con parametros opcionales
    @Query("{ $and: [" +
            "{ 'estado': { $in: ['PROGRAMADA', 'EN_CURSO'] } }," +
            "{ $or: [{ $expr: { $eq: [?0, null] } }, { 'peliculaId': ?0 }] }," +
            "{ $or: [{ $expr: { $eq: [?1, null] } }, { 'idioma': ?1 }] }," +
            "{ $or: [{ $expr: { $eq: [?2, null] } }, { 'subtitulos': ?2 }] }," +
            "{ $or: [{ $expr: { $eq: [?3, null] } }, { 'hora': { $gte: ?3 } }] }," +
            "{ $or: [{ $expr: { $eq: [?4, null] } }, { 'hora': { $lte: ?4 } }] }" +
            "] }")
    List<Funcion> findByFiltros(String peliculaId, String idioma, String subtitulos,
                                LocalTime horaInicio, LocalTime horaFin);
}
