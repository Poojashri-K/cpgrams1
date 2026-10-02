const Appeal = require("../models/Appeal")
const Grievance = require("../models/Grievance")

exports.createAppeal = async (req, res) => {
  try {
    const { grievanceId, subject, description } = req.body

    if (!grievanceId || !subject || !description) {
      return res.status(400).json({
        message: "Grievance ID, subject, and description are required",
      })
    }

    const grievance = await Grievance.findById(grievanceId)

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    if (grievance.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only appeal for your own grievance",
      })
    }

    const appeal = await Appeal.create({
      user: req.user.id,
      grievance: grievance._id,
      subject,
      description,
    })

    return res.status(201).json({
      message: "Appeal submitted successfully",
      appeal: {
        id: appeal._id.toString(),
        status: appeal.status,
        grievanceId: grievance._id.toString(),
        subject: appeal.subject,
        description: appeal.description,
        createdAt: appeal.createdAt,
      },
    })
  } catch (error) {
    console.error("Create appeal error:", error)
    return res.status(500).json({
      message: "Unable to submit appeal",
    })
  }
}

exports.getMyAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find({ user: req.user.id })
      .populate("grievance", "regNumber subject department status")
      .sort({ createdAt: -1 })
      .lean()

    return res.json({
      appeals: appeals.map((item) => ({
        id: item._id.toString(),
        grievanceId: item.grievance?._id?.toString() || "",
        regNumber: item.grievance?.regNumber || "",
        subject: item.subject,
        description: item.description,
        reason: item.description,
        status: item.status,
        adminResponse: item.adminResponse || "",
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error("Fetch appeals error:", error)
    return res.status(500).json({
      message: "Unable to fetch appeals",
    })
  }
}

exports.getAllAppeals = async (req, res) => {
  try {
    const appeals = await Appeal.find()
      .populate("grievance", "regNumber subject description department status createdAt")
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 })
      .lean()

    return res.json({
      appeals: appeals.map((item) => ({
        id: item._id.toString(),
        grievanceId: item.grievance?._id?.toString() || "",
        regNumber: item.grievance?.regNumber || "",
        grievanceSubject: item.grievance?.subject || "",
        grievanceDescription: item.grievance?.description || "",
        department: item.grievance?.department || "",
        grievanceStatus: item.grievance?.status || "",
        grievanceDate: item.grievance?.createdAt || null,
        user: item.user ? { id: item.user._id.toString(), name: item.user.name, email: item.user.email, mobile: item.user.mobile } : null,
        subject: item.subject,
        description: item.description,
        adminResponse: item.adminResponse || "",
        status: item.status,
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error("Fetch all appeals error:", error)
    return res.status(500).json({
      message: "Unable to fetch appeals",
    })
  }
}

exports.updateAppealReview = async (req, res) => {
  try {
    const { status, adminResponse } = req.body
    const validStatuses = ["pending", "underReview", "accepted", "rejected", "resolved"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Select a valid appeal status" })
    }
    if (typeof adminResponse !== "string" || !adminResponse.trim()) {
      return res.status(400).json({ message: "Admin response / action taken is required" })
    }

    const appeal = await Appeal.findById(req.params.id)
    if (!appeal) return res.status(404).json({ message: "Appeal not found" })

    appeal.status = status
    appeal.adminResponse = adminResponse.trim()
    await appeal.save()

    return res.json({
      message: "Appeal review saved successfully",
      appeal: {
        id: appeal._id.toString(),
        status: appeal.status,
        adminResponse: appeal.adminResponse,
      },
    })
  } catch (error) {
    console.error("Update appeal review error:", error)
    return res.status(500).json({ message: "Unable to save appeal review" })
  }
}
