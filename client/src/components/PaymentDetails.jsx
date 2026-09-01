import { useState } from "react";
import { paymentConfig } from "../config/payment";
import "./PaymentDetails.css";

function PaymentDetails() {
  const [copied, setCopied] = useState(false);

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText(paymentConfig.walletAddress);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy wallet address:", error);
    }
  };

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
        <div>
          <span>Subscription</span>
          <p>404Watch monitoring</p>
        </div>

        <strong>
          ${paymentConfig.amount}
          <small>/month</small>
        </strong>
      </div>

      <div className="payment-details__info">
        <div className="payment-details__row">
          <span className="payment-details__label">🪙 Token</span>

          <span className="payment-details__badge">
            {paymentConfig.token}
          </span>
        </div>

        <div className="payment-details__row">
          <span className="payment-details__label">🌐 Network</span>

          <span className="payment-details__badge">
            {paymentConfig.network}
          </span>
        </div>

        <div className="payment-details__row payment-details__wallet">
          <span className="payment-details__label">
            👛 Receiving Wallet
          </span>

          <div className="payment-details__wallet-box">
            <span className="payment-details__value payment-details__address">
              {paymentConfig.walletAddress}
            </span>

            <button
              type="button"
              className={`payment-details__copy-button ${
                copied ? "payment-details__copy-button--copied" : ""
              }`}
              onClick={handleCopyWallet}
              aria-label={
                copied
                  ? "Wallet address copied"
                  : "Copy wallet address"
              }
            >
              {copied ? "✅ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>
      </div>

      <div className="payment-details__divider" />

      <div className="payment-details__section">
        <div className="payment-details__section-heading">
          <span>🔄</span>

          <div>
            <h3>Subscription Renewal</h3>
            <p>Keep your 404Watch monitoring active.</p>
          </div>
        </div>

        <p>
          Send{" "}
          <strong>
            {paymentConfig.amount} {paymentConfig.currency}
          </strong>{" "}
          to the wallet address above using the{" "}
          <strong>{paymentConfig.network}</strong> network.
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
        <div className="payment-details__section-heading">
          <span>📋</span>

          <div>
            <h3>After Payment</h3>
            <p>Complete these simple steps after sending your payment.</p>
          </div>
        </div>

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
          <h3>Important Payment Information</h3>

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

      <div className="payment-details__footer">
        🔒 Your payment details are handled securely.
      </div>
    </section>
  );
}

export default PaymentDetails;
