import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

const ProfilePage = ({ auth }) => {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState(null);

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
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default ProfilePage;
