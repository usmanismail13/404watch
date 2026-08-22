const sequelize = require("../config/database");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [result] = await sequelize.query(
      `INSERT INTO "User" ("email", "password", "createdAt", "updatedAt")
       VALUES (:email, :password, NOW(), NOW())
       RETURNING "id", "email", "createdAt", "updatedAt"`,
      {
        replacements: {
          email,
          password,
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

module.exports = {
  register,
};