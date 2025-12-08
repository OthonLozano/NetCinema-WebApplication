package com.netcinema.SB.MongoDB.model;

import lombok.AllArgsConstructor; //contructor q incluye agrs para cada campo
import lombok.Builder; //metodos para construir el obj de forma fluente
import lombok.Data;  //anotaciones gett, sett, toStr
import lombok.NoArgsConstructor; //constructor sin arg

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    private String id;

    private String nombre;
    private String apellido;

    @Indexed(unique=true)
    private String email;

    private String password; //encriptada
    private String telefono;

    @CreatedDate
    private LocalDateTime fechaRegistro;

    @LastModifiedDate
    private LocalDateTime fechaActualizacion;

    @Builder.Default
    private String rol = "CLIENTE";
    @Builder.Default
    private Boolean activo = true;

}
