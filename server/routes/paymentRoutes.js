const express = require("express");
const {
  submitPayment,
  getPaymentHistory,
} = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 💳 Submit and verify a payment
router.post("/submit", authMiddleware, submitPayment);

// 🧾 Get logged-in user's payment history
router.get("/history", authMiddleware, getPaymentHistory);

module.exports = router;
