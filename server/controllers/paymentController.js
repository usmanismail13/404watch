const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");
const { TronWeb } = require("tronweb");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: {
    "TRON-PRO-API-KEY": process.env.TRON_API_KEY,
  },
});

// 🪙 Official USDT TRC-20 contract on TRON
const USDT_CONTRACT_ADDRESS =
  "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const submitPayment = async (req, res) => {
  try {
    const {
      transactionHash,
      senderAddress,
      amount,
      network,
      token,
    } = req.body;

    // 1️⃣ Basic validation
    if (!transactionHash) {
      return res.status(400).json({
        success: false,
        message: "Transaction hash is required.",
      });
    }

    // 2️⃣ Prevent duplicate submissions
    const existingPayment = await prisma.payment.findUnique({
      where: {
        transactionHash,
      },
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "This transaction has already been submitted.",
      });
    }

    // 3️⃣ Validate payment configuration
    if (
      process.env.PAYMENT_TOKEN !== "USDT" ||
      process.env.PAYMENT_NETWORK !== "TRON" ||
      process.env.PAYMENT_STANDARD !== "TRC20"
    ) {
      return res.status(500).json({
        success: false,
        message: "Payment configuration is invalid.",
      });
    }

    // 4️⃣ Get transaction information from TRON
    const transaction = await tronWeb.trx.getTransaction(
      transactionHash
    );

    if (!transaction || !transaction.txID) {
      return res.status(400).json({
        success: false,
        message: "Transaction not found on the TRON blockchain.",
      });
    }

    // 5️⃣ Check transaction execution status
    const transactionResult =
      transaction.ret?.[0]?.contractRet;

    if (transactionResult !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "The blockchain transaction was not successful.",
      });
    }

    // 6️⃣ Get transaction receipt/info
    const transactionInfo =
      await tronWeb.trx.getTransactionInfo(transactionHash);

    if (!transactionInfo || !transactionInfo.receipt) {
      return res.status(400).json({
        success: false,
        message: "Transaction confirmation information not found.",
      });
    }

    // 7️⃣ Check receipt status
    if (transactionInfo.receipt.result !== "SUCCESS") {
      return res.status(400).json({
        success: false,
        message: "The blockchain transaction failed.",
      });
    }

    // 8️⃣ Make sure this is a contract transaction
    const contract =
      transaction.raw_data?.contract?.[0];

    if (!contract) {
      return res.status(400).json({
        success: false,
        message: "Invalid TRON transaction.",
      });
    }

    // 9️⃣ Get contract parameters
    const contractData =
      contract.parameter?.value;

    if (!contractData) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction contract data.",
      });
    }

    // 🔟 Verify the USDT contract address
    const contractAddress =
      contractData.contract_address;

    if (!contractAddress) {
      return res.status(400).json({
        success: false,
        message: "Contract address not found.",
      });
    }

    const decodedContractAddress =
      tronWeb.address.fromHex(contractAddress);

    if (
      decodedContractAddress !==
      USDT_CONTRACT_ADDRESS
    ) {
      return res.status(400).json({
        success: false,
        message: "Transaction is not a USDT TRC-20 transaction.",
      });
    }

    // 1️⃣1️⃣ Decode the USDT transfer data
    const data = contractData.data;

    if (!data || data.length < 136) {
      return res.status(400).json({
        success: false,
        message: "Invalid USDT transfer data.",
      });
    }

    // transfer(address,uint256)
    const recipientHex =
      "41" + data.slice(8, 72);

    const recipientAddress =
      tronWeb.address.fromHex(recipientHex);

    // 1️⃣2️⃣ Verify the receiving wallet
    const configuredWallet =
      process.env.PAYMENT_WALLET_ADDRESS;

    if (!configuredWallet) {
      return res.status(500).json({
        success: false,
        message: "Payment wallet is not configured.",
      });
    }

    if (recipientAddress !== configuredWallet) {
      return res.status(400).json({
        success: false,
        message: "Payment was not sent to the 404Watch wallet.",
      });
    }

    // 1️⃣3️⃣ Decode the USDT amount
    const amountHex =
      data.slice(72, 136);

    const amountInSmallestUnit =
      BigInt("0x" + amountHex);

    // 🪙 USDT TRC-20 uses 6 decimals
    const amountUSDT =
      Number(amountInSmallestUnit) / 1_000_000;

    // 1️⃣4️⃣ Check required payment amount
    const requiredAmount = Number(
      process.env.SUBSCRIPTION_PRICE_USD || "10"
    );

    if (amountUSDT < requiredAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount is insufficient. Required ${requiredAmount} USDT.`,
        received: amountUSDT,
      });
    }

    // 1️⃣5️⃣ Save verified payment
    // 🔐 JWT contains userId, not id
    const payment = await prisma.payment.create({
      data: {
        userId: req.user.userId,
        amount: amountUSDT,
        token: "USDT",
        network: "TRON",
        walletAddress: configuredWallet,
        transactionHash,
        status: "confirmed",
        paidAt: new Date(),
      },
    });

    // ✅ Payment successfully verified
    return res.status(200).json({
      success: true,
      message: "USDT payment verified successfully.",
      payment: {
        id: payment.id,
        transactionHash: payment.transactionHash,
        amount: amountUSDT,
        token: "USDT",
        network: "TRON",
        status: "confirmed",
      },
    });
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment.",
    });
  }
};

// ==================== PAYMENT HISTORY ====================

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        token: true,
        network: true,
        transactionHash: true,
        status: true,
        paidAt: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Payment history error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load payment history.",
    });
  }
};

module.exports = {
  submitPayment,
  getPaymentHistory,
};