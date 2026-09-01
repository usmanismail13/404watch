const paymentInstructions = {
  amount: "$10",
  token: "USDT",
  network: "TRON (TRC-20)",
  walletAddress: process.env.PAYMENT_WALLET_ADDRESS,
  warning: "Send USDT using the TRON (TRC-20) network only.",
};

module.exports = paymentInstructions;
