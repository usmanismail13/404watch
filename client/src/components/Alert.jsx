import "./alert.css";

function Alert({
  message,
  type = "error",
  title = "",
  onClose,
}) {
  const validTypes = ["success", "warning", "error", "info"];

  const alertType = validTypes.includes(type)
    ? type
    : "error";

  const liveMode =
    alertType === "error" || alertType === "warning"
      ? "assertive"
      : "polite";

  return (
    <div
      className={`alert alert-${alertType}`}
      role="alert"
      aria-live={liveMode}
    >
      <div className="alert-content">
        {title && (
          <strong className="alert-title">
            {title}
          </strong>
        )}

        <p className="alert-message">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          className="alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

export default Alert;