const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const connectDB = require("./config/db")
const User = require("./models/User")
const Admin = require("./models/Admin")

dotenv.config()

const resetAccounts = async () => {
  try {
    await connectDB()

    const userPassword = await bcrypt.hash("Citizen@123", 10)

    await User.findOneAndUpdate(
      { email: "citizen@test.com" },
      {
        name: "Test Citizen",
        email: "citizen@test.com",
        mobile: "9876543210",
        password: userPassword,
      },
      { upsert: true, new: true }
    )

    const adminPassword = await bcrypt.hash("Admin@123", 10)

    await Admin.findOneAndUpdate(
      { employeeId: "ADMIN001" },
      {
        name: "Admin Officer",
        employeeId: "ADMIN001",
        password: adminPassword,
      },
      { upsert: true, new: true }
    )

    console.log("Accounts reset successfully")
    console.log("USER: citizen@test.com / Citizen@123")
    console.log("ADMIN: ADMIN001 / Admin@123")

    process.exit(0)
  } catch (error) {
    console.error("Reset failed:", error)
    process.exit(1)
  }
}

resetAccounts()