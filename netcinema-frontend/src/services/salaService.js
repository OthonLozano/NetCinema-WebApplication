// src/services/salaService.js
import api from './api';

export const salaService = {
    // Obtener todas las salas
    getAll: async () => {
        const response = await api.get('/salas');
        return response.data;
    },

    // Obtener salas activas
    getActivas: async () => {
        const response = await api.get('/salas/activas');
        return response.data;
    },

    // Obtener sala por ID
    getById: async (id) => {
        const response = await api.get(`/salas/${id}`);
        return response.data;
    },

    // Crear sala
    create: async (sala) => {
        const response = await api.post('/salas', sala);
        return response.data;
    },

    // Actualizar sala
    update: async (id, sala) => {
        const response = await api.put(`/salas/${id}`, sala);
        return response.data;
    },

    // Desactivar sala
    desactivar: async (id) => {
        const response = await api.patch(`/salas/${id}/desactivar`);
        return response.data;
    },

    // Eliminar sala
    delete: async (id) => {
        const response = await api.delete(`/salas/${id}`);
        return response.data;
    },
};
