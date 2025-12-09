package com.cine.cinema.controller;

import com.cine.cinema.dto.ApiResponse;
import com.cine.cinema.dto.LoginRequest;
import com.cine.cinema.dto.UsuarioDTO;
import com.cine.cinema.model.Usuario;
import com.cine.cinema.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            boolean valido = usuarioService.validarCredenciales(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            if (valido) {
                Usuario usuario = usuarioService.obtenerPorUsername(loginRequest.getUsername())
                        .orElseThrow();

                return ResponseEntity.ok(new ApiResponse(
                        true,
                        "Login exitoso",
                        usuario
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse(false, "Credenciales inválidas"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error en el login: " + e.getMessage()));
        }
    }

    // Crear usuario (Registro)
    @PostMapping
    public ResponseEntity<ApiResponse> crearUsuario(@Valid @RequestBody UsuarioDTO usuarioDTO) {
        try {
            Usuario usuario = new Usuario();
            usuario.setUsername(usuarioDTO.getUsername());
            usuario.setEmail(usuarioDTO.getEmail());
            usuario.setPassword(usuarioDTO.getPassword());
            usuario.setRol(usuarioDTO.getRol());
            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setApellido(usuarioDTO.getApellido());
            usuario.setTelefono(usuarioDTO.getTelefono());

            Usuario usuarioCreado = usuarioService.crearUsuario(usuario);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse(true, "Usuario creado exitosamente", usuarioCreado));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener todos los usuarios
    @GetMapping
    public ResponseEntity<ApiResponse> obtenerTodos() {
        try {
            List<Usuario> usuarios = usuarioService.obtenerTodos();
            return ResponseEntity.ok(new ApiResponse(true, "Usuarios obtenidos", usuarios));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(false, "Error al obtener usuarios: " + e.getMessage()));
        }
    }

    // Obtener usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> obtenerPorId(@PathVariable String id) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(id)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return ResponseEntity.ok(new ApiResponse(true, "Usuario encontrado", usuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Obtener usuario por username
    @GetMapping("/username/{username}")
    public ResponseEntity<ApiResponse> obtenerPorUsername(@PathVariable String username) {
        try {
            Usuario usuario = usuarioService.obtenerPorUsername(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            return ResponseEntity.ok(new ApiResponse(true, "Usuario encontrado", usuario));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> actualizarUsuario(
            @PathVariable String id,
            @Valid @RequestBody UsuarioDTO usuarioDTO) {
        try {
            Usuario usuario = new Usuario();
            usuario.setUsername(usuarioDTO.getUsername());
            usuario.setEmail(usuarioDTO.getEmail());
            usuario.setPassword(usuarioDTO.getPassword());
            usuario.setRol(usuarioDTO.getRol());
            usuario.setNombre(usuarioDTO.getNombre());
            usuario.setApellido(usuarioDTO.getApellido());
            usuario.setTelefono(usuarioDTO.getTelefono());

            Usuario usuarioActualizado = usuarioService.actualizarUsuario(id, usuario);

            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "Usuario actualizado exitosamente",
                    usuarioActualizado
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Eliminar usuario (soft delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> eliminarUsuario(@PathVariable String id) {
        try {
            usuarioService.eliminarUsuario(id);
            return ResponseEntity.ok(new ApiResponse(true, "Usuario desactivado exitosamente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // Eliminar usuario permanentemente
    @DeleteMapping("/{id}/permanente")
    public ResponseEntity<ApiResponse> eliminarUsuarioPermanente(@PathVariable String id) {
        try {
            usuarioService.eliminarUsuarioPermanente(id);
            return ResponseEntity.ok(new ApiResponse(true, "Usuario eliminado permanentemente"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}