const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const User = require("../models/User")
const RegistrationOtp = require("../models/RegistrationOtp")
const { sendRegistrationEmail } = require("../services/emailService")

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: "user",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  )
}

exports.register = async (req, res) => {
  return res.status(410).json({ message: "Registration now requires email OTP verification" })
}

function sendDuplicateMessage(error) {
  const duplicateField = Object.keys(error.keyPattern || error.keyValue || {})[0]
  if (duplicateField === "email") return "Email already registered"
  if (duplicateField === "mobile") return "Mobile number already registered"
  return null
}

function redactSensitiveValues(message, values) {
  const sensitiveValues = values
    .filter((value) => typeof value === "string" && value.length > 0)
  const redactions = sensitiveValues.flatMap((value) => [value, Buffer.from(value).toString("base64")])
  return redactions.reduce((safeMessage, value) => safeMessage.split(value).join("[REDACTED]"), message)
}

exports.sendRegistrationOtp = async (req, res) => {
  let generatedOtp = ""
  let pendingRegistrationId = null
  try {
    const name = String(req.body.name || "").trim()
    const email = String(req.body.email || "").trim().toLowerCase()
    const mobile = String(req.body.mobile || req.body.phone || "").trim()
    const password = String(req.body.password || "")

    if (!name || !email || !mobile || !password) {
      return res.status(400).json({ message: "Name, email, mobile number, and password are required" })
    }
    if (name.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{10}$/.test(mobile) || password.length < 6) {
      return res.status(400).json({ message: "Please provide valid registration details" })
    }

    await RegistrationOtp.deleteMany({ expiresAt: { $lte: new Date() } })
    if (await User.exists({ email })) return res.status(409).json({ message: "Email already registered" })
    if (await User.exists({ mobile })) return res.status(409).json({ message: "Mobile number already registered" })

    const otherPendingMobile = await RegistrationOtp.findOne({ mobile, email: { $ne: email } })
    if (otherPendingMobile) return res.status(409).json({ message: "Mobile number is already being used for another registration" })

    const otp = crypto.randomInt(100000, 1000000).toString()
    generatedOtp = otp
    const [otpHash, passwordHash] = await Promise.all([
      bcrypt.hash(otp, 10),
      bcrypt.hash(password, 10),
    ])
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const pendingRegistration = await RegistrationOtp.findOneAndUpdate(
      { email },
      { name, email, mobile, passwordHash, otpHash, expiresAt, attempts: 0 },
      { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
    )
    pendingRegistrationId = pendingRegistration._id

    await sendRegistrationEmail(email, otp)
    return res.json({ success: true, message: "OTP sent successfully" })
  } catch (error) {
    const duplicateMessage = sendDuplicateMessage(error)
    if (duplicateMessage) return res.status(409).json({ message: duplicateMessage })
    if (pendingRegistrationId) {
      await RegistrationOtp.deleteOne({ _id: pendingRegistrationId }).catch(() => {})
    }
    const smtpDetails = [error.message, error.code && `code=${error.code}`, error.responseCode && `responseCode=${error.responseCode}`, error.command && `command=${error.command}`]
      .filter(Boolean)
      .join(" | ")
    const safeSmtpDetails = redactSensitiveValues(smtpDetails, [
      process.env.SMTP_PASSWORD,
      process.env.SMTP_USER,
      process.env.SMTP_FROM,
      process.env.JWT_SECRET,
      process.env.MONGO_URI,
      String(req.body.email || "").trim().toLowerCase(),
      String(req.body.password || ""),
      generatedOtp,
    ]).replace(/[\r\n]+/g, " ")
    console.error("Send registration OTP failed:", safeSmtpDetails)
    return res.status(500).json({
      success: false,
      message: safeSmtpDetails,
      code: error.code || "EMAIL_SEND_FAILED",
    })
  }
}

exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase()
    const otp = String(req.body.otp || "").trim()
    if (!email || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ message: "Enter the 6-digit OTP sent to your email" })
    }

    const pending = await RegistrationOtp.findOne({ email, expiresAt: { $gt: new Date() } })
    if (!pending) return res.status(400).json({ message: "OTP expired or registration not found. Please request a new OTP" })
    if (pending.attempts >= 5) {
      await RegistrationOtp.deleteOne({ _id: pending._id })
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP" })
    }

    const matches = await bcrypt.compare(otp, pending.otpHash)
    if (!matches) {
      pending.attempts += 1
      if (pending.attempts >= 5) await RegistrationOtp.deleteOne({ _id: pending._id })
      else await pending.save()
      return res.status(400).json({ message: "Invalid OTP" })
    }

    const consumed = await RegistrationOtp.findOneAndDelete({
      _id: pending._id,
      otpHash: pending.otpHash,
      expiresAt: { $gt: new Date() },
    })
    if (!consumed) return res.status(400).json({ message: "OTP is invalid or has already been used" })

    const user = await User.create({
      name: pending.name,
      email: pending.email,
      mobile: pending.mobile,
      password: pending.passwordHash,
    })
    const token = createToken(user)
    return res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    })
  } catch (error) {
    const duplicateMessage = sendDuplicateMessage(error)
    if (duplicateMessage) return res.status(409).json({ message: duplicateMessage })
    console.error("Verify registration OTP failed:", error.message)
    return res.status(500).json({ message: "Registration failed. Please try again" })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("Login email:", email)

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    })

    console.log("User found:", !!user)

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    )

    console.log("Password match:", passwordMatch)

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
