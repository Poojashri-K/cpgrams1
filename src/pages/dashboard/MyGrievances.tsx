import { useEffect, useState } from "react"
import { Badge, Button, Card } from "../../components/ui"
import { fetchMyGrievances, type CitizenGrievance } from "../../lib/services"

export function MyGrievances() {
  const [items, setItems] = useState<CitizenGrievance[]>([])
  const [selected, setSelected] = useState<CitizenGrievance | null>(null)

  useEffect(() => {
    let active = true

    fetchMyGrievances().then((data) => {
      if (active) setItems(data)
    })

    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-navy">My grievances</h1>
        <p className="mt-2 text-muted-foreground">
          Track every grievance you have submitted.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((g) => (
          <Card
            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
            key={g.id}
          >
            <div>
              <button type="button" className="text-left font-semibold text-navy hover:underline" onClick={() => setSelected(g)}>
                {g.subject}
              </button>
              <p className="mt-1 text-sm text-muted-foreground">
                {g.regNumber} · {g.department}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Filed {g.filedOn} · Updated {g.lastUpdate}
              </p>
            </div>

            <Badge tone={g.status === "resolved" ? "green" : "amber"}>
              {g.status}
            </Badge>
          </Card>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="my-grievance-title" className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="my-grievance-title" className="text-2xl font-bold text-navy">Grievance Details</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.regNumber}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button>
            </div>

            <Card className="mt-6 p-5">
              <dl className="space-y-3 text-sm">
                <div><dt className="text-muted-foreground">Registration Number</dt><dd className="font-medium">{selected.regNumber}</dd></div>
                <div><dt className="text-muted-foreground">Subject</dt><dd className="font-medium">{selected.subject}</dd></div>
                <div><dt className="text-muted-foreground">Department</dt><dd>{selected.department}</dd></div>
                <div><dt className="text-muted-foreground">Grievance Description</dt><dd className="whitespace-pre-wrap leading-6">{selected.description}</dd></div>
                <div><dt className="text-muted-foreground">Submitted Date</dt><dd>{selected.filedOn}</dd></div>
                <div><dt className="text-muted-foreground">Current Status</dt><dd><Badge tone={selected.status === "resolved" ? "green" : "amber"}>{selected.status}</Badge></dd></div>
              </dl>
            </Card>

            <Card className="mt-5 p-5">
              <h3 className="font-semibold text-navy">Admin Response / Action Taken</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                {selected.adminResponse?.trim() || "Admin response is not available yet."}
              </p>
            </Card>
          </section>
        </div>
      )}
    </div>
  )
}

export default MyGrievances
