const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const {
  submitFeedback,
  getFeedback,
} = require("../controllers/feedbackController")

const router = express.Router()

router.use(authMiddleware)

router.post("/", submitFeedback)
router.get("/", getFeedback)

module.exports = router
