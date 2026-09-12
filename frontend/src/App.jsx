import { useEffect, useMemo, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PlatformPage from "./pages/PlatformPage";
import SecurityPage from "./pages/SecurityPage";
import OperationsPage from "./pages/OperationsPage";
import UserDashboard from "./pages/UserDashboard";
import TransferPage from "./pages/TransferPage";
import TransactionsPage from "./pages/TransactionsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminApprovals from "./pages/AdminApprovals";
import AdminAccounts from "./pages/AdminAccounts";
import AdminTransactions from "./pages/AdminTransactions";

const Protected = ({ children, role }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
};

// Bank homepage is for guests only: signed-in users only ever see their own
// data, so they are routed straight to their workspace (admins to /admin).
const LandingRoute = () => {
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  if (token && user?.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (token) return <Navigate to="/dashboard" replace />;
  return <HomePage />;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const authContext = useMemo(
    () => ({
      user,
      setUser: (payload) => {
        setUser(payload);
        if (payload) localStorage.setItem("user", JSON.stringify(payload));
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      },
    }),
    [user],
  );

  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/platform" element={<PlatformPage auth={authContext} />} />
      <Route path="/security" element={<SecurityPage auth={authContext} />} />
      <Route path="/operations" element={<OperationsPage auth={authContext} />} />
      <Route path="/login" element={<LoginPage auth={authContext} />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <UserDashboard auth={authContext} />
          </Protected>
        }
      />
      <Route
        path="/transfer"
        element={
          <Protected>
            <TransferPage auth={authContext} />
          </Protected>
        }
      />
      <Route
        path="/transactions"
        element={
          <Protected>
            <TransactionsPage auth={authContext} />
          </Protected>
        }
      />
      <Route
        path="/profile"
        element={
          <Protected>
            <ProfilePage auth={authContext} />
          </Protected>
        }
      />

      <Route
        path="/admin"
        element={
          <Protected role="ADMIN">
            <AdminDashboard />
          </Protected>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <Protected role="ADMIN">
            <AdminApprovals />
          </Protected>
        }
      />
      <Route
        path="/admin/accounts"
        element={
          <Protected role="ADMIN">
            <AdminAccounts />
          </Protected>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <Protected role="ADMIN">
            <AdminTransactions />
          </Protected>
        }
      />
    </Routes>
  );
}

export default App;
