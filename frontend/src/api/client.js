import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
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
      sessionStorage.getItem("refreshToken")
    ) {
      original._retried = true;
      try {
        refreshing =
          refreshing ||
          axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken: sessionStorage.getItem("refreshToken"),
          });
        const { data } = await refreshing;
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
      } finally {
        refreshing = null;
      }
    }
    throw error;
  },
);

export default api;
