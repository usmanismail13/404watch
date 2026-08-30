import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Support() {
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitted(false);
    setError("");

    if (!subject.trim() || !message.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/support",
        {
          subject: subject.trim(),
          message: message.trim(),
        },
        {
          withCredentials: true,
        }
      );

      setSubmitted(true);
      setSubject("");
      setMessage("");
    } catch (error) {
      console.error("Support ticket error:", error);
      setError("Unable to submit your ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="support-page"
      aria-labelledby="support-title"
    >
      <div className="support-card">
        <div className="support-header">
          <div
            className="support-icon"
            aria-hidden="true"
          >
            🆘
          </div>

          <div>
            <p className="support-eyebrow">
              Customer Support
            </p>

            <h1
              className="support-title"
              id="support-title"
            >
              How can we help?
            </h1>

            <p
              className="support-description"
              id="support-description"
            >
              Tell us about your issue and our support team will get back to
              you as soon as possible.
            </p>
          </div>
        </div>

        <form
          className="support-form"
          onSubmit={handleSubmit}
          aria-describedby="support-description"
        >
          <div className="support-field">
            <span className="support-label">
              📧 Email
            </span>

            <div
              id="support-email"
              className="support-input support-email"
              role="status"
              aria-label={`Customer email: ${
                user?.email || "Loading customer email"
              }`}
            >
              {user?.email || "Loading customer email..."}
            </div>
          </div>

          <div className="support-field">
            <label
              className="support-label"
              htmlFor="support-subject"
            >
              📝 Subject
            </label>

            <input
              id="support-subject"
              name="subject"
              className="support-input"
              type="text"
              placeholder="What do you need help with?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "support-error support-description"
                  : "support-description"
              }
            />
          </div>

          <div className="support-field">
            <label
              className="support-label"
              htmlFor="support-message"
            >
              💬 Message
            </label>

            <textarea
              id="support-message"
              name="message"
              className="support-textarea"
              placeholder="Describe your issue or question..."
              rows="7"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? "support-error support-description"
                  : "support-description"
              }
            />
          </div>

          {error && (
            <div
              className="support-error"
              id="support-error"
              role="alert"
              aria-live="assertive"
            >
              <span aria-hidden="true">❌</span>
              <p>{error}</p>
            </div>
          )}

          {submitted && (
            <div
              className="support-success"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">✅</span>

              <div>
                <strong>
                  Ticket submitted successfully!
                </strong>

                <p>
                  Your support request has been received. We'll get back to
                  you as soon as possible.
                </p>
              </div>
            </div>
          )}

          <button
            className="support-button"
            type="submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? "⏳ Sending..."
              : "📩 Submit Ticket"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Support;