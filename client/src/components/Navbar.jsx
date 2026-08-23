import "../Navbar.css";
import axios from "axios";

function Navbar() {
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );

      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav>
      <h2>404Watch</h2>

      <div>
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
        <a href="/dashboard">Dashboard</a>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;