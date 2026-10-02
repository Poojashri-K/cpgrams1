const nodemailer = require("nodemailer")

let transporter

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
    const error = new Error("SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD must be configured")
    error.code = "SMTP_CONFIG_MISSING"
    throw error
  }

  if (!transporter) {
    const port = Number(SMTP_PORT)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  }
  return transporter
}

async function sendRegistrationEmail(email, otp) {
  // TEMPORARY: diagnostic metadata only; never log credentials or the OTP.
  console.error("[SMTP diagnostic]", JSON.stringify({
    SMTP_HOST_exists: Boolean(process.env.SMTP_HOST?.trim()),
    SMTP_USER_exists: Boolean(process.env.SMTP_USER?.trim()),
    SMTP_PASSWORD_exists: Boolean(process.env.SMTP_PASSWORD?.trim()),
    SMTP_PORT: process.env.SMTP_PORT?.trim() || "(unset)",
    recipient: String(email).replace(/[\r\n]/g, ""),
  }))

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  try {
    await getTransporter().sendMail({
      from,
      to: email,
      subject: "CPGRAMS email verification code",
      text: `Your CPGRAMS registration verification code is ${otp}. It expires in 5 minutes. If you did not request this code, you can ignore this email.`,
      html: `<p>Your CPGRAMS registration verification code is <strong>${otp}</strong>.</p><p>It expires in 5 minutes. If you did not request this code, you can ignore this email.</p>`,
    })
  } catch (error) {
    const redact = (value) => {
      let message = String(value || "Unknown email transport error").replace(/[\r\n]+/g, " ")
      const secrets = [
        process.env.SMTP_PASSWORD,
        process.env.SMTP_USER,
        process.env.SMTP_FROM,
        process.env.JWT_SECRET,
        process.env.MONGO_URI,
        otp,
        email,
      ].filter((secret) => typeof secret === "string" && secret.length > 0)
      for (const secret of secrets) {
        message = message.split(secret).join("[REDACTED]")
        const encodedSecret = Buffer.from(secret).toString("base64")
        if (encodedSecret) message = message.split(encodedSecret).join("[REDACTED]")
      }
      return message
    }

    console.error("[SMTP diagnostic] email send failed", JSON.stringify({
      error: redact(error.message),
      response: error.response ? redact(error.response) : undefined,
      code: redact(error.code || "(none)"),
      responseCode: error.responseCode || undefined,
    }))
    throw error
  }
}

module.exports = { sendRegistrationEmail }
