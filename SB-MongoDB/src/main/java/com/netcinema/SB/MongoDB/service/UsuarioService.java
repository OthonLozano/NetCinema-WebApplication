package com.netcinema.SB.MongoDB.service;

import com.netcinema.SB.MongoDB.model.Usuario;
import com.netcinema.SB.MongoDB.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    //obtener por id
    public Usuario obtenerPorId(String id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    //buscar por email
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    //registar usuario
    public Usuario registrarUsuario(Usuario usuario) {
        if(usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("Usuario ya existe");
        }
        return usuarioRepository.save(usuario);
    }

    //actualizar usuario
    public Usuario actualizarUsuario(String id, Usuario usuario) {
        if(!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado");
        }
        usuario.setId(id);
        return usuarioRepository.save(usuario);
    }

    //validar credenciales
    public Usuario validarCredenciales(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));
        if(!usuario.getPassword().equals(password)) {
            throw new RuntimeException("Credenciales invalidas");
        }
        return usuario;
    }

    //registrar usuario
    public String registrar(Usuario usuario) {
        if(usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El usuario ya existe");
        }
        usuarioRepository.save(usuario);
        return "Usuario registrado exitosamente";
    }
}
