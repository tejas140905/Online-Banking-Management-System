import { Link } from "react-router-dom";

const NavBar = ({ auth }) => {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <span className="rounded-lg bg-emerald-600 px-2 py-1 text-sm font-bold text-white">CREDX</span>
          <span>Digital Banking</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <Link to="/" className="hover:text-emerald-600">
            Home
          </Link>
          {auth?.user ? (
            <>
              <Link to="/dashboard" className="hover:text-emerald-600">
                Dashboard
              </Link>
              {auth.user.role === "ADMIN" && (
                <Link to="/admin" className="hover:text-emerald-600">
                  Admin
                </Link>
              )}
              <Link to="/profile" className="hover:text-emerald-600">
                Profile
              </Link>
            </>
          ) : (
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Secure Digital Banking
            </span>
          )}
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
