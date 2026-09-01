import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import "../Account.css";

function Account() {
  const { user } = useAuth();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setMessage(response.data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 📅 Format subscription dates
  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <main
      className="account-page"
      aria-labelledby="account-title"
    >
      <div className="account-header">
        <span className="account-eyebrow">SETTINGS</span>

        <h1 id="account-title">
          👤 Account Settings
        </h1>

        <p>
          Manage your account information, security, and billing.
        </p>
      </div>

      {/* ==================== SUCCESS MESSAGE ==================== */}

      {message && (
        <div
          className="account-success"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden="true">✅</span>
          {message}
        </div>
      )}

      {/* ==================== ERROR MESSAGE ==================== */}

      {error && (
        <div
          className="account-error"
          role="alert"
          aria-live="assertive"
        >
          <span aria-hidden="true">❌</span>
          {error}
        </div>
      )}

      {/* ==================== PROFILE ==================== */}

      <section
        className="account-card"
        aria-labelledby="profile-title"
      >
        <div className="account-card-header">
          <div>
            <h2 id="profile-title">
              👤 Profile
            </h2>

            <p>
              Manage your account information.
            </p>
          </div>
        </div>

        <div className="account-info">
          <div>
            <span className="account-info-label">
              Email address
            </span>

            <strong>
              {user?.email || "Loading..."}
            </strong>
          </div>
        </div>
      </section>

      {/* ==================== SECURITY ==================== */}

      <section
        className="account-card"
        aria-labelledby="security-title"
      >
        <div className="account-card-header">
          <div>
            <h2 id="security-title">
              🔐 Security
            </h2>

            <p>
              Keep your account secure by managing your password.
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            type="button"
            onClick={() => {
              setShowPasswordForm(true);
              setMessage("");
              setError("");
            }}
            aria-expanded={showPasswordForm}
            aria-controls="change-password-form"
          >
            🔑 Change Password
          </button>
        ) : (
          <form
            id="change-password-form"
            onSubmit={handleChangePassword}
            aria-labelledby="security-title"
          >
            <div className="account-form-group">
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error ? "password-error" : undefined
                }
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
                minLength={8}
                required
                aria-required="true"
                aria-invalid={
                  newPassword.length > 0 &&
                  newPassword.length < 8
                }
                aria-describedby="password-requirement"
              />

              <small id="password-requirement">
                Password must be at least 8 characters.
              </small>
            </div>

            <div className="account-form-group">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
                required
                aria-required="true"
                aria-invalid={
                  confirmPassword.length > 0 &&
                  newPassword !== confirmPassword
                }
              />
            </div>

            {error && (
              <div
                id="password-error"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            <div className="account-form-actions">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading
                  ? "⏳ Changing..."
                  : "✅ Update Password"}
              </button>

              <button
                type="button"
                className="account-cancel-button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage("");
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* ==================== BILLING ==================== */}

      <section
        className="account-card"
        aria-labelledby="billing-title"
      >
        <div className="account-card-header">
          <div>
            <h2 id="billing-title">
              💳 Billing
            </h2>

            <p>
              Manage your subscription and billing information.
            </p>
          </div>
        </div>

        {/* 💳 Subscription Information */}

        <div className="account-info">
          <div>
            <span className="account-info-label">
              Subscription status
            </span>

            <strong>
              {user?.subscription?.status ||
                "No active subscription"}
            </strong>
          </div>

          <div>
            <span className="account-info-label">
              Subscription price
            </span>

            <strong>
              $10/month
            </strong>
          </div>

          <div>
            <span className="account-info-label">
              Accepted cryptocurrency
            </span>

            <strong>
              🪙 USDT
            </strong>
          </div>

          <div>
            <span className="account-info-label">
              Payment network
            </span>

            <strong>
              🌐 TRON (TRC-20)
            </strong>
          </div>

          {/* 📅 Subscription Start Date */}

          <div>
            <span className="account-info-label">
              Subscription start date
            </span>

            <strong>
              📅{" "}
              {formatDate(user?.subscription?.startDate)}
            </strong>
          </div>

          {/* ⏳ Subscription Expiration Date */}

          <div>
            <span className="account-info-label">
              Subscription expiration date
            </span>

            <strong>
              ⏳{" "}
              {formatDate(user?.subscription?.expirationDate)}
            </strong>
          </div>
        </div>

        {/* 🔗 Billing Page */}

        <div className="account-billing-action">
          <div>
            <strong>
              Subscription & Billing
            </strong>

            <span>
              View your plan, payment details, and billing options.
            </span>
          </div>

          <Link to="/billing">
            <button type="button">
              💳 Go to Billing
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Account;