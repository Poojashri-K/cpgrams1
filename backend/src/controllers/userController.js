const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Grievance = require("../models/Grievance")
const Feedback = require("../models/Feedback")
const Appeal = require("../models/Appeal")

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    city: user.city || "",
    district: user.district || "",
    pinCode: user.pinCode || "",
    profilePhoto: user.profilePhoto || "",
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean()

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    return res.json({ user: serializeUser(user) })
  } catch (error) {
    console.error("Get profile error:", error)
    return res.status(500).json({
      message: "Unable to fetch profile",
    })
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const allowedFields = [
      "name",
      "email",
      "mobile",
      "city",
      "district",
      "pinCode",
      "profilePhoto",
    ]

    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    }

    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findOne({
        email: updates.email.toLowerCase(),
      })

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({
          message: "Email already registered",
        })
      }

      updates.email = updates.email.toLowerCase()
    }

    Object.assign(user, updates)
    await user.save()

    return res.json({
      message: "Profile updated successfully",
      user: serializeUser(user),
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return res.status(500).json({
      message: "Profile update failed",
    })
  }
}

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new passwords are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      })
    }

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return res.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    return res.status(500).json({
      message: "Password update failed",
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id

    await Promise.all([
      Grievance.deleteMany({ user: userId }),
      Feedback.deleteMany({ user: userId }),
      Appeal.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ])

    return res.json({
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    return res.status(500).json({
      message: "Account deletion failed",
    })
  }
}
