import "./button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;
