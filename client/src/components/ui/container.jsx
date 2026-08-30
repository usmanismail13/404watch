import "./container.css";

function Container({
  children,
  size = "xl",
  className = "",
}) {
  const classes = [
    "ui-container",
    `ui-container--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {children}
    </div>
  );
}

export default Container;
