import api from './api';

export const peliculaService = {
    // Obtener cartelera
    getCartelera: async () => {
        const response = await api.get('/peliculas/cartelera');
        return response.data;
    },

    // Obtener todas las películas
    getAll: async () => {
        const response = await api.get('/peliculas');
        return response.data;
    },

    // Obtener película por ID
    getById: async (id) => {
        const response = await api.get(`/peliculas/${id}`);
        return response.data;
    },

    // Crear película
    create: async (pelicula) => {
        const response = await api.post('/peliculas', pelicula);
        return response.data;
    },

    // Actualizar película
    update: async (id, pelicula) => {
        const response = await api.put(`/peliculas/${id}`, pelicula);
        return response.data;
    },

    // Eliminar película
    delete: async (id) => {
        const response = await api.delete(`/peliculas/${id}`);
        return response.data;
    },

    // Buscar por título
    searchByTitle: async (titulo) => {
        const response = await api.get(`/peliculas/buscar/titulo/${titulo}`);
        return response.data;
    },
};