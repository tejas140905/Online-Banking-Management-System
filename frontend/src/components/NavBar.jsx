import { Link } from "react-router-dom";
import api from "../api/client";

const NavBar = ({ auth }) => {
  // Server-side logout revokes the refresh token; local state clears regardless.
  const onLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {
      // logout locally even if the server call fails
    }
    auth.logout?.();
  };
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="rounded bg-accent px-2 py-1 text-sm font-bold text-surface">CREDX</span>
          <span>Digital Banking</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-200">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          {auth?.user ? (
            <>
              <Link to="/dashboard" className="hover:text-accent">
                Dashboard
              </Link>
              {auth.user.role === "ADMIN" && (
                <Link to="/admin" className="hover:text-accent">
                  Admin
                </Link>
              )}
              <button
                onClick={onLogout}
                data-testid="logout-button"
                className="rounded border border-slate-700 px-3 py-1 hover:border-accent hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/platform" className="hover:text-accent">
                Platform
              </Link>
              <Link to="/security" className="hover:text-accent">
                Security
              </Link>
              <Link to="/operations" className="hover:text-accent">
                Operations
              </Link>
              <Link to="/login" className="hover:text-accent">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-accent px-3 py-1 font-semibold text-surface hover:bg-sky-400"
              >
                Open Account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
