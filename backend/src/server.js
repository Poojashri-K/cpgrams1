const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()

const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const grievanceRoutes = require("./routes/grievanceRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")
const appealRoutes = require("./routes/appealRoutes")
const adminRoutes = require("./routes/adminRoutes")
const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/grievances", grievanceRoutes)
app.use("/api/feedback", feedbackRoutes)
app.use("/api/appeals", appealRoutes)
app.use("/api/admin", adminRoutes)

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CPGRAMS backend is running",
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
