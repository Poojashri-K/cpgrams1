const Grievance = require("../models/Grievance")

function formatGrievance(item) {
  if (!item) return null

  return {
    id: item._id ? item._id.toString() : item.id,
    regNumber: item.regNumber,
    subject: item.subject,
    description: item.description,
    category: item.category,
    department: item.department,
    governmentType: item.governmentType,
    state: item.state || "",
    district: item.district || "",
    priority: item.priority,
    status: item.status,
    location: item.location || "",
    adminResponse: item.adminResponse || "",
    filedOn: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : "",
    lastUpdate: item.updatedAt ? new Date(item.updatedAt).toISOString().slice(0, 10) : "",
    timeline: Array.isArray(item.timeline)
      ? item.timeline.map((entry) => ({
          status: entry.status,
          date: entry.date,
          note: entry.note || "",
        }))
      : [],
    user: item.user ? item.user.toString() : undefined,
  }
}

function createRegNumber() {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `CPG/${year}/${random}`
}

exports.createGrievance = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      department,
      governmentType,
      state,
      district,
      priority,
      location,
    } = req.body

    if (!subject || !description || !department) {
      return res.status(400).json({
        message: "Subject, description, and department are required",
      })
    }

    let regNumber = createRegNumber()
    let attempts = 0

    while (attempts < 10) {
      const existing = await Grievance.findOne({ regNumber })
      if (!existing) break
      regNumber = createRegNumber()
      attempts += 1
    }

    const grievance = await Grievance.create({
      regNumber,
      user: req.user.id,
      subject,
      description,
      category: category || "General",
      department,
      governmentType: governmentType || "Central Government",
      state: state || "",
      district: district || "",
      priority: priority || "medium",
      location: location || "",
      timeline: [
        {
          status: "submitted",
          date: new Date().toISOString(),
          note: "Grievance submitted successfully",
        },
      ],
    })

    return res.status(201).json({
      regNumber: grievance.regNumber,
      grievance: formatGrievance(grievance),
    })
  } catch (error) {
    console.error("Create grievance error:", error)
    return res.status(500).json({
      message: "Unable to submit grievance",
    })
  }
}

exports.getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ user: req.user.id }).sort({ createdAt: -1 }).lean()

    return res.json({
      grievances: grievances.map(formatGrievance),
    })
  } catch (error) {
    console.error("Fetch user grievances error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievances",
    })
  }
}

exports.getGrievanceDetails = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id).lean()

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    if (req.user.role !== "admin" && grievance.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this grievance",
      })
    }

    return res.json({
      grievance: formatGrievance(grievance),
    })
  } catch (error) {
    console.error("Fetch grievance details error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievance details",
    })
  }
}

exports.getGrievanceByRegNumber = async (req, res) => {
  try {
    const { regNumber } = req.query

    if (!regNumber) {
      return res.status(400).json({
        message: "Registration number is required",
      })
    }

    const grievance = await Grievance.findOne({ regNumber: String(regNumber).trim() }).lean()

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      })
    }

    if (req.user.role !== "admin" && grievance.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You are not authorized to view this grievance",
      })
    }

    return res.json({
      grievance: formatGrievance(grievance),
    })
  } catch (error) {
    console.error("Fetch grievance by reg number error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievance",
    })
  }
}

exports.updateGrievanceStatus = async (req, res) => {
  try {
    const { status } = req.body
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

exports.getAllGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find().sort({ createdAt: -1 }).lean()

    return res.json({
      grievances: grievances.map(formatGrievance),
    })
  } catch (error) {
    console.error("Fetch all grievances error:", error)
    return res.status(500).json({
      message: "Unable to fetch grievances",
    })
  }
}
