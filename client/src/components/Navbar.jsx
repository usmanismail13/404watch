import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "../Navbar.css";

function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);

  const menuButtonRef = useRef(null);
  const firstMenuItemRef = useRef(null);

  useEffect(() => {
    if (menuOpen) {
      // Move focus to the first navigation item when the
      // mobile menu opens.
      const focusTimer = setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 0);

      return () => clearTimeout(focusTimer);
    }

    return undefined;
  }, [menuOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && menuOpen) {
        event.preventDefault();

        setMenuOpen(false);

        // Return focus to the menu button.
        setTimeout(() => {
          menuButtonRef.current?.focus();
        }, 0);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

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
    <nav
      className="navbar"
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className="navbar-brand"
        onClick={closeMenu}
        aria-label="404Watch home"
      >
        🔍 404Watch
      </Link>

      <button
        ref={menuButtonRef}
        type="button"
        className="navbar-menu-button"
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label={
          menuOpen
            ? "Close navigation menu"
            : "Open navigation menu"
        }
        aria-expanded={menuOpen}
        aria-controls="main-navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div
        id="main-navigation"
        className={`navbar-links ${
          menuOpen ? "open" : ""
        }`}
      >
        <NavLink
          ref={firstMenuItemRef}
          to="/"
          onClick={closeMenu}
        >
          🏠 Home
        </NavLink>

        <NavLink
          to="/pricing"
          onClick={closeMenu}
        >
          💰 Pricing
        </NavLink>

        {isAuthenticated === false && (
          <>
            <NavLink
              to="/login"
              onClick={closeMenu}
            >
              🔐 Login
            </NavLink>

            <NavLink
              to="/register"
              onClick={closeMenu}
            >
              📝 Register
            </NavLink>
          </>
        )}

        {isAuthenticated === true && (
          <>
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
            >
              📊 Dashboard
            </NavLink>

            <NavLink
              to="/errors"
              onClick={closeMenu}
            >
              🚨 404 Errors
            </NavLink>

            <NavLink
              to="/support"
              onClick={closeMenu}
            >
              🆘 Support
            </NavLink>

            <NavLink
              to="/account"
              onClick={closeMenu}
            >
              👤 Account
            </NavLink>

            <button
              type="button"
              className="navbar-logout"
              onClick={handleLogout}
              aria-label="Log out of 404Watch"
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