import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* ✅ ATTACH TOKEN TO EVERY REQUEST */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* HANDLE UNAUTHORIZED RESPONSE */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/barber/login";
    }
    return Promise.reject(err);
  }
);

export default API;
