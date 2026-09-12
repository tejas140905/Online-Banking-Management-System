import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

const ProfilePage = ({ auth }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMessage, setPwMessage] = useState(null);
  const [pwError, setPwError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await api.get("/user/profile");
      setProfile(data.user);
      setName(data.user?.name || "");
    };
    fetchProfile();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/user/profile", { name });
    setMessage(data.message);
  };

  const onPasswordChange = async (e) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    try {
      const { data } = await api.put("/user/password", pw);
      setPwMessage(data.message);
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Password change failed");
    }
  };

  // Logout lives inside Profile: revoke the refresh token server-side,
  // then clear local auth state (Protected routes redirect to login).
  const onLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      // logout locally even if the server call fails
    }
    auth.logout();
  };

  return (
    <div data-testid="profile-page">
      <NavBar auth={auth} />
      <PageShell
        title="Profile"
        tabs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Transfer", href: "/transfer" },
          { label: "Transactions", href: "/transactions" },
          { label: "Profile", href: "/profile", active: true },
        ]}
        actions={
          <button
            onClick={onLogout}
            data-testid="logout-button"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:border-accent hover:text-accent"
          >
            Logout
          </button>
        }
      >
        <div className="glass max-w-lg rounded-xl border border-slate-800 p-6">
          <div className="space-y-4 text-sm text-slate-200">
            <div>
              <div className="text-muted">Email</div>
              <div className="text-white">{profile?.email || "..."}</div>
            </div>
            <div>
              <div className="text-muted">Role</div>
              <div className="text-white">{profile?.role}</div>
            </div>
            <form onSubmit={onSubmit} data-testid="profile-form" className="space-y-3">
              <label className="block text-sm text-slate-200">
                Full name
                <input
                  data-testid="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                />
              </label>
              {message && <div className="text-success">{message}</div>}
              <button
                type="submit"
                data-testid="profile-save"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface"
              >
                Save changes
              </button>
            </form>
            <form onSubmit={onPasswordChange} data-testid="password-form" className="space-y-3 border-t border-slate-800 pt-4">
              <div className="text-sm font-semibold text-white">Change password</div>
              <label className="block text-sm text-slate-200">
                Current password
                <input
                  type="password"
                  data-testid="password-current"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                  required
                />
              </label>
              <label className="block text-sm text-slate-200">
                New password
                <input
                  type="password"
                  data-testid="password-new"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                  required
                />
              </label>
              {pwMessage && <div data-testid="password-success" className="text-success">{pwMessage}</div>}
              {pwError && <div data-testid="password-error" className="text-danger">{pwError}</div>}
              <button
                type="submit"
                data-testid="password-submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface"
              >
                Change password
              </button>
            </form>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default ProfilePage;
