import axios from "axios";

// ✅ B-12: The server already issues an HttpOnly cookie on login.
// HttpOnly cookies are invisible to JavaScript — nothing on the page can
// steal them, even if there is an XSS vulnerability. That is strictly more
// secure than any form of browser storage (sessionStorage OR localStorage),
// both of which are fully readable by any script running on the page.
//
// The old code stored the token in sessionStorage AND the server sent an
// HttpOnly cookie, meaning two auth systems ran simultaneously and could
// conflict (mismatched 401s, stale tokens, etc.).
//
// Fix: removed all sessionStorage references. withCredentials: true tells
// Axios to send the HttpOnly cookie automatically on every request.
// No manual Authorization header needed.

console.log("BASE URL:", import.meta.env.VITE_BASE_URL);
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:5000/api",
  withCredentials: true,                          // sends HttpOnly cookie automatically
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes("/auth/");
    if (err.response?.status === 401 && !isAuthRoute) {
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;