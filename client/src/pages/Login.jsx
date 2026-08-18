import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Login submitted successfully.");
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