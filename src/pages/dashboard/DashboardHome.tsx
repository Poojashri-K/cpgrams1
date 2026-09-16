import { Card } from "../../components/ui"
import { useAuth } from "../../store/auth"

export default function DashboardHome() {
  const user = useAuth((state) => state.user)

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="rounded-2xl bg-navy p-8 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
          Citizen Portal
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Welcome, {user?.name || "Citizen"}!
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-white/75">
          Manage your grievances, track their status, update your profile,
          and access citizen services from one place.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-navy">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Access the most frequently used services.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          <a href="/dashboard/file-grievance">
            <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-lg font-bold text-white">
                +
              </div>

              <h3 className="mt-4 font-bold text-navy">
                File a Grievance
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Submit a new complaint to the concerned government department.
              </p>
            </Card>
          </a>

          <a href="/dashboard/check-status">
            <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-navy">
                ?
              </div>

              <h3 className="mt-4 font-bold text-navy">
                Check Grievance Status
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                Track the current status of your submitted grievance.
              </p>
            </Card>
          </a>

          <a href="/dashboard/grievances">
            <Card className="h-full p-6 transition-all hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-navy">
                ✓
              </div>

              <h3 className="mt-4 font-bold text-navy">
                My Grievances
              </h3>

              <p className="mt-2 text-sm text-muted-foreground">
                View all grievances submitted from your account.
              </p>
            </Card>
          </a>

        </div>
      </div>

      {/* Information */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-navy">
          Your Citizen Account
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="mt-1 font-semibold text-navy">
              {user?.name || "Citizen"}
            </p>
          </div>

          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="mt-1 font-semibold text-navy">
              {user?.email || "Not available"}
            </p>
          </div>

          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Account Type</p>
            <p className="mt-1 font-semibold text-navy">
              Citizen
            </p>
          </div>
        </div>
      </Card>

    </div>
  )
}