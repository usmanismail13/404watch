import "./input.css";

function Input({
  label,
  id,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  error = "",
  className = "",
  ...props
}) {
  const inputClasses = [
    "ui-input",
    error ? "ui-input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ui-input-group">
      {label && (
        <label className="ui-input-label" htmlFor={id}>
          {label}
          {required && <span className="ui-input-required"> *</span>}
        </label>
      )}

      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        aria-invalid={Boolean(error)}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} className="ui-input-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
