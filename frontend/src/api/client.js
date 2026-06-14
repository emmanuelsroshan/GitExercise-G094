import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("sc_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)  => api.post("/auth/register", data),
  login:    (data)  => api.post("/auth/login", data),
};

// ── Profile ────────────────────────────────────────────────────────────────────
export const profileAPI = {
  getOwn:    ()     => api.get("/profile"),
  update:    (data) => api.put("/profile", data),
  getUser:   (id)   => api.get(`/users/${id}`),
};

// ── Search ─────────────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (params) => api.get("/search", { params }),
  match:  (id)     => api.get(`/match/${id}`),
};

// ── Help Requests ──────────────────────────────────────────────────────────────
export const requestsAPI = {
  list:   ()             => api.get("/requests"),
  create: (data)         => api.post("/requests", data),
  update: (id, status)   => api.put(`/requests/${id}`, { status }),
};

// ── Messages ───────────────────────────────────────────────────────────────────
export const messagesAPI = {
  conversations: ()         => api.get("/messages/conversations"),
  unread:        ()         => api.get("/messages/unread"),
  thread:        (otherId)  => api.get(`/messages/${otherId}`),
  send:          (otherId, content) => api.post(`/messages/${otherId}`, { content }),
};

// ── Reviews ────────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  add:  (data)  => api.post("/reviews", data),
  get:  (uid)   => api.get(`/reviews/${uid}`),
};

// ── Admin ──────────────────────────────────────────────────────────────────────
export const adminAPI = {
  users:      ()          => api.get("/admin/users"),
  updateUser: (id, data)  => api.put(`/admin/users/${id}`, data),
  deleteUser: (id)        => api.delete(`/admin/users/${id}`),
  stats:      ()          => api.get("/admin/stats"),
  analytics:  ()          => api.get("/analytics"),
};
