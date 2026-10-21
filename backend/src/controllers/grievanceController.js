const Grievance = require("../models/Grievance")
const {
  findSimilarGrievances,
  DEFAULT_SIMILARITY_THRESHOLD,
} = require("../services/grievanceSimilarity")
const departmentRecommendationService = require("../services/departmentRecommendationService")

const MIN_DUPLICATE_DESCRIPTION_LENGTH = 40
const MAX_DESCRIPTION_LENGTH = 5000

function getSimilarityThreshold() {
  const configured = Number(process.env.DUPLICATE_SIMILARITY_THRESHOLD)
  return Number.isFinite(configured) && configured >= 0 && configured <= 1
    ? Math.max(DEFAULT_SIMILARITY_THRESHOLD, configured)
    : DEFAULT_SIMILARITY_THRESHOLD
}

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

    let aiRecommendation = null
    if (req.body.aiRecommendation) {
      try {
        aiRecommendation = departmentRecommendationService.recommendDepartment(subject, description, {
          governmentType: req.body.governmentType || "Central Government",
          state: req.body.state || "",
        })
      } catch (error) {
        console.error("Unable to refresh recommendation during submission:", error)
      }
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
      aiRecommendation: aiRecommendation?.recommendations?.[0]
        ? {
        category: aiRecommendation.recommendations[0].category,
        department: aiRecommendation.recommendations[0].department,
            modelScore: aiRecommendation.score,
            explanation: aiRecommendation.explanation,
            experimental: aiRecommendation.experimental,
          }
        : undefined,
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

exports.checkDuplicateGrievances = async (req, res) => {
  try {
    const body = req.body || {}
    const description = typeof body.description === "string"
      ? req.body.description.trim()
      : ""
    const subject = typeof body.subject === "string" ? body.subject.trim() : ""
    const category = typeof body.category === "string" ? body.category.trim() : ""

    if (
      description.length < MIN_DUPLICATE_DESCRIPTION_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH ||
      subject.length > 200
    ) {
      return res.status(400).json({
        message: `Subject must be at most 200 characters and description must be between ${MIN_DUPLICATE_DESCRIPTION_LENGTH} and ${MAX_DESCRIPTION_LENGTH} characters`,
      })
    }

    const query = {
      status: { $nin: ["resolved", "closed", "rejected"] },
    }

    if (body.excludeGrievanceId) {
      if (!/^[a-f\d]{24}$/i.test(body.excludeGrievanceId)) {
        return res.status(400).json({ message: "Invalid grievance ID" })
      }

      query._id = { $ne: body.excludeGrievanceId }
    }

    const grievances = await Grievance.find(query)
      .select("regNumber subject category status description")
      .lean()
    const matches = findSimilarGrievances(
      description,
      grievances,
      getSimilarityThreshold(),
      { subject, category },
    )

    return res.json({
      matches: matches.map(({ grievance, similarity }) => ({
        regNumber: grievance.regNumber,
        subject: grievance.subject,
        category: grievance.category,
        status: grievance.status,
        similarity: Math.round(similarity * 1000) / 10,
      })),
    })
  } catch (error) {
    console.error("Check duplicate grievances error:", error)
    return res.status(500).json({
      message: "Unable to check for similar grievances",
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
