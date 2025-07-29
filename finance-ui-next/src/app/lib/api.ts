import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

console.log("API base =", process.env.NEXT_PUBLIC_API_BASE);

api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("accessToken");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      // optional: call /auth/refresh and retry once
      sessionStorage.removeItem("accessToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);
