const API_BASE = '/api';

export const api = {
    async post(endpoint, data) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    async get(endpoint) {
        const response = await fetch(`${API_BASE}${endpoint}`);
        return response.json();
    },

    async upload(endpoint, file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            body: formData,
        });
        return response.json();
    }
};
