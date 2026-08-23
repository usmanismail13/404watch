import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      setIsAuthenticated(true);
      setMessage(response.data.message);

      navigate("/dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed."
      );
    }
  };

  return (
    <main className="login-page">
      <section className="login-section">
        <div className="login-container">
          <h1 className="login-title">Login</h1>

          <p
            className="login-description"
            id="login-description"
          >
            Sign in to your 404Watch account.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
            autoComplete="on"
            aria-describedby="login-description"
          >
            <label className="login-label" htmlFor="email">
              Email
            </label>

            <input
              className="login-input"
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <label className="login-label" htmlFor="password">
              Password
            </label>

            <input
              className="login-input"
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              className="login-button"
              type="submit"
              aria-label="Submit login form"
            >
              Login
            </button>
          </form>

          {message && (
            <p className="login-message" aria-live="polite">
              {message}
            </p>
          )}

          <p className="login-register">
            Don't have an account?{" "}
            <Link className="login-register-link" to="/register">
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;