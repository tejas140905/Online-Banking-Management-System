import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import NavBar from "../components/NavBar";

const LoginPage = ({ auth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      auth.setUser(data.user);
      // Role-based landing: admins go straight to the console where they can
      // see everything happening; customers go to their own dashboard.
      const fallback = data.user?.role === "ADMIN" ? "/admin" : "/dashboard";
      navigate(location.state?.from?.pathname || fallback);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <NavBar auth={auth} />
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-16">
        <div>
          <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-muted">Access your secure banking workspace.</p>
        </div>
        <form onSubmit={onSubmit} data-testid="login-form" className="glass rounded-xl border border-slate-800 p-6 shadow-xl">
          <div className="space-y-4">
            <label className="block text-sm text-slate-200">
              Email
              <input
                type="email"
                data-testid="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white outline-none focus:border-accent"
                required
              />
            </label>
            <label className="block text-sm text-slate-200">
              Password
              <input
                type="password"
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white outline-none focus:border-accent"
                required
              />
            </label>
            {error && <div data-testid="login-error" className="text-sm text-danger">{error}</div>}
            <button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface hover:bg-sky-400 disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <p className="text-sm text-slate-400">
          New here?{" "}
          <Link to="/register" className="text-accent">
            Open an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
