function Error({ message = "Something went wrong." }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
}

export default Error;