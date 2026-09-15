import { useState } from "react"
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Menu, X, LogOut } from "lucide-react"
import { Button } from "../ui"
import { useAuth } from "../../store/auth"
import { cn } from "../../lib/utils"

export function Header() {
  const { t } = useTranslation()
  const { token, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const isDashboard = location.pathname.startsWith("/dashboard")

  const navItems = [
    { to: "/", label: t("nav.home") },
    ...(token && role === "user" ? [{ to: "/file-grievance", label: t("nav.fileGrievance") }] : []),
    { to: "/check-status", label: t("nav.checkStatus") },
    { to: "/#contact", label: t("home.contactTitle") },
  ]

  function handleLogout() {
    logout()
    setOpen(false)
    navigate("/")
  }

  function handleContactClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (window.location.pathname === "/") {
      event.preventDefault()
      setOpen(false)
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.replaceState(null, "", "/#contact")
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/cpgrams-emblem.png" alt="" className="h-12 w-12" aria-hidden />
          <div className="leading-tight">
            <p className="text-lg font-bold text-navy">{t("common.appName")}</p>
            <p className="hidden max-w-md text-xs text-muted-foreground sm:block">
              {t("common.appFullName")}
            </p>
          </div>
        </Link>

        {!isDashboard && <>
        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={item.to === "/#contact" ? handleContactClick : undefined}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary",
                  isActive && "bg-secondary text-navy",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}

          {token && role === "user" && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => cn(
                "rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary",
                isActive && "bg-secondary text-navy",
              )}
            >
              {t("nav.dashboard")}
            </NavLink>
          )}

          <div className="mx-2 h-6 w-px bg-border" />

          {token ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden />
              {t("nav.logout")}
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
                {t("nav.loginOnly")}
              </Button>
            </>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="rounded-md p-2 hover:bg-secondary lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
        </button>
        </>}
      </div>

      {/* Mobile nav */}
      {open && !isDashboard && (
        <nav className="border-t border-border bg-card px-4 py-3 lg:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={(event) => {
                  if (item.to === "/#contact") handleContactClick(event)
                  else setOpen(false)
                }}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary",
                    isActive && "bg-secondary text-navy",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            {token && role === "user" && (
              <NavLink to="/dashboard" onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">
                {t("nav.dashboard")}
              </NavLink>
            )}
            <div className="my-2 h-px bg-border" />
            {token ? (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4" aria-hidden />
                {t("nav.logout")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/login") }}>
                {t("nav.loginOnly")}
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
