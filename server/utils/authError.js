const logAuthError = (operation, error) => {
  console.error(`[AUTH] ${operation} failed:`, {
    name: error?.name || "UnknownError",
    code: error?.code || "UNKNOWN",
  });
};

module.exports = logAuthError;