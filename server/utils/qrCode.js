const QRCode = require("qrcode");

const generatePaymentQrCode = async (walletAddress) => {
  return QRCode.toDataURL(walletAddress);
};

module.exports = {
  generatePaymentQrCode,
};
