const express = require("express");
const crypto = require("crypto");

const donations = require("../database/donations");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, (req, res) => {
  if (req.user.role !== "donor") {
    return res.status(403).json({
      success: false,
      message: "Only donors can create donations."
    });
  }

  const amount = Number(req.body.amount);
  const requestName = String(req.body.requestName || "").trim();

  if (!Number.isFinite(amount) || amount < 100) {
    return res.status(400).json({
      success: false,
      message: "Minimum donation amount is ₹100."
    });
  }

  if (!requestName) {
    return res.status(400).json({
      success: false,
      message: "Donation request is required."
    });
  }

  const donation = {
    donationId: "VS-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
    donorId: req.user.id,
    requestName,
    amount,
    status: "pending_payment",
    createdAt: new Date().toISOString()
  };

  donations.insert(donation, (err, saved) => {
    if (err) {
      console.error("Donation save error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to create donation."
      });
    }

    res.status(201).json({
      success: true,
      message: "Donation created successfully.",
      donation: saved
    });
  });
});


router.get("/mine", requireAuth, (req, res) => {
  donations
    .find({ donorId: req.user.id })
    .sort({ createdAt: -1 })
    .exec((err, records) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Unable to load donation history."
        });
      }

      res.json({
        success: true,
        donations: records
      });
    });
});


module.exports = router;
