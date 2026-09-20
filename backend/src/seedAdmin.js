const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const Admin = require("./models/Admin")

dotenv.config()

const seedAdmin = async () => {
  try {
    await connectDB()

    const employeeId = "ADMIN001"
    const password = "Admin@123"

    const existingAdmin = await Admin.findOne({ employeeId })

    if (existingAdmin) {
      console.log("Admin already exists")
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await Admin.create({
      name: "Admin Officer",
      employeeId,
      password: hashedPassword,
    })

    console.log("Admin created successfully")
    console.log("Employee ID:", employeeId)
    console.log("Password:", password)

    process.exit(0)
  } catch (error) {
    console.error("Admin creation failed:", error)
    process.exit(1)
  }
}

seedAdmin()