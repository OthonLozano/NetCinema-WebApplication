import api from './api';

export const authService = {
    // Login
    login: async (username, password) => {
        const response = await api.post('/usuarios/login', {
            username,
            password,
        });
        return response.data;
    },

    // Registrar usuario
    register: async (usuario) => {
        const response = await api.post('/usuarios', usuario);
        return response.data;
    },

    // Guardar token en localStorage
    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    // Obtener token
    getToken: () => {
        return localStorage.getItem('token');
    },

    // Eliminar token (logout)
    removeToken: () => {
        localStorage.removeItem('token');
    },

    // Guardar usuario en localStorage
    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    // Obtener usuario
    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Eliminar usuario
    removeUser: () => {
        localStorage.removeItem('user');
    },

    // Logout completo
    logout: () => {
        authService.removeToken();
        authService.removeUser();
    },
};