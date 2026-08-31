const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const generateToken = require("../utils/generateToken");
const authMiddleware = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validators/auth.validator");
const logAuthError = require("../utils/authError");

const router = express.Router();

// ==================== VALIDATION HELPER ====================

const validateExpress = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

// ==================== REGISTER ====================

router.post(
  "/register",

  // 🧹 Schema validation
  validate(registerSchema),

  // 🛡️ Additional input validation
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),

    body("password")
      .isString()
      .isLength({ min: 8, max: 128 })
      .withMessage("Password must be between 8 and 128 characters long"),

    validateExpress,
  ],

  async (req, res) => {
    const { email, password } = req.body;

    try {
      // 🔐 Hash password before database storage
      const hashedPassword = await bcrypt.hash(password, 10);

      // 🗄️ Prisma uses parameterized queries internally,
      // protecting this database operation against SQL injection.
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "An account with this email already exists",
        });
      }

      logAuthError("registration", error);

      return res.status(500).json({
        message: "Registration failed",
      });
    }
  }
);

// ==================== LOGIN ====================

router.post(
  "/login",

  // 🧹 Schema validation
  validate(loginSchema),

  // 🛡️ Additional input validation
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address")
      .normalizeEmail(),

    body("password")
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage("Invalid password"),

    validateExpress,
  ],

  async (req, res) => {
    const { email, password } = req.body;

    try {
      // 🔎 Prisma parameterizes this query.
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // 🔑 Compare password against stored hash
      const passwordMatches = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }

      // 🎫 Generate authentication token
      const token = generateToken(user.id, user.email);

      // 🍪 Store token securely in HTTP-only cookie
      return res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
          },
        });
    } catch (error) {
      logAuthError("login", error);

      return res.status(500).json({
        message: "Login failed",
      });
    }
  }
);

// ==================== CURRENT USER ====================

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    logAuthError("current-user", error);

    return res.status(500).json({
      message: "Failed to get current user",
    });
  }
});

// ==================== CHANGE PASSWORD ====================

router.post(
  "/change-password",

  // 🔐 Authentication first
  authMiddleware,

  // 🧹 Schema validation
  validate(changePasswordSchema),

  // 🛡️ Additional input validation
  [
    body("currentPassword")
      .isString()
      .isLength({ min: 1, max: 128 })
      .withMessage("Current password is required"),

    body("newPassword")
      .isString()
      .isLength({ min: 8, max: 128 })
      .withMessage("New password must be between 8 and 128 characters long"),

    validateExpress,
  ],

  async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from your current password",
      });
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user.userId,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // 🔑 Verify current password
      const passwordMatches = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!passwordMatches) {
        return res.status(401).json({
          message: "Current password is incorrect",
        });
      }

      // 🔐 Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 🗄️ Prisma parameterizes this update.
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error) {
      logAuthError("change-password", error);

      return res.status(500).json({
        message: "Failed to change password",
      });
    }
  }
);

// ==================== LOGOUT ====================

router.post("/logout", (req, res) => {
  return res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })
    .json({
      message: "Logout successful",
    });
});

module.exports = router;
