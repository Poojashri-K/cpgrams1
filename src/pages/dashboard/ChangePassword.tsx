import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Card, Input, Label } from "../../components/ui"
import { Captcha } from "../../components/Captcha"

export function ChangePassword() {
  const { t } = useTranslation()
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [captchaValid, setCaptchaValid] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSubmitted(false)
    if (!oldPassword || !newPassword || !confirmPassword) return setError("Please complete all password fields.")
    if (newPassword.length < 6) return setError("New password must be at least 6 characters.")
    if (newPassword !== confirmPassword) return setError("New password and confirm password must match.")
    if (!captchaValid) return setError("Please enter the CAPTCHA correctly.")
    setSubmitted(true)
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-navy">{t("dashboard.changePassword")}</h1>
      <p className="mt-2 text-muted-foreground">Update your account password securely.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
        <div><Label required>Old Password</Label><Input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} autoComplete="current-password" required /></div>
        <div><Label required>New Password</Label><Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></div>
        <div><Label required>Confirm Password</Label><Input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" minLength={6} required /></div>
        <div><Label required>CAPTCHA</Label><Captcha onValidChange={setCaptchaValid} /></div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        {submitted && <p className="text-sm text-green-700" role="status">Password changed successfully.</p>}
        <Button type="submit" variant="primary">Change Password</Button>
      </form>
    </Card>
  )
}
export default ChangePassword
