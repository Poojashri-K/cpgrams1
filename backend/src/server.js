const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")

dotenv.config()

const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use("/api/auth", authRoutes)
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