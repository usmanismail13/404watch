import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "../Navbar.css";

function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      setIsAuthenticated(false);
      setMenuOpen(false);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        🔍 404Watch
      </Link>

      <button
        className="navbar-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>
          🏠 Home
        </NavLink>

        <NavLink to="/pricing" onClick={closeMenu}>
          💰 Pricing
        </NavLink>

        {isAuthenticated === false && (
          <>
            <NavLink to="/login" onClick={closeMenu}>
              🔐 Login
            </NavLink>

            <NavLink to="/register" onClick={closeMenu}>
              📝 Register
            </NavLink>
          </>
        )}

        {isAuthenticated === true && (
          <>
            <NavLink to="/dashboard" onClick={closeMenu}>
              📊 Dashboard
            </NavLink>

            <NavLink to="/errors" onClick={closeMenu}>
              🚨 404 Errors
            </NavLink>

            <NavLink to="/support" onClick={closeMenu}>
              🆘 Support
            </NavLink>
            <NavLink to="/account" onClick={closeMenu}>
  👤 Account
</NavLink>


            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;