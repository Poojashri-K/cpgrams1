const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")
const User = require("../models/User")
const Grievance = require("../models/Grievance")
const Feedback = require("../models/Feedback")
const Appeal = require("../models/Appeal")

function formatGrievance(item) {
  if (!item) return null

  return {
    id: item._id ? item._id.toString() : item.id,
    regNumber: item.regNumber,
    subject: item.subject,
    description: item.description,
    category: item.category,
    department: item.department,
    aiRecommendation: item.aiRecommendation || null,
    governmentType: item.governmentType,
    state: item.state || "",
    district: item.district || "",
    priority: item.priority,
    status: item.status,
    location: item.location || "",
    filedOn: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "",
    lastUpdate: item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : "",
    timestamp: item.createdAt,
    timeline: Array.isArray(item.timeline)
      ? item.timeline.map((entry) => ({
          status: entry.status,
          date: entry.date,
          note: entry.note || "",
        }))
      : [],
    adminResponse: item.adminResponse || "",
    user: item.user
      ? typeof item.user === "object" && item.user.name
        ? {
            id: item.user._id ? item.user._id.toString() : item.user.id,
            name: item.user.name,
            email: item.user.email,
            mobile: item.user.mobile || "",
          }
        : item.user.toString()
      : undefined,
  }
}

exports.loginAdmin = async (req, res) => {
  try {
    const { employeeId, password } = req.body

    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required",
      })
    }

    const admin = await Admin.findOne({ employeeId })

    if (!admin) {
      return res.status(401).json({
        message: "Invalid Employee ID or password",
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Employee ID or password",
      })
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        employeeId: admin.employeeId,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      message: "Admin login failed",
    })
  }
}

exports.getDashboardData = async (req, res) => {
  try {
    const [grievances, users, feedback, appeals] = await Promise.all([
      Grievance.find().sort({ createdAt: -1 }).populate("user", "name email mobile").lean(),
      User.find().select("name email mobile city district pinCode profilePhoto createdAt").lean(),
      Feedback.find().sort({ createdAt: -1 }).populate("grievance", "regNumber subject").populate("user", "name email").lean(),
      Appeal.find().sort({ createdAt: -1 }).populate("grievance", "regNumber subject").populate("user", "name email").lean(),
    ])

    return res.json({
      grievances: grievances.map(formatGrievance),
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city || "",
        district: user.district || "",
        pinCode: user.pinCode || "",
        profilePhoto: user.profilePhoto || "",
      })),
      feedback: feedback.map((item) => ({
        id: item._id.toString(),
        regNumber: item.grievance?.regNumber || "",
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
        user: item.user ? { id: item.user._id.toString(), name: item.user.name, email: item.user.email } : null,
      })),
      appeals: appeals.map((item) => ({
        id: item._id.toString(),
        regNumber: item.grievance?.regNumber || "",
        subject: item.subject,
        description: item.description,
        status: item.status,
        createdAt: item.createdAt,
        user: item.user ? { id: item.user._id.toString(), name: item.user.name, email: item.user.email } : null,
      })),
    })
  } catch (error) {
    console.error("Get dashboard data error:", error)
    return res.status(500).json({
      message: "Unable to fetch admin dashboard data",
    })
  }
}

exports.getGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 }).populate("user", "name email mobile").lean()
    return res.json({ grievances: grievances.map(formatGrievance) })
  } catch (error) {
    console.error("Get grievances error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievances",
    })
  }
}

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email mobile city district pinCode profilePhoto createdAt").lean()

    return res.json({
      users: users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city || "",
        district: user.district || "",
        pinCode: user.pinCode || "",
        profilePhoto: user.profilePhoto || "",
      })),
    })
  } catch (error) {
    console.error("Get users error:", error)
    return res.status(500).json({
      message: "Unable to fetch users",
    })
  }
}

exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).populate("grievance", "regNumber subject").populate("user", "name email").lean()

    return res.json({
      feedback: feedback.map((item) => ({
        id: item._id.toString(),
        regNumber: item.grievance?.regNumber || "",
        rating: item.rating,
        comment: item.comment,
        createdAt: item.createdAt,
        user: item.user ? { id: item.user._id.toString(), name: item.user.name, email: item.user.email } : null,
      })),
    })
  } catch (error) {
    console.error("Get feedback error:", error)
    return res.status(500).json({
      message: "Unable to fetch feedback",
    })
  }
}

exports.getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id).populate("user", "name email mobile").lean()

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    return res.json({
      grievance: formatGrievance(grievance),
    })
  } catch (error) {
    console.error("Get grievance by id error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievance details",
    })
  }
}

exports.updateGrievanceStatus = async (req, res) => {
  try {
    const { status, adminResponse } = req.body
    const validStatuses = [
      "submitted",
      "underReview",
      "inProgress",
      "resolved",
      "closed",
      "rejected",
    ]

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid grievance status",
      })
    }

    const grievance = await Grievance.findById(req.params.id)

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    grievance.status = status
    if (adminResponse !== undefined) {
      if (typeof adminResponse !== "string") {
        return res.status(400).json({ message: "Admin response must be text" })
      }
      grievance.adminResponse = adminResponse.trim()
    }
    grievance.timeline.push({
      status,
      date: new Date().toISOString(),
      note: `Status updated to ${status}`,
    })

    await grievance.save()

    return res.json({
      message: "Status updated successfully",
      grievance: formatGrievance(grievance),
    })
  } catch (error) {
    console.error("Update grievance status error:", error)
    return res.status(500).json({
      message: "Unable to update grievance status",
    })
  }
}
