import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface AuthUser {
  id: string
  name: string
  email: string
  mobile?: string
  state?: string
  district?: string
  city?: string
  pinCode?: string
  profilePhoto?: string
}

type Role = "user" | "admin" | null

interface AuthState {
  token: string | null
  role: Role
  user: AuthUser | null
  setSession: (userOrToken: AuthUser | string, tokenOrRole: string | Role, user?: AuthUser | null) => void
  updateUser: (patch: Partial<AuthUser>) => void
  logout: () => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      role: null,
      user: null,
      setSession: (userOrToken, tokenOrRole, providedUser) => {
        const legacy = typeof userOrToken !== "string"
        const token = (legacy ? tokenOrRole : userOrToken) as string
        const user = (legacy ? userOrToken : providedUser) as AuthUser | null
        localStorage.setItem("cpgrams-token", token)
        set({ token, role: legacy ? "user" : (tokenOrRole as Role), user })
      },
      updateUser: (patch) => {
        const current = get().user
        if (current) set({ user: { ...current, ...patch } })
      },
      logout: () => {
        localStorage.removeItem("cpgrams-token")
        set({ token: null, role: null, user: null })
      },
    }),
    { name: "cpgrams-auth" },
  ),
)

export const useAuthStore = useAuth
