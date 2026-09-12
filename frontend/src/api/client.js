import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Silent session renewal: on an expired access token, rotate via the stored
// refresh token and retry the original request once. Auth endpoints are
// excluded so bad credentials surface immediately instead of looping.
let refreshing = null;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const url = original?.url || "";
    if (
      error.response?.status === 401 &&
      !original?._retried &&
      !url.includes("/auth/") &&
      localStorage.getItem("refreshToken")
    ) {
      original._retried = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken: localStorage.getItem("refreshToken"),
          });
        const { data } = await refreshing;
        localStorage.setItem("token", data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } finally {
        refreshing = null;
      }
    }
    throw error;
  },
);

export default api;
