package com.netcinema.SB.MongoDB.controller;

import com.netcinema.SB.MongoDB.model.Usuario;
import com.netcinema.SB.MongoDB.dto.UsuarioRegistroDTO;
import com.netcinema.SB.MongoDB.service.UsuarioService;
import com.netcinema.SB.MongoDB.dto.LoginDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@RequestBody UsuarioRegistroDTO usuarioDTO) {
        try{
            Usuario usuario = Usuario.builder()
                    .nombre(usuarioDTO.getNombre())
                    .email(usuarioDTO.getEmail())
                    .password(usuarioDTO.getPassword())
                    .build();
            return ResponseEntity.ok(usuarioService.registrar(usuario));
        }catch(Exception e) {
            return ResponseEntity.badRequest().body("Error al registrar el usuario: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        try {
            Usuario usuario = usuarioService.validarCredenciales(dto.getEmail(), dto.getPassword());
            return ResponseEntity.ok(usuario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable String id) {
        try {
            return ResponseEntity.ok(usuarioService.obtenerPorId(id));
        }catch(RuntimeException e) {
        return ResponseEntity.notFound().build();
        }
    }
}

