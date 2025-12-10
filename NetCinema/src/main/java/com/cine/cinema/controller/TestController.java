package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.model.Sala;
import com.cine.cinema.model.Usuario;
import com.cine.cinema.service.PeliculaService;
import com.cine.cinema.service.SalaService;
import com.cine.cinema.service.UsuarioService;
import com.cine.cinema.udp.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UsuarioService usuarioService;
    private final PeliculaService peliculaService;
    private final SalaService salaService;
    private final NotificacionService notificacionService;

    @GetMapping("/hello")
    public String hello() {
        return "¡Hola! NetCinema está funcionando correctamente";
    }

    @PostMapping("/crear-datos-prueba")
    public String crearDatosPrueba() {
        try {
            // Crear usuario admin
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setEmail("admin@netcinema.com");
            admin.setPassword("admin123");
            admin.setRol("ADMIN");
            admin.setNombre("Administrador");
            admin.setApellido("Sistema");
            admin.setTelefono("5512345678");
            usuarioService.crearUsuario(admin);

            // Crear usuario cliente
            Usuario cliente = new Usuario();
            cliente.setUsername("cliente1");
            cliente.setEmail("cliente@example.com");
            cliente.setPassword("cliente123");
            cliente.setRol("CLIENTE");
            cliente.setNombre("Juan");
            cliente.setApellido("Pérez");
            cliente.setTelefono("5598765432");
            usuarioService.crearUsuario(cliente);

            // Crear películas
            Pelicula pelicula1 = new Pelicula();
            pelicula1.setTitulo("Inception");
            pelicula1.setDescripcion("Un ladrón que roba secretos del subconsciente durante el sueño");
            pelicula1.setGeneros(Arrays.asList("Ciencia Ficción", "Acción", "Thriller"));
            pelicula1.setDuracion(148);
            pelicula1.setClasificacion("B");
            pelicula1.setDirector("Christopher Nolan");
            pelicula1.setActores(Arrays.asList("Leonardo DiCaprio", "Marion Cotillard", "Ellen Page"));
            pelicula1.setPosterUrl("https://image.tmdb.org/t/p/w500/inception.jpg");
            peliculaService.crearPelicula(pelicula1);

            Pelicula pelicula2 = new Pelicula();
            pelicula2.setTitulo("Interestelar");
            pelicula2.setDescripcion("Un grupo de exploradores viaja a través de un agujero de gusano");
            pelicula2.setGeneros(Arrays.asList("Ciencia Ficción", "Drama"));
            pelicula2.setDuracion(169);
            pelicula2.setClasificacion("B");
            pelicula2.setDirector("Christopher Nolan");
            pelicula2.setActores(Arrays.asList("Matthew McConaughey", "Anne Hathaway"));
            pelicula2.setPosterUrl("https://image.tmdb.org/t/p/w500/interstellar.jpg");
            peliculaService.crearPelicula(pelicula2);

            // Crear salas
            Sala sala1 = new Sala();
            sala1.setNombre("Sala 1");
            sala1.setTipo("2D");
            sala1.setFilas(8);
            sala1.setColumnas(10);
            salaService.crearSala(sala1);

            Sala sala2 = new Sala();
            sala2.setNombre("Sala VIP");
            sala2.setTipo("VIP");
            sala2.setFilas(5);
            sala2.setColumnas(8);
            salaService.crearSala(sala2);

            Sala sala3 = new Sala();
            sala3.setNombre("Sala IMAX");
            sala3.setTipo("IMAX");
            sala3.setFilas(10);
            sala3.setColumnas(12);
            salaService.crearSala(sala3);

            return "Datos de prueba creados correctamente:\n" +
                    "- 2 usuarios (admin/cliente1)\n" +
                    "- 2 películas (Inception/Interestelar)\n" +
                    "- 3 salas (Sala 1/VIP/IMAX)";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/usuarios")
    public List<Usuario> obtenerUsuarios() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/peliculas")
    public List<Pelicula> obtenerPeliculas() {
        return peliculaService.obtenerTodas();
    }

    @GetMapping("/salas")
    public List<Sala> obtenerSalas() {
        return salaService.obtenerTodas();
    }

    @DeleteMapping("/limpiar-bd")
    public String limpiarBD() {
        try {
            return "Función de limpieza no implementada (por seguridad)";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    // Endpoint para ver clientes UDP conectados
    @GetMapping("/udp/clientes")
    public ResponseEntity<ApiResponse> obtenerClientesUDP() {
        int clientes = notificacionService.getClientesConectados();
        return ResponseEntity.ok(new ApiResponse(
                true,
                "Clientes UDP conectados",
                Map.of("clientes", clientes)
        ));
    }
}