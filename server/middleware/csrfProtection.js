const { doubleCsrf } = require("csrf-csrf");

const csrfSecret = process.env.CSRF_SECRET;

if (!csrfSecret) {
  throw new Error("CSRF_SECRET is not configured");
}

const {
  doubleCsrfProtection,
  generateCsrfToken,
} = doubleCsrf({
  getSecret: () => csrfSecret,

  getSessionIdentifier: (req) => {
    return req.ip || "anonymous";
  },

  cookieName: "csrf-token",

  cookieOptions: {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  },

  size: 64,

  ignoredMethods: ["GET", "HEAD", "OPTIONS"],

  getTokenFromRequest: (req) => {
    return req.headers["x-csrf-token"];
  },
});

module.exports = {
  csrfProtection: doubleCsrfProtection,
  generateToken: generateCsrfToken,
};
