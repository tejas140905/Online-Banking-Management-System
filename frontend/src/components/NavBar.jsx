import { Link } from "react-router-dom";

const NavBar = ({ auth }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="rounded bg-accent px-2 py-1 text-sm font-bold text-surface">APEX</span>
          <span>Digital Bank</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-200">
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
                onClick={auth.logout}
                className="rounded border border-slate-700 px-3 py-1 hover:border-accent hover:text-accent"
              >
                Logout
              </button>
            </>
          ) : (
            <>
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
