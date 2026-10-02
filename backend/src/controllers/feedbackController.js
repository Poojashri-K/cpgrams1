const Feedback = require("../models/Feedback")
const Grievance = require("../models/Grievance")

exports.submitFeedback = async (req, res) => {
  try {
    const { regNumber, rating, comment } = req.body

    if (!regNumber || !rating) {
      return res.status(400).json({
        message: "Registration number and rating are required",
      })
    }

    const grievance = await Grievance.findOne({ regNumber: String(regNumber).trim() })

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    if (grievance.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You cannot submit feedback for someone else's grievance",
      })
    }

    const feedback = await Feedback.create({
      grievance: grievance._id,
      user: req.user.id,
      rating: Number(rating),
      comment: comment || "",
    })

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback._id,
        regNumber,
        rating: feedback.rating,
        comment: feedback.comment,
      },
    })
  } catch (error) {
    console.error("Submit feedback error:", error)
    return res.status(500).json({
      message: "Unable to submit feedback",
    })
  }
}

exports.getFeedback = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const feedback = await Feedback.find().sort({ createdAt: -1 }).populate("grievance", "regNumber subject").populate("user", "name email").lean()

      return res.json({
        feedback: feedback.map((item) => ({
          id: item._id.toString(),
          regNumber: item.grievance?.regNumber || "",
          rating: item.rating,
          comment: item.comment,
          createdAt: item.createdAt,
          user: item.user ? { id: item.user._id.toString(), name: item.user.name } : null,
        })),
      })
    }

    const feedback = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 }).populate("grievance", "regNumber subject").lean()

    return res.json({
      feedback: feedback.map((item) => ({
        id: item._id.toString(),
        regNumber: item.grievance?.regNumber || "",
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error("Fetch feedback error:", error)
    return res.status(500).json({
      message: "Unable to fetch feedback",
    })
  }
}
