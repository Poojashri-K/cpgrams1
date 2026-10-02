const mongoose = require("mongoose")

const appealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    grievance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grievance",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "underReview", "accepted", "rejected", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Appeal", appealSchema)
