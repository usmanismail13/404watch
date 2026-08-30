import { Link, NavLink } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "../Navbar.css";

function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setIsAuthenticated(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav>
      <Link to="/" className="navbar-brand">
  🔍 404Watch
</Link>


      <div>
        <NavLink to="/">🏠 Home</NavLink>
        <NavLink to="/pricing">💰 Pricing</NavLink>

        {isAuthenticated === false && (
          <>
            <NavLink to="/login">🔐 Login</NavLink>
            <NavLink to="/register">📝 Register</NavLink>
          </>
        )}

        {isAuthenticated === true && (
          <>
            <NavLink to="/dashboard">📊 Dashboard</NavLink>
            <NavLink to="/support">🆘 Support</NavLink>
            <button onClick={handleLogout}>🚪 Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;