const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
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
    res.status(500).json({
      message: "Registration failed",
    });
  }
});

module.exports = router;