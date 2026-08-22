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

    res.status(200).json({
      message: "Password verified successfully",
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

module.exports = {
  register,
  login,
};