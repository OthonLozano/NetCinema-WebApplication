package com.cine.cinema.service;

import com.cine.cinema.model.Usuario;
import com.cine.cinema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Crear usuario
    public Usuario crearUsuario(Usuario usuario) {
        // Verificar si el username ya existe
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }

        // Verificar si el email ya existe
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El email ya está en uso");
        }

        // Encriptar contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        return usuarioRepository.save(usuario);
    }

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    // Obtener usuario por ID
    public Optional<Usuario> obtenerPorId(String id) {
        return usuarioRepository.findById(id);
    }

    // Obtener usuario por username
    public Optional<Usuario> obtenerPorUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }

    // Obtener usuario por email
    public Optional<Usuario> obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    // Actualizar usuario
    public Usuario actualizarUsuario(String id, Usuario usuarioActualizado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar campos
        usuario.setNombre(usuarioActualizado.getNombre());
        usuario.setApellido(usuarioActualizado.getApellido());
        usuario.setTelefono(usuarioActualizado.getTelefono());
        usuario.setEmail(usuarioActualizado.getEmail());
        usuario.setRol(usuarioActualizado.getRol());
        usuario.setActivo(usuarioActualizado.getActivo());

        // Si se proporciona nueva contraseña, encriptarla
        if (usuarioActualizado.getPassword() != null &&
                !usuarioActualizado.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioActualizado.getPassword()));
        }

        return usuarioRepository.save(usuario);
    }

    // Eliminar usuario (soft delete)
    public void eliminarUsuario(String id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    // Eliminar usuario permanentemente
    public void eliminarUsuarioPermanente(String id) {
        usuarioRepository.deleteById(id);
    }

    // Validar credenciales (para login)
    public boolean validarCredenciales(String username, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByUsername(username);

        if (usuario.isPresent() && usuario.get().getActivo()) {
            return passwordEncoder.matches(password, usuario.get().getPassword());
        }

        return false;
    }
}