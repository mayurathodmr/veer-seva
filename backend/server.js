require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/auth");
const donationRoutes = require("./src/routes/donations");

require("./src/database/db");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VeerSeva API is running."
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("🇮🇳 VEERSEVA BACKEND");
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
  console.log("");
});
