const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Admin = require("../models/Admin")

exports.loginAdmin = async (req, res) => {
  try {
    const { employeeId, password } = req.body

    if (!employeeId || !password) {
      return res.status(400).json({
        message: "Employee ID and password are required",
      })
    }

    const admin = await Admin.findOne({ employeeId })

    if (!admin) {
      return res.status(401).json({
        message: "Invalid Employee ID or password",
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid Employee ID or password",
      })
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        employeeId: admin.employeeId,
      },
    })
  } catch (error) {
    console.error("Admin login error:", error)
    res.status(500).json({
      message: "Admin login failed",
    })
  }
}