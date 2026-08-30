import React from "react";

function Feedback({ type = "success", message, onClose }) {
  if (!message) return null;

  const icons = {
    success: "✅",
    warning: "⚠️",
    error: "❌",
    confirmation: "🔔",
  };

  return (
    <div className={`feedback feedback-${type}`} role="alert">
      <span>
        {icons[type] || "🔔"} {message}
      </span>

      {onClose && (
        <button onClick={onClose} aria-label="Close message">
          ×
        </button>
      )}
    </div>
  );
}

export default Feedback;
