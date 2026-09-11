import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import NavBar from "../components/NavBar";

const RegisterPage = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", form);
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <NavBar />
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-16">
        <div>
          <h1 className="text-3xl font-semibold text-white">Open a secure account</h1>
          <p className="text-sm text-muted">
            Submit your details. An admin will verify and activate access.
          </p>
        </div>
        <form onSubmit={onSubmit} data-testid="register-form" className="glass rounded-xl border border-slate-800 p-6 shadow-xl">
          <div className="space-y-4">
            <label className="block text-sm text-slate-200">
              Full name
              <input
                name="name"
                data-testid="register-name"
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white outline-none focus:border-accent"
                required
              />
            </label>
            <label className="block text-sm text-slate-200">
              Work email
              <input
                type="email"
                name="email"
                data-testid="register-email"
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white outline-none focus:border-accent"
                required
              />
            </label>
            <label className="block text-sm text-slate-200">
              Password
              <input
                type="password"
                name="password"
                data-testid="register-password"
                value={form.password}
                onChange={onChange}
                className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white outline-none focus:border-accent"
                required
              />
            </label>
            {message && <div data-testid="register-success" className="text-sm text-success">{message}</div>}
            {error && <div data-testid="register-error" className="text-sm text-danger">{error}</div>}
            <button
              type="submit"
              data-testid="register-submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface hover:bg-sky-400 disabled:opacity-70"
            >
              {loading ? "Submitting..." : "Submit for approval"}
            </button>
          </div>
        </form>
        <p className="text-sm text-slate-400">
          Already verified?{" "}
          <Link to="/login" className="text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
