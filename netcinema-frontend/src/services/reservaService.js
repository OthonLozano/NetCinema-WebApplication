import api from './api';

export const reservaService = {
    // Crear reserva
    create: async (reserva) => {
        const response = await api.post('/reservas', reserva);
        return response.data;
    },

    // Confirmar reserva
    confirmar: async (reservaId, metodoPago) => {
        const response = await api.post(`/reservas/${reservaId}/confirmar`, {
            metodoPago,
        });
        return response.data;
    },

    // Buscar por código
    getByCodigo: async (codigo) => {
        const response = await api.get(`/reservas/codigo/${codigo}`);
        return response.data;
    },

    // Obtener todas las reservas
    getAll: async () => {
        const response = await api.get('/reservas');
        return response.data;
    },

    // Cancelar reserva
    cancelar: async (reservaId) => {
        const response = await api.post(`/reservas/${reservaId}/cancelar`);
        return response.data;
    },
};