import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/client";
import NavBar from "../components/NavBar";
import { Card, BtnPrimary, inputCls } from "../components/ui";

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
      sessionStorage.setItem("token", data.token);
      if (data.refreshToken) sessionStorage.setItem("refreshToken", data.refreshToken);
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
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <NavBar auth={auth} />
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
        <div className="text-center">
          <span className="inline-block rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white">
            CREDX
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500">Access your secure banking workspace.</p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} data-testid="login-form" className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                data-testid="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                data-testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                required
              />
            </label>
            {error && (
              <div data-testid="login-error" className="text-sm text-red-600">
                {error}
              </div>
            )}
            <BtnPrimary type="submit" data-testid="login-submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </BtnPrimary>
          </form>
        </Card>
        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link to="/register" className="font-semibold text-emerald-600">
            Open an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
