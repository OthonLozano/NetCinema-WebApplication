package com.netcinema.SB.MongoDB.controller;

import com.netcinema.SB.MongoDB.dto.CrearReservacionDTO;
import com.netcinema.SB.MongoDB.dto.ReservacionDTO;
import com.netcinema.SB.MongoDB.model.Reservacion;
import com.netcinema.SB.MongoDB.service.ReservacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*; //es para manejar las solicitudes HTTP
import org.springframework.http.ResponseEntity; //es para manejar respuestas HTTP

import java.util.List;
import java.util.stream.Collectors; //es para manejar listas y flujos de datos

@RestController
@RequestMapping("/api/reservaciones") //ruta base para las solicitudes de reservaciones
@CrossOrigin(origins="*") //permite solicitudes desde cualquier origen
public class ReservacionController {

    @Autowired
    private ReservacionService reservacionService;

    @PostMapping
    public ResponseEntity<?> crearReservacion(@RequestBody CrearReservacionDTO dto) {
        try{
            List<Reservacion.AsientoReservado> asientos = dto.getAsientos().stream()
                    .map(a->Reservacion.AsientoReservado.builder()
                    .fila(a.getFila())
                    .numero(a.getNumero())
                    .precio(0.0) //se asigna desde la funcion
                    .build())
                    .collect(Collectors.toList());
            Reservacion reservacion = reservacionService.crearReservaTemporal(
                    dto.getFuncionId(),
                    dto.getUsuarioId(),
                    asientos);
            return ResponseEntity.ok(reservacion); //devuelve la reservacion creada
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage()); //devuelve el error
        }
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<?> procesarPago(@PathVariable String id) { //pathvariable es para obtener el id de la ruta
        try{
            Reservacion reservacion = reservacionService.procesarPago(id);
            return ResponseEntity.ok(reservacion); //devuelve la reservacion pagada
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage()); //devuelve el error
        }
    }

    @GetMapping("/{id}/tiempo-restante")
    public ResponseEntity<Long> tiempoRestante(@PathVariable String id) {
        return ResponseEntity.ok(reservacionService.getTiempoRestante(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelar(@PathVariable String id) {
        try{
            return ResponseEntity.ok(reservacionService.cancelarReservacion(id)); //devuelve la reservacion cancelada
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(e.getMessage()); //devuelve el error
        }
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Reservacion>> porUsuario(@PathVariable String usuarioId) {
        return ResponseEntity.ok(reservacionService.obtenerPorUsuario(usuarioId));
    }

}
