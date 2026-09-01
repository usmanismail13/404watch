const prisma = require("../config/database");

const activateSubscription = async (userId, paymentId) => {
  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
  });

  // Make sure the payment exists
  if (!payment) {
    throw new Error("Payment not found");
  }

  // Only verified payments can activate a subscription
  if (payment.status !== "verified") {
    throw new Error("Payment has not been verified");
  }

  // Subscription starts now
  const startDate = new Date();

  // Subscription lasts 1 month
  const expirationDate = new Date(startDate);
  expirationDate.setMonth(expirationDate.getMonth() + 1);

  // Create or update the user's subscription
  const subscription = await prisma.subscription.upsert({
    where: {
      userId,
    },

    update: {
      status: "active",
      startDate,
      expirationDate,
    },

    create: {
      userId,
      status: "active",
      startDate,
      expirationDate,
    },
  });

  return subscription;
};

module.exports = {
  activateSubscription,
};
