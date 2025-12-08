package com.netcinema.SB.MongoDB.repository;

import com.netcinema.SB.MongoDB.model.Reservacion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface ReservacionRepository extends MongoRepository<Reservacion, String> {
    List<Reservacion> findByUsuarioId(String usuarioId); //buscar reservaciones por usuario
    List<Reservacion> findByFuncionIdAndEstado(String funcionId, String estado); //buscar reservaciones por funcion y estado
    List<Reservacion> findByEstadoAndFechaExpiracionBefore(String estado, LocalDateTime fecha); //buscar reservaciones por estado y fecha de expiracion antes de una fecha dada

    //verificar si un asiento está reservado o pagado

    // ?0 es el primer parametro, ?1 el segundo, etc.
    // $elemMatch es para buscar en un array un elemento que cumpla con ciertas condiciones
    // $ne es para "not equal" (no igual)
    @Query(value = "{'funcionId': ?0, 'asientos': {$elemMatch: {'fila':?1, 'numero':?2}}, 'estado': ?3}", exists = true)
    boolean existsByFuncionIdAndAsientoFilaAndAsientoNumeroAndEstadoNot(
            String funcionId,
            String fila,
            String numero,
            String estado
    );

    @Query(value="{'funcionId': ?0, 'asientos': {$elemMatch: {'fila':?1, 'numero':?2}}, 'estado': {$ne: ?3}}", exists = true)
    boolean existsByFuncionIdAndAsientoFilaAndAsientoNumeroAndEstado(
            String funcionId,
            String fila,
            String numero,
            String estado
    );
}
