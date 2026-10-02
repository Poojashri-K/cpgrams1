import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Button, Card } from "../../components/ui"
import { deleteAccount } from "../../lib/services"
import { useAuthStore } from "../../store/auth"
import toast from "react-hot-toast"

export function DeleteAccount() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [agreed, setAgreed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!agreed || loading) return

    setLoading(true)
    setError("")

    try {
      await deleteAccount()
      toast.success("Account deleted successfully.")
      logout()
      navigate("/login")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to delete account")
    } finally {
      setLoading(false)
    }
  }

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
      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
      <Button type="button" variant="destructive" disabled={!agreed || loading} onClick={() => setConfirmOpen(true)} className="mt-6">
        Delete Account
      </Button>
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-message"
            className="w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl"
          >
            <h2 id="delete-account-title" className="text-xl font-bold text-navy">Delete Account?</h2>
            <p id="delete-account-message" className="mt-3 text-sm leading-6 text-muted-foreground">
              This action cannot be reversed. Your account and associated information will be permanently deleted.
            </p>
            <p className="mt-3 text-sm font-medium">Are you sure you want to continue?</p>
            {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
            <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
              <Button type="button" variant="outline" disabled={loading} onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" loading={loading} disabled={loading} onClick={handleDelete}>
                {loading ? "Deleting..." : "Yes, Delete Account"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </Card>
  )
}
export default DeleteAccount
