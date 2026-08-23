const generateToken = require("../utils/generateToken");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await sequelize.query(
      `INSERT INTO "User" ("email", "password", "createdAt", "updatedAt")
       VALUES (:email, :password, NOW(), NOW())
       RETURNING "id", "email", "createdAt", "updatedAt"`,
      {
        replacements: {
          email,
          password: hashedPassword,
        },
      }
    );

    const user = result[0];

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [result] = await sequelize.query(
      `SELECT "id", "email", "password"
       FROM "User"
       WHERE "email" = :email
       LIMIT 1`,
      {
        replacements: {
          email,
        },
      }
    );

    const user = result[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);

    res
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
    console.error(error);

    res.status(500).json({
      message: "Failed to login",
    });
  }
};

const logout = async (req, res) => {
  try {
    res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
      .json({
        message: "Logout successful",
      });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to logout",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
};