import { LogOut } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../store/auth"
import { Button } from "../ui"

export function AdminHeader() {
  const navigate = useNavigate()
  const logout = useAuth((state) => state.logout)

  function handleLogout() {
    logout()
    navigate("/admin/login")
  }

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="mx-auto flex w-full items-center justify-between px-8 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/cpgrams-emblem.png"
            alt=""
            className="h-11 w-11"
            aria-hidden
          />

          <div className="leading-tight">
            <p className="text-lg font-bold text-navy">CPGRAMS</p>
            <p className="text-xs text-muted-foreground">
              Administration Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-navy">
              Admin Officer
            </p>
            <p className="text-xs text-muted-foreground">
              Government of India
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader