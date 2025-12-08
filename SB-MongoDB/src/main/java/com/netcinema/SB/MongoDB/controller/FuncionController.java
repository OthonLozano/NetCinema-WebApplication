package com.netcinema.SB.MongoDB.controller;

import com.netcinema.SB.MongoDB.model.Funcion;
import com.netcinema.SB.MongoDB.model.Reservacion;
import com.netcinema.SB.MongoDB.service.FuncionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/funciones")
@CrossOrigin(origins="*") //permite solicitudes desde cualquier origen
public class FuncionController {
    @Autowired
    private FuncionService funcionService;

    @GetMapping
    public ResponseEntity<List<Funcion>> obtenerTodas(){
        return ResponseEntity.ok(funcionService.obtenerFuncionesActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerFuncionPorId(@PathVariable String id){
        try{
            return ResponseEntity.ok(funcionService.obtenerPorId(id));
        }catch (Exception e){
            return ResponseEntity.notFound().build(); //devuelve 404 si no se encuentra
        }
    }

    @GetMapping("/pelicula/{peliculaId}")
    public ResponseEntity<List<Funcion>> filtrarPorPelicula(@PathVariable String peliculaId){
        return ResponseEntity.ok(funcionService.filtrarPorPelicula(peliculaId));
    }

    @GetMapping("/fecha/{fecha}")
    public ResponseEntity<List<Funcion>> filtrarPorFecha(@PathVariable String fecha){
        LocalDate localDate = LocalDate.parse(fecha); //convierte el string a LocalDate
        return ResponseEntity.ok(funcionService.obtenerPorFecha(localDate));
    }
}
