package com.netcinema.SB.MongoDB.service;

import com.netcinema.SB.MongoDB.model.Reservacion;
import com.netcinema.SB.MongoDB.repository.ReservacionRepository;
import org.springframework.beans.factory.annotation.Autowired; //para inyectar dependencias
import org.springframework.stereotype.Service; //indica que es un servicio

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service //indica que es un servicio
public class ReservacionService {

    private static final int MINUTOS_EXPIRACION = 10; //tiempo de expiracion en minutos

    @Autowired //inyecta la dependencia del repositorio
    private ReservacionRepository reservacionRepository;

    @Autowired
    private FuncionService funcionService;

    //estados de la reservación
    public static final String ESTADO_PENDIENTE = "PENDIENTE";
    public static final String ESTADO_PAGADO = "PAGADO";
    public static final String ESTADO_CANCELADO = "CANCELADO";
    public static final String ESTADO_EXPIRADO = "EXPIRADO";


    //crear la reserva temporal
    public Reservacion crearReservaTemporal(String funcionId, String usuarioId,
                                            List<Reservacion.AsientoReservado> asientos){

        //verificar disponibilidad de asientos
        for(Reservacion.AsientoReservado asiento: asientos){
            if(existeReservaActiva(funcionId, asiento.getFila(), asiento.getNumero())){
                throw new RuntimeException("Asiento no disponible: Fila " + asiento.getFila() +
                        " Numero " + asiento.getNumero());
            }
        }

        //calcular total
        Double total = asientos.stream() //.stream() para trabajar con flujos
                .mapToDouble(Reservacion.AsientoReservado::getPrecio) //:: referencia al metodo getPrecio
                .sum();

        //crear la reserva con expiracion
        LocalDateTime ahora = LocalDateTime.now();

        Reservacion reservacion = Reservacion.builder() //builder para crear el objeto
                .funcionId(funcionId)
                .usuarioId(usuarioId)
                .asientos(asientos)
                .estado(ESTADO_PENDIENTE)
                .fechaReservacion(ahora)
                .fechaExpiracion(ahora.plusMinutes(MINUTOS_EXPIRACION))
                .total(total)
                .build();
        return reservacionRepository.save(reservacion); //guardar la reserva
    }

    //verificar si existe una reserva activa (no cancelada o pagada)
    public boolean existeReservaActiva(String funcionId, String fila, String numero){
        //buscar reservas pagadas
        boolean pagada = reservacionRepository
                .existsByFuncionIdAndAsientoFilaAndAsientoNumeroAndEstado(
                    funcionId, fila, numero, ESTADO_PAGADO);
        if(pagada) {
            return true;
        }

        //buscar reservas pendientes no expiradas
        List<Reservacion> pendientes = reservacionRepository
                .findByFuncionIdAndEstado(funcionId, ESTADO_PENDIENTE);
        LocalDateTime ahora = LocalDateTime.now();

        return pendientes.stream()
                .filter(r->r.getFechaExpiracion().isAfter(ahora)) //filtrar por expiracion
                .flatMap(r->r.getAsientos().stream())
                .anyMatch(a->a.getFila().equals(fila) && a.getNumero().equals(numero));
    }

    //simulacion del pago (cambio de estado)
    public Reservacion procesarPago(String reservacionId){
        Reservacion reservacion = reservacionRepository.findById(reservacionId).orElseThrow(
            ()-> new RuntimeException("Reservacion no encontrada"));

        //verificar que no haya expirado
        if(LocalDateTime.now().isAfter(reservacion.getFechaExpiracion())){
            reservacion.setEstado(ESTADO_EXPIRADO);
            reservacionRepository.save(reservacion);
            throw new RuntimeException("La reservacion ha expirado");
        }

        //verificar estado pendiente
        if(!ESTADO_PENDIENTE.equals(reservacion.getEstado())){
            throw new RuntimeException("La reservacion no está en estado pendiente"); //solo se pueden pagar reservaciones pendientes
        }

        //simular el pago exitoso
        reservacion.setEstado(ESTADO_PAGADO);
        return reservacionRepository.save(reservacion);
    }

    //obtener tiempo restante en segundos
    public long getTiempoRestante(String reservacionId){
        Reservacion reservacion = reservacionRepository.findById(reservacionId)
                .orElseThrow(()-> new RuntimeException("Reservacion no encontrada"));

        long segundos = java.time.Duration.between(
            LocalDateTime.now(), reservacion.getFechaExpiracion()).getSeconds();

        return Math.max(0, segundos); //retornar 0 si ya expiró
    }

    //cancelar la reservacion
    public Reservacion cancelarReservacion(String reservacionId){
        Optional<Reservacion> optReservacion = reservacionRepository.findById(reservacionId);
        //verificar si la reservacion existe
        if(optReservacion.isPresent()){
            Reservacion reservacion = optReservacion.get();
            reservacion.setEstado(ESTADO_CANCELADO); //cambiar estado a cancelado
            return reservacionRepository.save(reservacion);
        }
        throw new RuntimeException("Reservacion no encontrada");
    }

    //obtener reservacion por usuario
    public  List<Reservacion> obtenerPorUsuario(String usuarioId){
        return reservacionRepository.findByUsuarioId(usuarioId);
    }
}
