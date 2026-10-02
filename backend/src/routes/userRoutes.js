const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const {
  getMe,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/userController")

const router = express.Router()

router.use(authMiddleware)

router.get("/me", getMe)
router.put("/me", updateProfile)
router.put("/change-password", changePassword)
router.delete("/me", deleteAccount)

module.exports = router
