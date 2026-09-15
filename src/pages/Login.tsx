import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { LogIn } from "lucide-react"
import { AuthShell } from "../components/AuthShell"
import { Button, Input, Label, Field } from "../components/ui"
import { Captcha } from "../components/Captcha"
import { authService } from "../lib/services"
import { useAuthStore } from "../store/auth"
import { isEmail } from "../lib/validate"

export function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaOk, setCaptchaOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isEmail(email)) {
      return setError(t("auth.errEmail"))
    }

    if (password.length < 6) {
      return setError(t("auth.errPassword"))
    }

    if (!captchaOk) {
      return setError(t("auth.errCaptcha"))
    }

    setLoading(true)

    try {
      const { user, token } = await authService.login(email, password)
      setSession(user, token)
      navigate("/dashboard")
    } catch {
      setError(t("auth.errCredentials"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      icon={<LogIn className="h-6 w-6" aria-hidden />}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </div>
        )}

        <Field>
          <Label htmlFor="email">{t("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Label htmlFor="password">{t("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Captcha onValidChange={setCaptchaOk} />

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? t("common.pleaseWait") : t("auth.loginBtn")}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="font-medium text-primary hover:underline"
          >
            {t("auth.registerHere")}
          </Link>
        </p>

        <p className="rounded-md bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
          {t("auth.demoHint")}{" "}
          <strong>citizen@example.com</strong> /{" "}
          <strong>password</strong>
        </p>
      </form>
    </AuthShell>
  )
}

export default Login