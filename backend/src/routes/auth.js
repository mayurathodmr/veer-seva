const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "change-this-secret";


/* ================= REGISTER ================= */

router.post("/register", async (req, res) => {

  try {

    const firstName = String(req.body.firstName || "").trim();
    const lastName = String(req.body.lastName || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "").trim().toLowerCase();

    if (!firstName || !lastName || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required."
      });
    }

    if (!["donor", "army"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    db.users.findOne(
      { email },
      async (findError, existingUser) => {

        if (findError) {
          console.error(findError);

          return res.status(500).json({
            success: false,
            message: "Unable to check account."
          });
        }

        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: "An account with this email already exists."
          });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const newUser = {
          firstName,
          lastName,
          email,
          phone,
          passwordHash,
          role,
          isVerified: role === "donor",
          createdAt: new Date().toISOString()
        };

        db.users.insert(
          newUser,
          (insertError, savedUser) => {

            if (insertError) {
              console.error("Registration error:", insertError);

              return res.status(500).json({
                success: false,
                message: "Unable to create account."
              });
            }

            /* AUTO LOGIN AFTER REGISTRATION */

            const token = jwt.sign(
              {
                id: savedUser._id,
                email: savedUser.email,
                role: savedUser.role
              },
              JWT_SECRET,
              {
                expiresIn: "7d"
              }
            );

            res.cookie("veerSevaToken", token, {
              httpOnly: true,
              secure: false,
              sameSite: "lax",
              maxAge: 7 * 24 * 60 * 60 * 1000
            });

            return res.status(201).json({
              success: true,
              message: "Account created successfully.",
              user: {
                id: savedUser._id,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                phone: savedUser.phone,
                role: savedUser.role,
                isVerified: savedUser.isVerified,
                createdAt: savedUser.createdAt
              }
            });

          }
        );

      }
    );

  } catch (error) {

    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration."
    });

  }

});


/* ================= LOGIN ================= */

router.post("/login", async (req, res) => {

  try {

    const email =
      String(req.body.email || "").trim().toLowerCase();

    const password =
      String(req.body.password || "");

    const role =
      String(req.body.role || "").trim().toLowerCase();

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password and account type are required."
      });
    }

    db.users.findOne(
      { email },
      async (err, user) => {

        if (err || !user) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password."
          });
        }

        if (user.role !== role) {
          return res.status(403).json({
            success: false,
            message: "Account type does not match."
          });
        }

        const passwordMatch =
          await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password."
          });
        }

        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
            role: user.role
          },
          JWT_SECRET,
          {
            expiresIn: "7d"
          }
        );

        res.cookie("veerSevaToken", token, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
          success: true,
          message: "Login successful.",
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            createdAt: user.createdAt
          }
        });

      }
    );

  } catch (error) {

    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login."
    });

  }

});


/* ================= CURRENT USER ================= */

router.get("/me", requireAuth, (req, res) => {

  db.users.findOne(
    { _id: req.user.id },
    (err, user) => {

      if (err || !user) {
        return res.status(401).json({
          success: false,
          message: "User not found."
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        }
      });

    }
  );

});


/* ================= LOGOUT ================= */

router.post("/logout", (req, res) => {

  res.clearCookie("veerSevaToken");

  res.json({
    success: true,
    message: "Logged out successfully."
  });

});


module.exports = router;
