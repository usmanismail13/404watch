import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/api/auth/register", {
        email,
        password,
      });

      navigate("/login");
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section
        className="register-section"
        aria-labelledby="register-title"
      >
        <div className="register-container">
          <h1
            className="register-title"
            id="register-title"
          >
            Create an Account
          </h1>

          <p
            className="register-description"
            id="register-description"
          >
            Register to start monitoring your website for 404 errors.
          </p>

          <form
            id="register-form"
            className="register-form"
            onSubmit={handleSubmit}
            autoComplete="on"
            aria-describedby="register-description"
          >
            <label
              className="register-label"
              htmlFor="register-email"
            >
              Email address
            </label>

            <input
              className="register-input"
              type="email"
              id="register-email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              aria-required="true"
            />

            <label
              className="register-label"
              htmlFor="register-password"
            >
              Password
            </label>

            <input
              className="register-input"
              type="password"
              id="register-password"
              name="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              aria-required="true"
            />

            <label
              className="register-label"
              htmlFor="register-confirm-password"
            >
              Confirm password
            </label>

            <input
              className="register-input"
              type="password"
              id="register-confirm-password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              aria-required="true"
              aria-invalid={
                confirmPassword.length > 0 &&
                password !== confirmPassword
              }
            />

            {error && (
              <p
                className="register-message"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </p>
            )}

            <button
              className="register-button"
              type="submit"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p className="register-login">
            Already have an account?{" "}
            <Link
              className="register-login-link"
              to="/login"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Register;