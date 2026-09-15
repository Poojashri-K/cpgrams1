import { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { Layout } from "./components/layout/Layout"
import { RequireAuth } from "./components/RequireAuth"
import { Home } from "./pages/Home"
import { CheckStatus } from "./pages/CheckStatus"
import { FileGrievance } from "./pages/FileGrievance"
import { GrievanceConfirmation } from "./pages/GrievanceConfirmation"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { AdminLogin } from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import { Faqs } from "./pages/Faqs"
import { NotFound } from "./pages/NotFound"
import { DashboardLayout } from "./pages/dashboard/DashboardLayout"
import { MyGrievances } from "./pages/dashboard/MyGrievances"
import { Profile } from "./pages/dashboard/Profile"
import { ChangePassword } from "./pages/dashboard/ChangePassword"
import { DeleteAccount } from "./pages/dashboard/DeleteAccount"
import { EditProfile } from "./pages/dashboard/EditProfile"
import { SectionPage } from "./pages/dashboard/SectionPage"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/check-status" element={<CheckStatus />} />
          <Route
            path="/file-grievance"
            element={
              <RequireAuth role="user">
                <FileGrievance />
              </RequireAuth>
            }
          />
          <Route path="/grievance-confirmation" element={<GrievanceConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
          <Route path="/faqs" element={<Faqs />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth role="user">
                <DashboardLayout />
              </RequireAuth>
            }
          >
            
            <Route path="file-grievance" element={<FileGrievance />} />
            <Route path="check-status" element={<CheckStatus />} />
            <Route path="grievances" element={<MyGrievances />} />
            <Route path="profile" element={<EditProfile />} />
            <Route path="profile/view" element={<Profile />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="delete" element={<DeleteAccount />} />
            <Route path="faqs" element={<Faqs embedded />} />
            <Route path="appeal" element={<SectionPage type="appeal" />} />
            <Route path="terms" element={<SectionPage type="terms" />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
