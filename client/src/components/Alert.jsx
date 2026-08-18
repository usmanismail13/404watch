function Alert({ message, type = "error" }) {
  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
}

export default Alert;