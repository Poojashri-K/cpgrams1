const express = require("express")
const { register, login, sendRegistrationOtp, verifyRegistrationOtp } = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")
const { getMe, updateProfile, changePassword, deleteAccount } = require("../controllers/userController")

const router = express.Router()

router.post("/register", register)
router.post("/send-otp", sendRegistrationOtp)
router.post("/verify-otp", verifyRegistrationOtp)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.put("/me", authMiddleware, updateProfile)
router.put("/change-password", authMiddleware, changePassword)
router.delete("/me", authMiddleware, deleteAccount)

module.exports = router
