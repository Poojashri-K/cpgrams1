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
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="hidden w-60 shrink-0 space-y-1 self-start sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto md:block">
        <button
          type="button"
          onClick={() => navigate("/dashboard/profile/view")}
          className="mb-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-secondary"
          aria-label={t("dashboard.sidebar.profile")}
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="" className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {(user?.name || "Citizen").slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate font-semibold text-navy">{user?.name || "Citizen"}</span>
          </span>
        </button>
        {links.map(([to, label]) => <NavLink className="block rounded-md px-3 py-2 text-sm hover:bg-secondary" to={to} key={to}>{label}</NavLink>)}
        <button className="block w-full rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-secondary" onClick={() => { logout(); navigate("/") }}>Log Out</button>
      </aside>
      <main className="min-w-0 flex-1"><Outlet /></main>
    </div>
  )
}
export default DashboardLayout
