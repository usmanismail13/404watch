import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Support() {
  const { user } = useAuth();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/support",
        {
          subject,
          message,
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
    }
  };

  return (
    <div className="support-page">
      <h1 className="support-title">🆘 Support</h1>

      <p className="support-description">
        How can we help you?
      </p>

      <form className="support-form" onSubmit={handleSubmit}>
        <div className="support-input">
          📧 {user?.email || "Loading customer email..."}
        </div>

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
          📩 Submit Ticket
        </button>

        {submitted && (
          <p className="support-success">
            ✅ Your support ticket has been submitted successfully.
          </p>
        )}
      </form>
    </div>
  );
}

export default Support;
