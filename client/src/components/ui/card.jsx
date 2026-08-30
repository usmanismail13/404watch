import "./card.css";

function Card({
  children,
  title,
  description,
  footer,
  padding = "medium",
  className = "",
}) {
  const classes = [
    "ui-card",
    `ui-card--${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {(title || description) && (
        <div className="ui-card__header">
          {title && <h2 className="ui-card__title">{title}</h2>}

          {description && (
            <p className="ui-card__description">{description}</p>
          )}
        </div>
      )}

      <div className="ui-card__content">{children}</div>

      {footer && <div className="ui-card__footer">{footer}</div>}
    </section>
  );
}

export default Card;
