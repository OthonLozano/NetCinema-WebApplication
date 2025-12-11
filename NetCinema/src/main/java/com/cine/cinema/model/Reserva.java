package com.cine.cinema.model;

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
@Document(collection = "reservas")
public class Reserva {

    @Id
    private String id;

    @DBRef
    @NotNull(message = "La función es obligatoria")
    private Funcion funcion;

    @DBRef
    private Usuario usuario;

    @NotBlank(message = "El nombre del cliente es obligatorio")
    private String nombreCliente;

    @NotBlank(message = "El email del cliente es obligatorio")
    @Email(message = "Email debe ser válido")
    private String emailCliente;

    @NotEmpty(message = "Debe seleccionar al menos un asiento")
    private List<String> asientos;

    @Min(value = 1, message = "El total debe ser mayor a 0")
    private Double total;

    @NotBlank(message = "El estado es obligatorio")
    private String estado = "PENDIENTE"; // Valor por defecto

    @Indexed(unique = true)
    private String codigoReserva;

    private LocalDateTime fechaCreacion = LocalDateTime.now(); // Valor por defecto

    private String metodoPago;

    // Constructor personalizado que genera el código automáticamente
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

    // Método para generar código único
    public static String generarCodigoReserva() {
        return "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    // Método para asegurar que siempre haya un código antes de guardar
    public void prepararParaGuardar() {
        if (this.codigoReserva == null || this.codigoReserva.isEmpty()) {
            this.codigoReserva = generarCodigoReserva();
        }
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null || this.estado.isEmpty()) {
            this.estado = "PENDIENTE";
        }
    }
}