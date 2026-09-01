import { paymentConfig } from "../config/payment";

function PaymentDetails() {
  return (
    <div className="payment-details">
      <h2>💳 Crypto Payment</h2>

      <div>
        <strong>🪙 Token:</strong>
        <span>{paymentConfig.token}</span>
      </div>

      <div>
        <strong>🌐 Network:</strong>
        <span>{paymentConfig.network}</span>
      </div>

      <div>
        <strong>💰 Amount:</strong>
        <span>
          {paymentConfig.amount} {paymentConfig.currency}
        </span>
      </div>

      <div>
        <strong>👛 Receiving Wallet:</strong>
        <span>{paymentConfig.walletAddress}</span>
      </div>
    </div>
  );
}

export default PaymentDetails;
