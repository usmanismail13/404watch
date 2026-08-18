function Register() {
  return (
    <div className="register-page">
      <h1>Create an Account</h1>

      <p>Register to start monitoring your website for 404 errors.</p>

      <form
        id="register-form"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          required
        />

        <button type="submit">Register</button>
      </form>

      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default Register;