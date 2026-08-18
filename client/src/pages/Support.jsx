import { useState } from "react";

function Support() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="support-page">
      <h1 className="support-title">Support</h1>

      <p className="support-description">
        How can we help you?
      </p>

      <form className="support-form">
        <input
          className="support-input"
          type="text"
          placeholder="Subject"
        />

        <textarea
          className="support-textarea"
          placeholder="Describe your issue"
          rows="6"
        />

        <button
          className="support-button"
          type="button"
          onClick={() => setSubmitted(true)}
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