const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const { recommendDepartment } = require("../controllers/departmentRecommendationController")
const {
  createGrievance,
  checkDuplicateGrievances,
  getMyGrievances,
  getGrievanceDetails,
  getGrievanceByRegNumber,
  updateGrievanceStatus,
} = require("../controllers/grievanceController")

const router = express.Router()

router.use(authMiddleware)

router.post("/check-duplicates", checkDuplicateGrievances)
router.post("/recommend-department", recommendDepartment)
router.post("/", createGrievance)
router.get("/my", getMyGrievances)
router.get("/lookup", getGrievanceByRegNumber)
router.get("/:id", getGrievanceDetails)
router.patch("/:id/status", adminMiddleware, updateGrievanceStatus)

module.exports = router
