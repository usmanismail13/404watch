function ErrorState({
  icon = "⚠️",
  title = "Something went wrong",
  message = "We couldn't load this information.",
  action,
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon">{icon}</div>

      <h3>{title}</h3>

      <p>{message}</p>

      {action && (
        <div className="error-state-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default ErrorState;
