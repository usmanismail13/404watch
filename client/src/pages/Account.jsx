import { Link } from "react-router-dom";

function Account() {
  return (
    <div>
      <h1>Account</h1>
      <p>Manage your account settings.</p>

      <Link to="/billing">
        <button>Go to Billing</button>
      </Link>
    </div>
  );
}

export default Account;