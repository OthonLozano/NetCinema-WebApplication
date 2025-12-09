package com.cine.cinema.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "funciones")
public class Funcion {

    @Id
    private String id;

    @DBRef
    @NotNull(message = "La película es obligatoria")
    private Pelicula pelicula;

    @DBRef
    @NotNull(message = "La sala es obligatoria")
    private Sala sala;

    @NotNull(message = "La fecha y hora son obligatorias")
    private LocalDateTime fechaHora;

    @Min(value = 1, message = "El precio debe ser mayor a 0")
    private Double precio;

    // Lista de asientos ocupados definitivamente (formato: "A1", "B5", etc.)
    private List<String> asientosOcupados = new ArrayList<>();

    // Map de asientos bloqueados temporalmente
    // Key: asiento (ej: "A1"), Value: timestamp de expiración
    private Map<String, Long> asientosBloqueados = new HashMap<>();

    private Boolean activa = true;

    // Método auxiliar para verificar si un asiento está disponible
    public boolean isAsientoDisponible(String asiento) {
        // Si está ocupado, no está disponible
        if (asientosOcupados.contains(asiento)) {
            return false;
        }

        // Si está bloqueado, verificar si el bloqueo expiró
        if (asientosBloqueados.containsKey(asiento)) {
            Long expiracion = asientosBloqueados.get(asiento);
            if (System.currentTimeMillis() < expiracion) {
                return false; // Aún bloqueado
            }
            // El bloqueo expiró, removerlo
            asientosBloqueados.remove(asiento);
        }

        return true;
    }
}