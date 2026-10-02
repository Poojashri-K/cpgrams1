const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const adminMiddleware = require("../middleware/adminMiddleware")
const {
  loginAdmin,
  getDashboardData,
  getUsers,
  getFeedback,
  getGrievances,
  getGrievanceById,
  updateGrievanceStatus,
} = require("../controllers/adminController")

const router = express.Router()

router.post("/login", loginAdmin)
router.use(authMiddleware)
router.use(adminMiddleware)

router.get("/dashboard", getDashboardData)
router.get("/grievances", getGrievances)
router.get("/grievances/:id", getGrievanceById)
router.patch("/grievances/:id/status", updateGrievanceStatus)
router.get("/users", getUsers)
router.get("/feedback", getFeedback)

module.exports = router