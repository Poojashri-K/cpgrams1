import { useEffect, useMemo, useState } from "react"
import { Badge, Button, Card, Select, Textarea } from "../components/ui"
import { AdminHeader } from "../components/layout/AdminHeader"
import {
  fetchAdminData,
  fetchAllAppeals,
  updateGrievanceStatus,
  updateAppealReview,
  type AdminAppealRecord,
  type Grievance,
  type GrievanceStatus,
} from "../lib/services"

type AppealReviewStatus = "pending" | "underReview" | "accepted" | "rejected" | "resolved"
type GrievanceReviewItem = Omit<Grievance, "user"> & {
  category?: string
  description?: string
  location?: string
  adminResponse?: string
  user?: string | { id: string; name: string; email: string; mobile?: string }
}

function reviewStatus(status: AdminAppealRecord["status"]): AppealReviewStatus {
  return status === "submitted" ? "pending" : status
}

function appealStatusText(status: AdminAppealRecord["status"]) {
  const current = status === "submitted" ? "pending" : status
  return current.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())
}

function appealStatusTone(status: AdminAppealRecord["status"]) {
  if (status === "resolved" || status === "accepted") return "green"
  if (status === "rejected") return "red"
  if (status === "underReview") return "navy"
  return "amber"
}

export default function AdminDashboard() {
  const [items, setItems] = useState<GrievanceReviewItem[]>([])
  const [selectedGrievance, setSelectedGrievance] = useState<GrievanceReviewItem | null>(null)
  const [grievanceStatusValue, setGrievanceStatusValue] = useState<GrievanceStatus>("submitted")
  const [grievanceResponse, setGrievanceResponse] = useState("")
  const [grievanceError, setGrievanceError] = useState("")
  const [grievanceSuccess, setGrievanceSuccess] = useState("")
  const [savingGrievance, setSavingGrievance] = useState(false)
  const [appealCount, setAppealCount] = useState<number | null>(null)
  const [appeals, setAppeals] = useState<AdminAppealRecord[]>([])
  const [appealError, setAppealError] = useState("")
  const [selectedAppeal, setSelectedAppeal] = useState<AdminAppealRecord | null>(null)
  const [reviewStatusValue, setReviewStatusValue] = useState<AppealReviewStatus>("pending")
  const [adminResponse, setAdminResponse] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState("")
  const [savingReview, setSavingReview] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchAdminData().then((data) => {
      setItems(data.grievances)
    })
    fetchAllAppeals().then((appeals) => {
      setAppeals(appeals)
      setAppealCount(appeals.length)
    }).catch((error: any) => {
      setAppealError(error?.response?.data?.message || "Unable to load appeals.")
    })
  }, [])

  const openAppeal = (appeal: AdminAppealRecord) => {
    setSelectedAppeal(appeal)
    setReviewStatusValue(reviewStatus(appeal.status))
    setAdminResponse(appeal.adminResponse || "")
    setReviewError("")
    setReviewSuccess("")
  }

  const saveAppealReview = async () => {
    if (!selectedAppeal || !adminResponse.trim()) {
      setReviewError("Admin response / action taken is required.")
      return
    }
    setSavingReview(true)
    setReviewError("")
    setReviewSuccess("")
    try {
      const updated = await updateAppealReview(selectedAppeal.id, {
        status: reviewStatusValue,
        adminResponse: adminResponse.trim(),
      })
      const nextAppeal = { ...selectedAppeal, ...updated }
      setAppeals((current) => current.map((appeal) => appeal.id === updated.id ? { ...appeal, ...updated } : appeal))
      setSelectedAppeal(nextAppeal)
      setReviewSuccess("Appeal review saved successfully.")
    } catch (error: any) {
      setReviewError(error?.response?.data?.message || "Unable to save appeal review.")
    } finally {
      setSavingReview(false)
    }
  }

  const shown = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.status === filter),
    [items, filter],
  )

  const openGrievance = (grievance: GrievanceReviewItem) => {
    setSelectedGrievance(grievance)
    setGrievanceStatusValue(grievance.status)
    setGrievanceResponse(grievance.adminResponse || "")
    setGrievanceError("")
    setGrievanceSuccess("")
  }

  const saveGrievanceReview = async () => {
    if (!selectedGrievance) return
    setSavingGrievance(true)
    setGrievanceError("")
    setGrievanceSuccess("")
    try {
      const updated = await updateGrievanceStatus(selectedGrievance.id, grievanceStatusValue, grievanceResponse.trim())
      const nextGrievance = { ...selectedGrievance, ...updated, user: selectedGrievance.user, status: grievanceStatusValue, adminResponse: grievanceResponse.trim() }
      setItems((current) => current.map((item) => item.id === selectedGrievance.id ? nextGrievance : item))
      setSelectedGrievance(nextGrievance)
      setGrievanceSuccess("Grievance changes saved successfully.")
    } catch (error: any) {
      setGrievanceError(error?.response?.data?.message || "Unable to save grievance changes.")
    } finally {
      setSavingGrievance(false)
    }
  }

  const resolvedCount = items.filter(
    (item) => item.status === "resolved",
  ).length

  const openCount = items.filter(
    (item) =>
      item.status !== "resolved" &&
      item.status !== "closed",
  ).length

  return (
    <div className="min-h-dvh bg-background">
      <AdminHeader />

      <main className="mx-auto w-full px-8 py-10">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
                Administration
              </p>

              <h1 className="mt-2 text-3xl font-bold text-navy">
                Admin Dashboard
              </h1>

              <p className="mt-2 text-muted-foreground">
                Manage and track citizen grievances.
              </p>
            </div>

            <Select
              className="w-52"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="underReview">Under review</option>
              <option value="inProgress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                Total grievances
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">
                {items.length}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                Resolved
              </p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {resolvedCount}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                Open cases
              </p>
              <p className="mt-2 text-3xl font-bold text-saffron">
                {openCount}
              </p>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-muted-foreground">
                Appeals
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">
                {appealCount ?? "—"}
              </p>
            </Card>
          </div>

          <Card className="mt-8 overflow-hidden">
            <div className="border-b p-5">
              <h2 className="font-semibold text-navy">
                Grievance Management
              </h2>
            </div>

            <div className="divide-y">
              {shown.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No grievances found.
                </div>
              ) : (
                shown.map((item) => (
                  <div
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                    key={item.id}
                  >
                    <button type="button" className="min-w-0 text-left" onClick={() => openGrievance(item)}>
                      <p className="font-semibold text-navy">
                        {item.subject}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.regNumber} · {item.department} ·{" "}
                        {item.filedOn}
                      </p>
                    </button>

                    <div className="flex items-center gap-3">
                      <Badge
                        tone={
                          item.status === "resolved"
                            ? "green"
                            : item.status === "rejected"
                              ? "red"
                              : "amber"
                        }
                      >
                        {item.status}
                      </Badge>

                      <Button type="button" variant="outline" onClick={() => openGrievance(item)}>Review Grievance</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="mt-8 overflow-hidden">
            <div className="border-b p-5">
              <h2 className="font-semibold text-navy">Appeal Management</h2>
            </div>
            <div className="divide-y">
              {appealError ? (
                <p className="p-6 text-sm text-destructive" role="alert">{appealError}</p>
              ) : appeals.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">No appeals found.</p>
              ) : (
                appeals.map((appeal) => (
                  <div key={appeal.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-semibold text-navy">{appeal.regNumber || "Registration number unavailable"}</p>
                      <p className="text-sm text-foreground">{appeal.grievanceSubject || "Grievance subject unavailable"}</p>
                      <p className="text-sm text-muted-foreground">
                        Citizen: {appeal.user?.name || "Unavailable"} <span aria-hidden>·</span> Appeal date: {new Date(appeal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge tone={appealStatusTone(appeal.status)}>{appealStatusText(appeal.status)}</Badge>
                      <Button type="button" variant="outline" onClick={() => openAppeal(appeal)}>View Appeal</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </main>

      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget && !savingGrievance) setSelectedGrievance(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="grievance-review-title" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="grievance-review-title" className="text-2xl font-bold text-navy">Grievance Review</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selectedGrievance.regNumber}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" disabled={savingGrievance} onClick={() => setSelectedGrievance(null)}>Close</Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-semibold text-navy">Grievance Details</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Registration Number</dt><dd>{selectedGrievance.regNumber}</dd></div>
                  <div><dt className="text-muted-foreground">Subject</dt><dd className="font-medium">{selectedGrievance.subject}</dd></div>
                  <div><dt className="text-muted-foreground">Department</dt><dd>{selectedGrievance.department}</dd></div>
                  <div><dt className="text-muted-foreground">Category</dt><dd>{selectedGrievance.category || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Current Status</dt><dd>{selectedGrievance.status}</dd></div>
                  <div><dt className="text-muted-foreground">Grievance Description</dt><dd className="whitespace-pre-wrap leading-6">{selectedGrievance.description || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Submission Date</dt><dd>{selectedGrievance.filedOn || "Unavailable"}</dd></div>
                  {selectedGrievance.location && <div><dt className="text-muted-foreground">Location</dt><dd>{selectedGrievance.location}</dd></div>}
                </dl>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-navy">Citizen Details</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Name</dt><dd>{typeof selectedGrievance.user === "object" ? selectedGrievance.user?.name || "Unavailable" : "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd className="break-all">{typeof selectedGrievance.user === "object" ? selectedGrievance.user?.email || "Unavailable" : "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Mobile Number</dt><dd>{typeof selectedGrievance.user === "object" ? selectedGrievance.user?.mobile || "Unavailable" : "Unavailable"}</dd></div>
                </dl>
              </Card>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="grievance-review-status" className="mb-1.5 block text-sm font-medium text-foreground">Grievance Status</label>
                <Select id="grievance-review-status" value={grievanceStatusValue} onChange={(event) => setGrievanceStatusValue(event.target.value as GrievanceStatus)}>
                  <option value="submitted">Submitted</option>
                  <option value="underReview">Under Review</option>
                  <option value="inProgress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="grievance-admin-response" className="mb-1.5 block text-sm font-medium text-foreground">Admin Response / Action Taken</label>
                <Textarea id="grievance-admin-response" rows={4} value={grievanceResponse} onChange={(event) => setGrievanceResponse(event.target.value)} />
              </div>
            </div>
            {grievanceError && <p className="mt-4 text-sm text-destructive" role="alert">{grievanceError}</p>}
            {grievanceSuccess && <p className="mt-4 text-sm text-green-700" role="status">{grievanceSuccess}</p>}
            <div className="mt-6 flex justify-end">
              <Button type="button" loading={savingGrievance} disabled={savingGrievance} onClick={saveGrievanceReview}>
                {savingGrievance ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </section>
        </div>
      )}

      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget && !savingReview) setSelectedAppeal(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="appeal-review-title" className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="appeal-review-title" className="text-2xl font-bold text-navy">Appeal Review</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selectedAppeal.regNumber}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" disabled={savingReview} onClick={() => setSelectedAppeal(null)}>Close</Button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-5">
                <h3 className="font-semibold text-navy">Original Grievance</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Subject</dt><dd className="font-medium">{selectedAppeal.grievanceSubject || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Department</dt><dd>{selectedAppeal.department || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Current grievance status</dt><dd>{selectedAppeal.grievanceStatus || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Grievance details</dt><dd className="whitespace-pre-wrap leading-6">{selectedAppeal.grievanceDescription || "Unavailable"}</dd></div>
                </dl>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold text-navy">Citizen Details</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div><dt className="text-muted-foreground">Name</dt><dd>{selectedAppeal.user?.name || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Email</dt><dd className="break-all">{selectedAppeal.user?.email || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Mobile</dt><dd>{selectedAppeal.user?.mobile || "Unavailable"}</dd></div>
                  <div><dt className="text-muted-foreground">Appeal date</dt><dd>{new Date(selectedAppeal.createdAt).toLocaleDateString()}</dd></div>
                  <div><dt className="text-muted-foreground">Appeal status</dt><dd>{appealStatusText(selectedAppeal.status)}</dd></div>
                </dl>
              </Card>
            </div>

            <Card className="mt-6 p-5">
              <h3 className="font-semibold text-navy">Appeal Reason</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selectedAppeal.description}</p>
            </Card>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="appeal-review-status" className="mb-1.5 block text-sm font-medium text-foreground">Appeal Status</label>
                <Select id="appeal-review-status" value={reviewStatusValue} onChange={(event) => setReviewStatusValue(event.target.value as AppealReviewStatus)}>
                  <option value="pending">Pending</option>
                  <option value="underReview">Under Review</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="appeal-admin-response" className="mb-1.5 block text-sm font-medium text-foreground">Admin Response / Action Taken</label>
                <Textarea id="appeal-admin-response" rows={4} value={adminResponse} onChange={(event) => setAdminResponse(event.target.value)} required />
              </div>
            </div>
            {reviewError && <p className="mt-4 text-sm text-destructive" role="alert">{reviewError}</p>}
            {reviewSuccess && <p className="mt-4 text-sm text-green-700" role="status">{reviewSuccess}</p>}
            <div className="mt-6 flex justify-end">
              <Button type="button" loading={savingReview} disabled={savingReview || !adminResponse.trim()} onClick={saveAppealReview}>
                {savingReview ? "Saving..." : "Save Review"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
