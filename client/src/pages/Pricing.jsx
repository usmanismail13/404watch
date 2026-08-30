import "./Pricing.css";

function Pricing() {
  const subscriptionStatus = "Not subscribed";

  return (
    <div className="pricing-page">
      <h1>Simple Pricing</h1>

      <p className="pricing-intro">
        Everything you need to monitor your website for 404 errors.
      </p>

      <div className="pricing-card">
        <h2>404Watch</h2>

        <div className="price">
          <span>$10</span>
          <span className="price-period">/ month</span>
        </div>

        <p className="price-description">Per customer</p>

        <ul>
          <li>404 error monitoring</li>
          <li>Automatic website scanning</li>
          <li>404 email alerts</li>
          <li>404 recovery detection</li>
          <li>Dashboard access</li>
          <li>Customer support</li>
        </ul>

        <button>Subscribe — $10/month</button>

        <div className="billing-info">
          <p>💳 Monthly subscription</p>
          <p>🔄 Cancel anytime</p>
          <p>🔒 Secure billing</p>
        </div>
      </div>

      <div className="subscription-status">
        <h2>Subscription Status</h2>

        <div className="status-badge">
          {subscriptionStatus}
        </div>

        <p>
          Your subscription status will appear here once billing is
          connected.
        </p>

        <button
          className="manage-billing-button"
          disabled
        >
          Manage Billing
        </button>

        <small className="billing-coming-soon">
          Billing management will be available after payment setup.
        </small>
      </div>
    </div>
  );
}

export default Pricing;
