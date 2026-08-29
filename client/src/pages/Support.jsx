import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function Support() {
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="support-page">
      <h1 className="support-title">Support</h1>

      <p className="support-description">
        How can we help you?
      </p>

      <form className="support-form" onSubmit={handleSubmit}>
        <input
          className="support-input"
          type="email"
          value={user?.email || ""}
          placeholder="Customer email"
          readOnly
        />

        <input
          className="support-input"
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <textarea
          className="support-textarea"
          placeholder="Describe your issue"
          rows="6"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          className="support-button"
          type="submit"
        >
          Submit Ticket
        </button>

        {submitted && (
          <p className="support-success">
            Your support ticket has been submitted successfully.
          </p>
        )}
      </form>
    </div>
  );
}

export default Support;
