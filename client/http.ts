import axios from "axios";

// Use environment variable or default to localhost
export const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:3006";

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle Auth Errors
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  },
);
