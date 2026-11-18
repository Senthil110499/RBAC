import axios from "axios";

const baseURL = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5015"}/api`;

export const http = axios.create({ baseURL });

// Attach token automatically
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // 🔑 Backend down → Maintenance page
    if (err?.response?.status === 503) {
      window.location.href = "/maintenance";
    } else if (err.message === "Network Error") {
      window.location.href = "/maintenance";
    }

    return Promise.reject(err);
  }
);