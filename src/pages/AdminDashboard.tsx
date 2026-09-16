import { useEffect, useMemo, useState } from "react"
import { Badge, Card, Select } from "../components/ui"
import { AdminHeader } from "../components/layout/AdminHeader"
import {
  fetchAdminData,
  updateGrievanceStatus,
  type Grievance,
  type GrievanceStatus,
} from "../lib/services"

export default function AdminDashboard() {
  const [items, setItems] = useState<Grievance[]>([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchAdminData().then((data) => {
      setItems(data.grievances)
    })
  }, [])

  const shown = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((item) => item.status === filter),
    [items, filter],
  )

  const update = async (id: string, status: GrievanceStatus) => {
    await updateGrievanceStatus(id, status)

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    )
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
                Departments
              </p>
              <p className="mt-2 text-3xl font-bold text-navy">
                10
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
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">
                        {item.subject}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.regNumber} · {item.department} ·{" "}
                        {item.filedOn}
                      </p>
                    </div>

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

                      <Select
                        className="w-40"
                        value={item.status}
                        onChange={async (e) => {
                          const status =
                            e.target.value as GrievanceStatus

                          await update(item.id, status)
                        }}
                      >
                        <option value="submitted">
                          Submitted
                        </option>
                        <option value="underReview">
                          Under review
                        </option>
                        <option value="inProgress">
                          In progress
                        </option>
                        <option value="resolved">
                          Resolved
                        </option>
                        <option value="closed">
                          Closed
                        </option>
                        <option value="rejected">
                          Rejected
                        </option>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}