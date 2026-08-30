import "./loading.css";

function Loading({
  size = "medium",
  text = "Loading...",
}) {
  return (
    <div
      className={`loading loading-${size}`}
      role="status"
      aria-live="polite"
    >
      <span className="loading-spinner" aria-hidden="true" />
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}

export default Loading;
