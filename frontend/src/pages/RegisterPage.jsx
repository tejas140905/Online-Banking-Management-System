import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import NavBar from "../components/NavBar";
import { Card, BtnPrimary, inputCls } from "../components/ui";

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
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <NavBar />
      <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Open a secure account</h1>
          <p className="text-sm text-slate-500">
            Submit your details. An admin will verify and activate access.
          </p>
        </div>
        <Card className="p-6">
          <form onSubmit={onSubmit} data-testid="register-form" className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                name="name"
                data-testid="register-name"
                value={form.name}
                onChange={onChange}
                className={inputCls}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Work email
              <input
                type="email"
                name="email"
                data-testid="register-email"
                value={form.email}
                onChange={onChange}
                className={inputCls}
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                name="password"
                data-testid="register-password"
                value={form.password}
                onChange={onChange}
                className={inputCls}
                required
              />
            </label>
            {message && (
              <div data-testid="register-success" className="text-sm text-emerald-600">
                {message}
              </div>
            )}
            {error && (
              <div data-testid="register-error" className="text-sm text-red-600">
                {error}
              </div>
            )}
            <BtnPrimary type="submit" data-testid="register-submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit for approval"}
            </BtnPrimary>
          </form>
        </Card>
        <p className="text-center text-sm text-slate-500">
          Already verified?{" "}
          <Link to="/login" className="font-semibold text-emerald-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
