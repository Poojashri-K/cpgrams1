import api from "./api"

import {
  DEPARTMENTS,
  STATES,
  type Grievance,
  type GrievanceStatus,
} from "./mock-data"

export { DEPARTMENTS, STATES }

export const GOVERNMENT_TYPES = [
  "Central Government",
  "State Government",
] as const

export async function loginUser(
  email: string,
  password: string,
) {
  const response = await api.post("/auth/login", {
    email,
    password,
  })

  return response.data
}

export async function sendRegistrationOtp(payload: {
  name: string
  email: string
  mobile: string
  password: string
}) {
  const response = await api.post("/auth/send-otp", payload)
  return response.data
}

export async function loginAdmin(
  employeeId: string,
  password: string,
) {
  const response = await api.post("/admin/login", {
    employeeId,
    password,
  })

  return response.data
}

export async function verifyRegistrationOtp(email: string, otp: string) {
  const response = await api.post("/auth/verify-otp", { email, otp })
  return response.data
}

export async function fetchProfile() {
  const response = await api.get("/users/me")
  return response.data.user
}

export async function updateProfile(payload: Partial<{
  name: string
  email: string
  mobile: string
  city: string
  district: string
  pinCode: string
  profilePhoto: string
}>) {
  const response = await api.put("/users/me", payload)
  return response.data
}

export async function changePassword(payload: {
  currentPassword: string
  newPassword: string
}) {
  const response = await api.put("/users/change-password", payload)
  return response.data
}

export async function deleteAccount() {
  const response = await api.delete("/users/me")
  return response.data
}

export async function fetchMyGrievances(): Promise<CitizenGrievance[]> {
  const response = await api.get("/grievances/my")
  return response.data.grievances ?? []
}

export async function fetchGrievanceByReg(regNumber: string) {
  const response = await api.get("/grievances/lookup", {
    params: { regNumber },
  })

  return response.data.grievance
}

export async function submitGrievance(payload: Partial<Grievance>) {
  const response = await api.post("/grievances", {
    subject: payload.subject,
    description: payload.description,
    category: payload.category,
    department: payload.department,
    governmentType: payload.governmentType || "Central Government",
    state: payload.state || "",
    district: payload.district || "",
    priority: payload.priority || "medium",
    location: payload.location || "",
  })

  return response.data
}

export async function submitFeedback(
  regNumber: string,
  rating: number,
  comment: string,
) {
  const response = await api.post("/feedback", {
    regNumber,
    rating,
    comment,
  })

  return response.data
}

export async function getMyFeedback() {
  const response = await api.get("/feedback")
  return response.data.feedback ?? []
}

export async function createAppeal(payload: {
  grievanceId: string
  subject: string
  description: string
}) {
  const response = await api.post("/appeals", payload)
  return response.data
}

export type AppealRecord = {
  id: string
  grievanceId: string
  regNumber: string
  subject: string
  description: string
  reason?: string
  status: "pending" | "submitted" | "underReview" | "accepted" | "rejected" | "resolved"
  createdAt: string
  adminResponse?: string
}

export type CitizenGrievance = Grievance & {
  adminResponse?: string
}

export type AdminAppealRecord = AppealRecord & {
  grievanceSubject: string
  grievanceDescription: string
  department: string
  grievanceStatus: string
  grievanceDate: string | null
  user: { id: string; name: string; email: string; mobile?: string } | null
}

export async function fetchMyAppeals(): Promise<AppealRecord[]> {
  const response = await api.get("/appeals/my")
  return response.data.appeals ?? []
}

export async function fetchAllAppeals(): Promise<AdminAppealRecord[]> {
  const response = await api.get("/appeals/all")
  return response.data.appeals ?? []
}

export async function updateAppealReview(
  id: string,
  payload: { status: "pending" | "underReview" | "accepted" | "rejected" | "resolved"; adminResponse: string },
) {
  const response = await api.patch(`/appeals/${id}/review`, payload)
  return response.data.appeal as { id: string; status: AdminAppealRecord["status"]; adminResponse: string }
}

export async function updateGrievanceStatus(
  id: string,
  status: GrievanceStatus,
  adminResponse = "",
) {
  const response = await api.patch(`/admin/grievances/${id}/status`, {
    status,
    adminResponse,
  })

  return response.data.grievance
}

export async function fetchAdminData() {
  const response = await api.get("/admin/dashboard")
  return response.data
}

export const authService = {
  login: loginUser,
  sendOtp: sendRegistrationOtp,
  verifyOtp: verifyRegistrationOtp,
}

export type {
  Grievance,
  GrievanceStatus,
}
