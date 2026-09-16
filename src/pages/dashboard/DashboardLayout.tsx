import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../store/auth"

export function DashboardLayout() {
  const { t } = useTranslation()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const links = [
    ["/dashboard/file-grievance", t("nav.fileGrievance")],
    ["/dashboard/check-status", t("nav.checkStatus")],
    ["/dashboard/grievances", t("dashboard.myGrievances")],
    ["/dashboard/appeal", t("dashboard.sidebar.appeal")],
    ["/dashboard/profile", t("dashboard.sidebar.profile")],
    ["/dashboard/password", t("dashboard.sidebar.password")],
    ["/dashboard/delete", t("dashboard.sidebar.delete")],
    ["/dashboard/faqs", t("dashboard.sidebar.faq")],
    ["/dashboard/terms", t("dashboard.sidebar.terms")],
  ]

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="flex min-h-screen w-full">

        {/* SIDEBAR */}
        <aside className="hidden w-[300px] shrink-0 border-r border-border bg-white md:block">
          <div className="sticky top-0 flex min-h-screen flex-col px-6 py-6">

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="mb-8 flex w-full items-center gap-4 rounded-xl border border-border bg-background p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">
                  {(user?.name || "Citizen")
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
              )}

              <span className="min-w-0">
                <span className="block truncate text-base font-bold text-navy">
                  {user?.name || "Citizen"}
                </span>

                <span className="mt-1 block text-xs text-muted-foreground">
                  Citizen Account
                </span>
              </span>
            </button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5">
              {links.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-navy text-white shadow-sm"
                        : "text-foreground hover:bg-secondary hover:text-navy"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-border pt-5">
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate("/")
                }}
                className="w-full rounded-lg border border-destructive/30 bg-white px-4 py-3 text-left text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 flex-1 bg-background">
          <div className="w-full px-6 py-8 lg:px-10 xl:px-14">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  )
}

export default DashboardLayout