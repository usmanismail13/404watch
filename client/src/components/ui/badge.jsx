import "./badge.css";

function Badge({
  children,
  variant = "default",
  size = "medium",
  className = "",
}) {
  const classes = [
    "ui-badge",
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{children}</span>;
}

export default Badge;
