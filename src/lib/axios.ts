import axios from "axios";

// Matches the API_BASE_URL used in src/app/login/page.tsx and signup/page.tsx
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
 
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Same localStorage key the login page saves the JWT under
    const token = window.localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ??
      error?.response?.data?.message ??
      error?.message ??
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);
