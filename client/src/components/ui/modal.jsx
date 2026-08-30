import { useEffect, useId, useRef } from "react";
import "./modal.css";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
}) {
  const modalRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Remember the element that opened the modal.
    previousActiveElementRef.current = document.activeElement;

    // Move focus into the modal after it renders.
    const focusTimer = setTimeout(() => {
      const modal = modalRef.current;

      if (!modal) {
        return;
      }

      const firstFocusableElement = modal.querySelector(
        "button:not([disabled]), " +
          "[href], " +
          "input:not([disabled]), " +
          "select:not([disabled]), " +
          "textarea:not([disabled]), " +
          "[tabindex]:not([tabindex='-1'])"
      );

      if (firstFocusableElement) {
        firstFocusableElement.focus();
      } else {
        modal.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      // Close modal with Escape.
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // Keep keyboard focus inside the modal.
      if (event.key === "Tab") {
        const modal = modalRef.current;

        if (!modal) {
          return;
        }

        const focusableElements = Array.from(
          modal.querySelectorAll(
            "button:not([disabled]), " +
              "[href], " +
              "input:not([disabled]), " +
              "select:not([disabled]), " +
              "textarea:not([disabled]), " +
              "[tabindex]:not([tabindex='-1'])"
          )
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        // Shift + Tab from the first element → last element.
        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        }

        // Tab from the last element → first element.
        if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);

      // Return focus to the element that opened the modal.
      const previousElement =
        previousActiveElementRef.current;

      if (
        previousElement &&
        typeof previousElement.focus === "function"
      ) {
        previousElement.focus();
      }
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
        ref={modalRef}
        className={classes}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex="-1"
      >
        <div className="ui-modal__header">
          <h2
            id={titleId}
            className="ui-modal__title"
          >
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