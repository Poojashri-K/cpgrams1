const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: "user",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )
}

exports.register = async (req, res) => {
  try {
    const { name, email, mobile, phone, password } = req.body

    if (!name || !email || !(mobile || phone) || !password) {
      return res.status(400).json({
        message: "All required fields must be provided",
      })
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      mobile: mobile || phone,
      password: hashedPassword,
    })

    const token = createToken(user)

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    res.status(500).json({
      message: "Registration failed",
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    })

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    const token = createToken(user)

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        city: user.city,
        district: user.district,
        pinCode: user.pinCode,
        profilePhoto: user.profilePhoto,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Login failed",
    })
  }
}