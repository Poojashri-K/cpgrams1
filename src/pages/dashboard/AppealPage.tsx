import { useEffect, useState, type FormEvent } from "react"
import { Badge, Button, Card, Field, Label, Select, Textarea } from "../../components/ui"
import {
  createAppeal,
  fetchMyAppeals,
  fetchMyGrievances,
  type AppealRecord,
  type Grievance,
} from "../../lib/services"

function statusTone(status: AppealRecord["status"]) {
  if (status === "resolved") return "green"
  if (status === "rejected") return "red"
  if (status === "underReview") return "navy"
  return "amber"
}

function appealStatusLabel(status: AppealRecord["status"]) {
  return status === "submitted" ? "Pending" : readableStatus(status)
}

function readableStatus(status: string) {
  return status.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())
}

export function AppealPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [appeals, setAppeals] = useState<AppealRecord[]>([])
  const [selectedAppeal, setSelectedAppeal] = useState<AppealRecord | null>(null)
  const [selectedGrievanceId, setSelectedGrievanceId] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [grievancesError, setGrievancesError] = useState("")
  const [appealsError, setAppealsError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingGrievances, setLoadingGrievances] = useState(true)
  const [loadingAppeals, setLoadingAppeals] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMyGrievances()
      .then(setGrievances)
      .catch((requestError: any) => {
        setGrievancesError(requestError?.response?.data?.message || "Unable to load your grievances.")
      })
      .finally(() => setLoadingGrievances(false))

    fetchMyAppeals()
      .then(setAppeals)
      .catch((requestError: any) => {
        setAppealsError(requestError?.response?.data?.message || "Unable to load your appeals.")
      })
      .finally(() => setLoadingAppeals(false))
  }, [])

  const selectedGrievance = grievances.find(
    (grievance) => grievance.id === selectedGrievanceId,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedGrievance) {
      setError("Select a grievance from your account before submitting an appeal.")
      return
    }
    if (!reason.trim()) {
      setError("Reason for Appeal is required.")
      return
    }

    setSubmitting(true)
    try {
      const result = await createAppeal({
        grievanceId: selectedGrievance.id,
        subject: `Appeal for ${selectedGrievance.regNumber}`,
        description: reason.trim(),
      })
      setSuccess(result?.message || "Appeal submitted successfully.")
      setSelectedGrievanceId("")
      setReason("")

      try {
        setAppeals(await fetchMyAppeals())
        setAppealsError("")
      } catch (requestError: any) {
        setAppealsError(requestError?.response?.data?.message || "Appeal was submitted, but the list could not be refreshed.")
      }
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message || "Unable to submit appeal. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Appeal</h1>
        <p className="mt-3 text-muted-foreground">Submit and track an appeal for one of your grievances.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Submit an Appeal</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          {success && <p className="text-sm text-green-700" role="status">{success}</p>}

          <Field>
            <Label htmlFor="appeal-grievance" required>Select Grievance</Label>
            <Select
              id="appeal-grievance"
              value={selectedGrievanceId}
              onChange={(event) => setSelectedGrievanceId(event.target.value)}
              disabled={loadingGrievances || grievances.length === 0}
              required
            >
              <option value="">{loadingGrievances ? "Loading your grievances..." : "Select a grievance"}</option>
              {grievances.map((grievance) => (
                <option key={grievance.id} value={grievance.id}>
                  {grievance.regNumber} — {grievance.subject}
                </option>
              ))}
            </Select>
            {selectedGrievance && (
              <div className="mt-3 grid gap-3 rounded-md border border-border bg-muted/40 p-4 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">Registration number:</span> <strong>{selectedGrievance.regNumber}</strong></p>
                <p><span className="text-muted-foreground">Subject:</span> <strong>{selectedGrievance.subject}</strong></p>
                <p><span className="text-muted-foreground">Department:</span> <strong>{selectedGrievance.department}</strong></p>
                <p><span className="text-muted-foreground">Current status:</span> <strong>{readableStatus(selectedGrievance.status)}</strong></p>
              </div>
            )}
            {grievancesError && <p className="text-sm text-destructive" role="alert">{grievancesError}</p>}
            {!loadingGrievances && !grievancesError && grievances.length === 0 && (
              <p className="text-sm text-muted-foreground">You need a submitted grievance before you can appeal.</p>
            )}
          </Field>

          <Field>
            <Label htmlFor="appeal-reason" required>Reason for Appeal</Label>
            <Textarea
              id="appeal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why you are appealing this grievance."
              rows={6}
              required
            />
          </Field>

          <Button type="submit" disabled={submitting || loadingGrievances || grievances.length === 0} loading={submitting}>
            {submitting ? "Submitting..." : "Submit Appeal"}
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b p-5">
          <h2 className="font-semibold text-navy">My Appeals</h2>
        </div>
        <div className="divide-y">
          {loadingAppeals ? (
            <p className="p-6 text-sm text-muted-foreground">Loading your appeals...</p>
          ) : appealsError ? (
            <p className="p-6 text-sm text-destructive" role="alert">{appealsError}</p>
          ) : appeals.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">You have not submitted any appeals yet.</p>
          ) : (
            appeals.map((appeal) => (
              <article key={appeal.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <p className="font-semibold text-navy">{appeal.regNumber || "Registration number unavailable"}</p>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground"><span className="font-medium">Reason:</span> {appeal.reason || appeal.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(appeal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={statusTone(appeal.status)}>{appealStatusLabel(appeal.status)}</Badge>
                <Button type="button" variant="outline" onClick={() => setSelectedAppeal(appeal)}>View Appeal</Button>
              </article>
            ))
          )}
        </div>
      </Card>

      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedAppeal(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="my-appeal-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="my-appeal-title" className="text-2xl font-bold text-navy">Appeal Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selectedAppeal.regNumber || "Registration number unavailable"}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAppeal(null)}>Close</Button>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-semibold text-navy">Appeal Reason</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selectedAppeal.reason || selectedAppeal.description}</p>
              </Card>
              <Card className="p-5">
                <h3 className="font-semibold text-navy">Appeal Status</h3>
                <p className="mt-3"><Badge tone={statusTone(selectedAppeal.status)}>{appealStatusLabel(selectedAppeal.status)}</Badge></p>
              </Card>
            </div>

            <Card className="mt-6 p-5">
              <h3 className="font-semibold text-navy">Admin Response / Action Taken</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selectedAppeal.adminResponse?.trim() || "Admin response is not available yet."}</p>
            </Card>
          </section>
        </div>
      )}
    </section>
  )
}

export default AppealPage
