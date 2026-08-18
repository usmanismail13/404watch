import "../Navbar.css";

function Navbar() {
  return (
    <nav>
      <h2>404Watch</h2>

      <div>
        <a href="/">Home</a>
        <a href="/pricing">Pricing</a>
        <a href="/login">Login</a>
        <a href="/register">Register</a>
        <a href="/dashboard">Dashboard</a>
      </div>
    </nav>
  );
}

export default Navbar;