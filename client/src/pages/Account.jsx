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

  return (
    <div className="account-page">
      <div className="account-header">
        <span className="account-eyebrow">SETTINGS</span>
        <h1>👤 Account Settings</h1>
        <p>
          Manage your account information, security, and billing.
        </p>
      </div>

      {message && (
        <div className="account-success">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="account-error">
          ❌ {error}
        </div>
      )}

      <section className="account-card">
        <div className="account-card-header">
          <div>
            <h2>👤 Profile</h2>
            <p>Manage your account information.</p>
          </div>
        </div>

        <div className="account-info">
          <div>
            <span className="account-info-label">Email address</span>
            <strong>{user?.email || "Loading..."}</strong>
          </div>
        </div>
      </section>

      <section className="account-card">
        <div className="account-card-header">
          <div>
            <h2>🔐 Security</h2>
            <p>Keep your account secure by managing your password.</p>
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
          >
            🔑 Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div className="account-form-group">
              <label htmlFor="currentPassword">
                Current Password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.target.value)
                }
                autoComplete="current-password"
              />
            </div>

            <div className="account-form-group">
              <label htmlFor="newPassword">
                New Password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                autoComplete="new-password"
              />

              <small>
                Password must be at least 8 characters.
              </small>
            </div>

            <div className="account-form-group">
              <label htmlFor="confirmPassword">
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                autoComplete="new-password"
              />
            </div>

            <div className="account-form-actions">
              <button type="submit" disabled={loading}>
                {loading ? "⏳ Changing..." : "✅ Update Password"}
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

      <section className="account-card">
        <div className="account-card-header">
          <div>
            <h2>💳 Billing</h2>
            <p>
              Manage your subscription and billing information.
            </p>
          </div>
        </div>

        <div className="account-billing-action">
          <div>
            <strong>Subscription & Billing</strong>
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
    </div>
  );
}

export default Account;