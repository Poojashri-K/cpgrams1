import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { UserPlus, ShieldCheck } from "lucide-react"
import { AuthShell } from "../components/AuthShell"
import { Button, Input, Label, Field } from "../components/ui"
import { Captcha } from "../components/Captcha"
import { authService } from "../lib/services"
import { useAuthStore } from "../store/auth"
import { isEmail, isPhone } from "../lib/validate"

export function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [step, setStep] = useState<"form" | "otp">("form")
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  })
  const [captchaOk, setCaptchaOk] = useState(false)
  const [otp, setOtp] = useState("")
  const [sentOtp, setSentOtp] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function onSubmitForm(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.name.trim().length < 3) {
      return setError(t("auth.errName"))
    }

    if (!isEmail(form.email)) {
      return setError(t("auth.errEmail"))
    }

    if (!isPhone(form.phone)) {
      return setError(t("auth.errPhone"))
    }

    if (form.password.length < 6) {
      return setError(t("auth.errPassword"))
    }

    if (form.password !== form.confirm) {
      return setError(t("auth.errMatch"))
    }

    if (!captchaOk) {
      return setError(t("auth.errCaptcha"))
    }

    setLoading(true)

    try {
      const { otp } = await authService.sendOtp(form.phone)
      setSentOtp(otp)
      setStep("otp")
    } catch {
      setError("Unable to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (otp !== sentOtp) {
      return setError(t("auth.errOtp"))
    }

    setLoading(true)

    try {
      const { user, token } = await authService.register(form)
      setSession(user, token)
      navigate("/dashboard")
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (step === "otp") {
    return (
      <AuthShell
        title={t("auth.otpTitle")}
        subtitle={t("auth.otpSubtitle", { phone: form.phone })}
        icon={<ShieldCheck className="h-6 w-6" aria-hidden />}
      >
        <form onSubmit={onVerify} className="space-y-4" noValidate>
          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
            {t("auth.otpDemo")} <strong>{sentOtp}</strong>
          </div>

          <Field>
            <Label htmlFor="otp">{t("auth.otpLabel")}</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              className="text-center text-lg tracking-[0.5em]"
              required
            />
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? t("common.pleaseWait")
              : t("auth.verifyBtn")}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("form")
              setError(null)
            }}
            className="w-full text-center text-sm text-primary hover:underline"
          >
            {t("auth.editDetails")}
          </button>
        </form>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      icon={<UserPlus className="h-6 w-6" aria-hidden />}
    >
      <form onSubmit={onSubmitForm} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <Field>
          <Label htmlFor="name">{t("auth.fullName")}</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="phone">{t("auth.phone")}</Label>
            <Input
              id="phone"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(e) =>
                update(
                  "phone",
                  e.target.value.replace(/\D/g, ""),
                )
              }
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) =>
                update("password", e.target.value)
              }
              required
            />
          </Field>

          <Field>
            <Label htmlFor="confirm">
              {t("auth.confirmPassword")}
            </Label>
            <Input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={(e) =>
                update("confirm", e.target.value)
              }
              required
            />
          </Field>
        </div>

        <Captcha onValidChange={setCaptchaOk} />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? t("common.pleaseWait")
            : t("auth.sendOtpBtn")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.haveAccount")}{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.loginHere")}
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}

export default Register