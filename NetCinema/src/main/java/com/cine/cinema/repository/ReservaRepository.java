package com.cine.cinema.repository;

import com.cine.cinema.model.Funcion;
import com.cine.cinema.model.Reserva;
import com.cine.cinema.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends MongoRepository<Reserva, String> {

    // Buscar por código de reserva
    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    // Buscar por usuario
    List<Reserva> findByUsuario(Usuario usuario);

    // Buscar por email
    List<Reserva> findByEmailCliente(String email);

    // Buscar por función
    List<Reserva> findByFuncion(Funcion funcion);

    // Buscar por estado
    List<Reserva> findByEstado(String estado);

    // Buscar reservas confirmadas de una función
    List<Reserva> findByFuncionAndEstado(Funcion funcion, String estado);

    // Contar reservas por función
    long countByFuncion(Funcion funcion);
}