package com.cine.cinema.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reservas")
public class Reserva {

    @Id
    private String id;

    @DBRef
    @NotNull(message = "La función es obligatoria")
    private Funcion funcion;

    @DBRef
    private Usuario usuario; // Puede ser null si es compra sin registro

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombreCliente;

    @NotBlank(message = "El email del cliente es obligatorio")
    @Email(message = "Email debe ser válido")
    private String emailCliente;

    @NotEmpty(message = "Debe seleccionar al menos un asiento")
    private List<String> asientos; // Ej: ["A1", "A2", "B5"]

    @Min(value = 1, message = "El total debe ser mayor a 0")
    private Double total;

    @NotBlank(message = "El estado es obligatorio")
    private String estado; // PENDIENTE, CONFIRMADA, CANCELADA

    @Indexed(unique = true)
    private String codigoReserva; // Código único para consultar

    private LocalDateTime fechaCreacion = LocalDateTime.now();

    private String metodoPago; // EFECTIVO, TARJETA, TRANSFERENCIA

    // Constructor para generar código automáticamente
    public Reserva(Funcion funcion, Usuario usuario, String nombreCliente,
                   String emailCliente, List<String> asientos, Double total) {
        this.funcion = funcion;
        this.usuario = usuario;
        this.nombreCliente = nombreCliente;
        this.emailCliente = emailCliente;
        this.asientos = asientos;
        this.total = total;
        this.estado = "PENDIENTE";
        this.codigoReserva = generarCodigoReserva();
        this.fechaCreacion = LocalDateTime.now();
    }

    private String generarCodigoReserva() {
        return "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}