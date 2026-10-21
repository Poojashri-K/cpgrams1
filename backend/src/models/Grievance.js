const mongoose = require("mongoose")

const aiRecommendationSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    department: { type: String, required: true },
    modelScore: { type: Number, min: 0, max: 100, required: true },
    explanation: { type: String, default: "" },
    experimental: { type: Boolean, default: true },
  },
  { _id: false },
)

const grievanceSchema = new mongoose.Schema(
  {
    regNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    department: {
      type: String,
      required: true,
    },
    aiRecommendation: {
      type: aiRecommendationSchema,
      default: undefined,
    },
    governmentType: {
      type: String,
      default: "Central Government",
    },
    state: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "underReview",
        "inProgress",
        "resolved",
        "closed",
        "rejected",
      ],
      default: "submitted",
    },
    location: {
      type: String,
      default: "",
    },
    adminResponse: {
      type: String,
      default: "",
      trim: true,
    },
    timeline: [
      {
        status: String,
        date: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model("Grievance", grievanceSchema)
