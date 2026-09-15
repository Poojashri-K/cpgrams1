import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Card } from "../../components/ui"

export function DeleteAccount() {
  const { t } = useTranslation()
  const [agreed, setAgreed] = useState(false)
  const [deleted, setDeleted] = useState(false)

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-navy">{t("dashboard.deleteAccount")}</h1>
      <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
        <h2 className="font-semibold">This action is permanent</h2>
        <p className="mt-2 text-sm leading-6">Deleting your account permanently removes your account, grievance history, and related information. These records cannot be retrieved after deletion.</p>
      </div>
      <label className="mt-6 flex items-start gap-3 text-sm text-foreground">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" />
        <span>I agree to the above information</span>
      </label>
      <Button type="button" variant="destructive" disabled={!agreed || deleted} onClick={() => setDeleted(true)} className="mt-6">
        {deleted ? "Account Deleted" : "Delete Account"}
      </Button>
    </Card>
  )
}
export default DeleteAccount
