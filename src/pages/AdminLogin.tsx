import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthShell } from "../components/AuthShell"
import { Button, Input, Label } from "../components/ui"
import { loginAdmin } from "../lib/services"
import { useAuth } from "../store/auth"

export function AdminLogin() {
  const navigate = useNavigate()
  const setSession = useAuth((s) => s.setSession)

  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const result = await loginAdmin(employeeId, password)

      setSession(result.token, "admin", {
        id: result.admin.id,
        name: result.admin.name,
        email: `${employeeId}@cpgrams.gov.in`,
      })

      navigate("/admin")
    } catch {
      setError("Invalid Employee ID or password.")
    }
  }

  return (
    <AuthShell
      title="Admin Login"
      subtitle="Sign in to access the administration portal"
      admin
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label required htmlFor="employeeId">
            Employee ID
          </Label>
          <Input
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="Enter Employee ID"
            required
          />
        </div>

        <div>
          <Label required htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full">
          Sign in as admin
        </Button>
      </form>
    </AuthShell>
  )
}

export default AdminLogin