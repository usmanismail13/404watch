const submitPayment = async (req, res) => {
  try {
    const {
      transactionHash,
      senderAddress,
      amount,
      network,
      token,
    } = req.body;

    res.status(200).json({
      success: true,
      message: "Payment submission received",
      payment: {
        transactionHash,
        senderAddress,
        amount,
        network,
        token,
      },
    });
  } catch (error) {
    console.error("Payment submission failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to submit payment",
    });
  }
};

module.exports = {
  submitPayment,
};
