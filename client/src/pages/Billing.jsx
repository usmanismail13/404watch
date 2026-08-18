import "../Billing.css";

function Billing() {
  return (
    <div className="billing-page">
      <h1>Billing</h1>

      <div className="billing-card">
        <h2>Current Plan</h2>
        <p>$10/month</p>
        <p>Manage your 404Watch subscription and billing.</p>

<button type="button">Manage Subscription</button>
      </div>
    </div>
  );
}

export default Billing;