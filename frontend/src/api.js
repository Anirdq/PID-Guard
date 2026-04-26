import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": "PidGuard-Demo-Key"
  },
});

export const detectInjection = (prompt) =>
  api.post("/detect", { prompt }).then((r) => r.data);

export const getHistory = (limit = 50) =>
  api.get(`/history?limit=${limit}`).then((r) => r.data);

export default api;
