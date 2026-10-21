const recommendationService = require("../services/departmentRecommendationService")

const MIN_SUBJECT_LENGTH = 3
const MAX_SUBJECT_LENGTH = 200
const MIN_DESCRIPTION_LENGTH = 10
const MAX_DESCRIPTION_LENGTH = 5000
const GOVERNMENT_TYPES = ["Central Government", "State Government", "Local Government"]

exports.recommendDepartment = (req, res) => {
  try {
    const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : ""
    const description = typeof req.body?.description === "string"
      ? req.body.description.trim()
      : ""
    const governmentType = typeof req.body?.governmentType === "string"
      ? req.body.governmentType.trim()
      : ""
    const state = typeof req.body?.state === "string" ? req.body.state.trim() : ""

    if (
      subject.length < MIN_SUBJECT_LENGTH ||
      subject.length > MAX_SUBJECT_LENGTH ||
      description.length < MIN_DESCRIPTION_LENGTH ||
      description.length > MAX_DESCRIPTION_LENGTH ||
      !GOVERNMENT_TYPES.includes(governmentType) ||
      (governmentType !== "Central Government" && (!state || state.length > 100))
    ) {
      return res.status(400).json({
        message: `Provide a subject (${MIN_SUBJECT_LENGTH}-${MAX_SUBJECT_LENGTH} characters), description (${MIN_DESCRIPTION_LENGTH}-${MAX_DESCRIPTION_LENGTH} characters), and valid government type${governmentType !== "Central Government" ? " and state" : ""}`,
      })
    }

    return res.json(recommendationService.recommendDepartment(subject, description, { governmentType, state }))
  } catch (error) {
    console.error("Department recommendation error:", error)
    return res.status(503).json({
      message: "Department recommendations are temporarily unavailable",
    })
  }
}