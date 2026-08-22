const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  if (!password || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

module.exports = router;