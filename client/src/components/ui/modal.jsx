import { useEffect } from "react";
import "./modal.css";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const classes = [
    "ui-modal",
    `ui-modal--${size}`,
  ].join(" ");

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="ui-modal__backdrop"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ui-modal-title"
      >
        <div className="ui-modal__header">
          <h2 id="ui-modal-title" className="ui-modal__title">
            {title}
          </h2>

          <button
            type="button"
            className="ui-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="ui-modal__content">
          {children}
        </div>

        {footer && (
          <div className="ui-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
