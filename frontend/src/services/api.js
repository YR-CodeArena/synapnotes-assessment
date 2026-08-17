import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("synapnotes_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("synapnotes_token");
      localStorage.removeItem("synapnotes_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (payload) => api.post("/api/auth/register", payload),
  me: () => api.get("/api/auth/me"),
};

export const meetingsApi = {
  list: (params) => api.get("/api/meetings", { params }),
  get: (id) => api.get(`/api/meetings/${id}`),
  create: (payload) => api.post("/api/meetings", payload),
  update: (id, payload) => api.put(`/api/meetings/${id}`, payload),
  remove: (id) => api.delete(`/api/meetings/${id}`),
  reprocess: (id) => api.post(`/api/meetings/${id}/reprocess-ai`),
};

export const actionsApi = {
  list: (params) => api.get("/api/actions", { params }),
  create: (payload) => api.post("/api/actions", payload),
  update: (id, payload) => api.put(`/api/actions/${id}`, payload),
  remove: (id) => api.delete(`/api/actions/${id}`),
};

export const analyticsApi = {
  dashboard: () => api.get("/api/analytics/dashboard"),
};

export default api;
