const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const {
  createAppeal,
  getMyAppeals,
  getAllAppeals,
  updateAppealReview,
} = require("../controllers/appealController")

const router = express.Router()

router.use(authMiddleware)

router.post("/", createAppeal)
router.get("/my", getMyAppeals)
router.get("/all", adminMiddleware, getAllAppeals)
router.patch("/:id/review", adminMiddleware, updateAppealReview)

module.exports = router
