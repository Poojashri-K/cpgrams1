import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../store/auth"

export function RequireAuth({ role, children }: { role: "user" | "admin"; children: ReactNode }) {
  const { token, role: currentRole } = useAuth()
  const location = useLocation()

  if (!token || currentRole !== role) {
    const to = role === "admin" ? "/admin/login" : "/login"
    return <Navigate to={to} state={{ from: location.pathname }} replace />
  }
  return <>{children}</>
}
