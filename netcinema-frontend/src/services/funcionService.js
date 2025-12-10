import api from './api';

export const funcionService = {
    // Obtener funciones futuras
    getFuturas: async () => {
        const response = await api.get('/funciones/futuras');
        return response.data;
    },

    // Obtener funciones por película
    getByPelicula: async (peliculaId) => {
        const response = await api.get(`/funciones/pelicula/${peliculaId}`);
        return response.data;
    },

    // Obtener función por ID
    getById: async (id) => {
        const response = await api.get(`/funciones/${id}`);
        return response.data;
    },

    // Crear función
    create: async (funcion) => {
        const response = await api.post('/funciones', funcion);
        return response.data;
    },

    // Bloquear asientos
    bloquearAsientos: async (funcionId, asientos) => {
        const response = await api.post(`/funciones/${funcionId}/bloquear-asientos`, {
            asientos,
        });
        return response.data;
    },

    // Liberar asientos
    liberarAsientos: async (funcionId, asientos) => {
        const response = await api.post(`/funciones/${funcionId}/liberar-asientos`, {
            asientos,
        });
        return response.data;
    },
};