import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { Card, BtnPrimary, Badge, inputCls } from "../components/ui";

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
      const refreshToken = sessionStorage.getItem("refreshToken");
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
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:border-red-400 hover:text-red-600"
          >
            Logout
          </button>
        }
      >
        <div className="grid max-w-2xl grid-cols-1 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                {(profile?.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-slate-900">{profile?.name || "..."}</div>
                <div className="text-sm text-slate-500">{profile?.email || "..."}</div>
              </div>
              <span className="ml-auto">
                <Badge tone="info">{profile?.role || "USER"}</Badge>
              </span>
            </div>
            <form onSubmit={onSubmit} data-testid="profile-form" className="mt-4 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Full name
                <input
                  data-testid="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls}
                />
              </label>
              {message && <div className="text-sm text-emerald-600">{message}</div>}
              <BtnPrimary type="submit" data-testid="profile-save">
                Save changes
              </BtnPrimary>
            </form>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-bold text-slate-900">Change password</div>
            <form onSubmit={onPasswordChange} data-testid="password-form" className="mt-3 space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Current password
                <input
                  type="password"
                  data-testid="password-current"
                  value={pw.currentPassword}
                  onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                  className={inputCls}
                  required
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input
                  type="password"
                  data-testid="password-new"
                  value={pw.newPassword}
                  onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                  className={inputCls}
                  required
                />
              </label>
              {pwMessage && (
                <div data-testid="password-success" className="text-sm text-emerald-600">
                  {pwMessage}
                </div>
              )}
              {pwError && (
                <div data-testid="password-error" className="text-sm text-red-600">
                  {pwError}
                </div>
              )}
              <BtnPrimary type="submit" data-testid="password-submit">
                Change password
              </BtnPrimary>
            </form>
          </Card>
        </div>
      </PageShell>
    </div>
  );
};

export default ProfilePage;
