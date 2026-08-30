import { Link } from "react-router-dom";
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
      <h2>404Watch</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/pricing">Pricing</Link>

        {isAuthenticated === false && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {isAuthenticated === true && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/support">🆘 Support</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
