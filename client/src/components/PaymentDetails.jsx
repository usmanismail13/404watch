import { paymentConfig } from "../config/payment";
import "./PaymentDetails.css";

function PaymentDetails() {
  return (
    <section className="payment-details">
      <div className="payment-details__header">
        <div className="payment-details__icon">💳</div>

        <div>
          <h2>Crypto Payment</h2>
          <p>Pay securely using cryptocurrency</p>
        </div>
      </div>

      <div className="payment-details__price">
        <span>Subscription</span>
        <strong>
          ${paymentConfig.amount}
          <small>/month</small>
        </strong>
      </div>

      <div className="payment-details__info">
        <div className="payment-details__row">
          <span className="payment-details__label">🪙 Token</span>
          <span className="payment-details__value">
            {paymentConfig.token}
          </span>
        </div>

        <div className="payment-details__row">
          <span className="payment-details__label">🌐 Network</span>
          <span className="payment-details__value">
            {paymentConfig.network}
          </span>
        </div>

        <div className="payment-details__row payment-details__wallet">
          <span className="payment-details__label">👛 Receiving Wallet</span>

          <span className="payment-details__value payment-details__address">
            {paymentConfig.walletAddress}
          </span>
        </div>
      </div>

      <div className="payment-details__section">
        <h3>🔄 Subscription Renewal</h3>

        <p>
          Send <strong>{paymentConfig.amount} {paymentConfig.currency}</strong>{" "}
          to the wallet address above using the{" "}
          <strong>{paymentConfig.network}</strong> network.
        </p>

        <p>
          Your subscription will be renewed after the payment has been
          successfully verified.
        </p>

        <div className="payment-details__notice payment-details__notice--info">
          <span>💡</span>
          <p>
            Renew before your current subscription expires to avoid an
            interruption in your monitoring service.
          </p>
        </div>
      </div>

      <div className="payment-details__section">
        <h3>📋 After Payment</h3>

        <p>
          After sending your payment, submit your transaction hash on the
          payment page.
        </p>

        <div className="payment-details__steps">
          <div>
            <span>1</span>
            <p>Send the required crypto payment.</p>
          </div>

          <div>
            <span>2</span>
            <p>Copy your transaction hash.</p>
          </div>

          <div>
            <span>3</span>
            <p>Submit the hash for verification.</p>
          </div>

          <div>
            <span>4</span>
            <p>Wait for your subscription to be updated.</p>
          </div>
        </div>
      </div>

      <div className="payment-details__notice payment-details__notice--warning">
        <span>⚠️</span>

        <div>
          <h3>Important</h3>

          <ul>
            <li>
              Send only <strong>{paymentConfig.token}</strong>.
            </li>

            <li>
              Use only the <strong>{paymentConfig.network}</strong> network.
            </li>

            <li>
              Double-check the receiving wallet address before sending.
            </li>

            <li>
              Keep your transaction hash until your payment is verified.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default PaymentDetails;
