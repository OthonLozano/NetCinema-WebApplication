package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.model.Pelicula;
import com.cine.cinema.model.Sala;
import com.cine.cinema.model.Usuario;
import com.cine.cinema.service.PeliculaService;
import com.cine.cinema.service.SalaService;
import com.cine.cinema.service.UsuarioService;
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

    @GetMapping("/hello")
    public String hello() {
        return "¡Hola! NetCinema está funcionando correctamente";
    }

    @PostMapping("/crear-datos-prueba")
    public String crearDatosPrueba() {
        try {
            // Crear usuario admin
            Usuario admin1 = new Usuario();
            admin1.setUsername("marvin_antonio");
            admin1.setEmail("marvin@netcinema.com");
            admin1.setPassword("marvin");
            admin1.setRol("ADMIN");
            admin1.setNombre("Marvin Antonio");
            admin1.setApellido("Martinez Martinez");
            admin1.setTelefono("2291842342");
            usuarioService.crearUsuario(admin1);

            // Crear usuario admin
            Usuario admin2 = new Usuario();
            admin2.setUsername("othon_lozano");
            admin2.setEmail("othon@netcinema.com");
            admin2.setPassword("othon");
            admin2.setRol("ADMIN");
            admin2.setNombre("Othon");
            admin2.setApellido("Lozano Vidal");
            admin2.setTelefono("2261073734");
            usuarioService.crearUsuario(admin2);

            // Crear usuario cliente
            Usuario cliente1 = new Usuario();
            cliente1.setUsername("yuli_berumen");
            cliente1.setEmail("ybd@gmail.com");
            cliente1.setPassword("yuli");
            cliente1.setRol("CLIENTE");
            cliente1.setNombre("Yuliana");
            cliente1.setApellido("Berumen Diaz");
            cliente1.setTelefono("2291074567");
            usuarioService.crearUsuario(cliente1);

            Usuario cliente2 = new Usuario();
            cliente2.setUsername("olimpia_moct");
            cliente2.setEmail("oli@gmail.com");
            cliente2.setPassword("olimpia");
            cliente2.setRol("CLIENTE");
            cliente2.setNombre("Olimpia de los Angeles");
            cliente2.setApellido("Moctezuma Juan");
            cliente2.setTelefono("2290103234");
            usuarioService.crearUsuario(cliente2);

            // Crear películas
            Pelicula pelicula1 = new Pelicula();
            pelicula1.setTitulo("Origen");
            pelicula1.setDescripcion("Un ladrón que roba secretos del subconsciente durante el sueño");
            pelicula1.setGeneros(Arrays.asList("Ciencia Ficción", "Acción", "Thriller"));
            pelicula1.setDuracion(148);
            pelicula1.setClasificacion("B");
            pelicula1.setDirector("Christopher Nolan");
            pelicula1.setActores(Arrays.asList("Leonardo DiCaprio", "Marion Cotillard", "Ellen Page"));
            pelicula1.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/tXQvtRWfkUUnWJAn2tN3jERIUG.jpg");
            pelicula1.setTrailerUrl("https://youtu.be/RV9L7ui9Cn8");
            peliculaService.crearPelicula(pelicula1);

            Pelicula pelicula2 = new Pelicula();
            pelicula2.setTitulo("Interestelar");
            pelicula2.setDescripcion("Un grupo de exploradores viaja a través de un agujero de gusano");
            pelicula2.setGeneros(Arrays.asList("Ciencia Ficción", "Drama"));
            pelicula2.setDuracion(169);
            pelicula2.setClasificacion("B");
            pelicula2.setDirector("Christopher Nolan");
            pelicula2.setActores(Arrays.asList("Matthew McConaughey", "Anne Hathaway"));
            pelicula2.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/fbUwSqYIP0isCiJXey3staY3DNn.jpg");
            pelicula2.setTrailerUrl("https://youtu.be/4OM1nVprhTc");
            peliculaService.crearPelicula(pelicula2);

            // 1. TRANSFORMERS
            Pelicula pelicula3 = new Pelicula();
            pelicula3.setTitulo("Transformers");
            pelicula3.setDescripcion("Una antigua guerra entre dos razas de robots cibernéticos llega a la Tierra, y los adolescentes se ven envueltos en el conflicto.");
            pelicula3.setGeneros(Arrays.asList("Acción", "Ciencia Ficción", "Aventura"));
            pelicula3.setDuracion(144);
            pelicula3.setClasificacion("B");
            pelicula3.setDirector("Michael Bay");
            pelicula3.setActores(Arrays.asList("Shia LaBeouf", "Megan Fox", "Josh Duhamel"));
            pelicula3.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/qJum5ArxWCquaDmK0OXDKecRIeq.jpg");
            pelicula3.setTrailerUrl("https://youtu.be/ahYjx0rQvqQ");
            peliculaService.crearPelicula(pelicula3);

            // 2. EL CONJURO
            Pelicula pelicula4 = new Pelicula();
            pelicula4.setTitulo("El Conjuro");
            pelicula4.setDescripcion("Los investigadores paranormales Ed y Lorraine Warren trabajan para ayudar a una familia aterrorizada por una presencia oscura en su granja.");
            pelicula4.setGeneros(Arrays.asList("Terror", "Thriller", "Suspenso"));
            pelicula4.setDuracion(112);
            pelicula4.setClasificacion("C");
            pelicula4.setDirector("James Wan");
            pelicula4.setActores(Arrays.asList("Vera Farmiga", "Patrick Wilson", "Lili Taylor"));
            pelicula4.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/10ir0eISr3p1MF1mjZwGTx7u4vv.jpg");
            pelicula4.setTrailerUrl("https://youtu.be/1kOlrEwTfco");
            peliculaService.crearPelicula(pelicula4);

            // 3. AVENGERS
            Pelicula pelicula5 = new Pelicula();
            pelicula5.setTitulo("Los Vengadores");
            pelicula5.setDescripcion("Los superhéroes más poderosos de la Tierra deben unirse y aprender a luchar como un equipo para detener a Loki y su ejército alienígena.");
            pelicula5.setGeneros(Arrays.asList("Acción", "Aventura", "Ciencia Ficción"));
            pelicula5.setDuracion(143);
            pelicula5.setClasificacion("B");
            pelicula5.setDirector("Joss Whedon");
            pelicula5.setActores(Arrays.asList("Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Chris Hemsworth"));
            pelicula5.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/tyKKKSvjEgDVQ6vtm8vzL5Zx06c.jpg");
            pelicula5.setTrailerUrl("https://youtu.be/HQIiYqOVTWo");
            peliculaService.crearPelicula(pelicula5);

            // 4. HARRY POTTER Y LA PIEDRA FILOSOFAL
            Pelicula pelicula6 = new Pelicula();
            pelicula6.setTitulo("Harry Potter y la Piedra Filosofal");
            pelicula6.setDescripcion("Un niño huérfano se entera de que es un mago y asiste a una escuela de magia donde descubre secretos sobre su pasado y su destino.");
            pelicula6.setGeneros(Arrays.asList("Fantasía", "Aventura", "Familia"));
            pelicula6.setDuracion(152);
            pelicula6.setClasificacion("A");
            pelicula6.setDirector("Chris Columbus");
            pelicula6.setActores(Arrays.asList("Daniel Radcliffe", "Emma Watson", "Rupert Grint"));
            pelicula6.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/3MKK7vAJLtSkBTABMTjxf6TOCo3.jpg");
            pelicula6.setTrailerUrl("https://youtu.be/WE4AJuIvG1Y");
            peliculaService.crearPelicula(pelicula6);

            // 5. EL SEÑOR DE LOS ANILLOS: LA COMUNIDAD DEL ANILLO
            Pelicula pelicula7 = new Pelicula();
            pelicula7.setTitulo("El Señor de los Anillos: La Comunidad del Anillo");
            pelicula7.setDescripcion("Un hobbit tímido de la Comarca y ocho compañeros emprenden un viaje para destruir el poderoso Anillo Único y salvar la Tierra Media.");
            pelicula7.setGeneros(Arrays.asList("Fantasía", "Aventura", "Acción"));
            pelicula7.setDuracion(178);
            pelicula7.setClasificacion("B");
            pelicula7.setDirector("Peter Jackson");
            pelicula7.setActores(Arrays.asList("Elijah Wood", "Ian McKellen", "Viggo Mortensen", "Orlando Bloom"));
            pelicula7.setPosterUrl("https://www.themoviedb.org/t/p/w600_and_h900_face/9xtH1RmAzQ0rrMBNUMXstb2s3er.jpg");
            pelicula7.setTrailerUrl("https://youtu.be/3GJp6p_mgPo");
            peliculaService.crearPelicula(pelicula7);

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


}