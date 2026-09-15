import {
  mockGrievances,
  mockUser,
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

export const feedbackItems: {
  regNumber: string
  rating: number
  comment: string
}[] = []

let grievances: Grievance[] = [...mockGrievances]

function makeRegNumber() {
  const n = Math.floor(100000 + Math.random() * 899999)
  return `CPG/2024/${n}`
}

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("invalid")
  }

  const token = `mock.jwt.${btoa(email)}.${Date.now()}`

  return {
    token,
    user: {
      ...mockUser,
      email,
    },
  }
}

export async function loginAdmin(
  employeeId: string,
  password: string,
) {
  if (!employeeId || !password) {
    throw new Error("invalid")
  }

  const token = `mock.admin.jwt.${btoa(employeeId)}.${Date.now()}`

  return {
    token,
    admin: {
      id: "a1",
      name: "Admin Officer",
      employeeId,
    },
  }
}

export async function registerUser(payload: {
  name: string
  email: string
  mobile?: string
  phone?: string
  password: string
}) {
  const token = `mock.jwt.${btoa(payload.email)}.${Date.now()}`

  return {
    token,
    user: {
      ...mockUser,
      ...payload,
      mobile: payload.mobile || payload.phone || "",
    },
  }
}

export async function sendOtp(mobile: string) {
  return {
    sent: true,
    mobile,
    otp: "123456",
  }
}

export async function verifyOtp(otp: string) {
  return {
    verified: otp.length === 6,
  }
}

export async function fetchMyGrievances() {
  return grievances
}

export async function fetchGrievanceByReg(regNumber: string) {
  const found = grievances.find(
    (g) =>
      g.regNumber.toLowerCase() ===
      regNumber.trim().toLowerCase(),
  )

  if (!found) {
    throw new Error("notFound")
  }

  return found
}

export async function submitGrievance(
  payload: Partial<Grievance>,
) {
  const regNumber = makeRegNumber()
  const today = new Date().toISOString().slice(0, 10)

  const grievance: Grievance = {
    id: String(Date.now()),
    regNumber,
    subject: payload.subject || "",
    description: payload.description || "",
    category: payload.category || "",
    department: payload.department || "",
    priority: payload.priority || "medium",
    status: "submitted",
    filedOn: today,
    lastUpdate: today,
    state: payload.state || "",
    district: payload.district || "",
    location: payload.location,
    timeline: [
      {
        status: "submitted",
        date: today,
        note: "Grievance submitted successfully",
      },
    ],
  }

  grievances = [grievance, ...grievances]

  return {
    regNumber,
    grievance,
  }
}

export async function submitFeedback(
  regNumber: string,
  rating: number,
  comment: string,
) {
  feedbackItems.push({
    regNumber,
    rating,
    comment,
  })

  return {
    ok: true,
  }
}

export async function updateGrievanceStatus(
  id: string,
  status: GrievanceStatus,
) {
  const item = grievances.find((g) => g.id === id)

  if (!item) {
    throw new Error("notFound")
  }

  item.status = status
  item.lastUpdate = new Date().toISOString().slice(0, 10)

  item.timeline.push({
    status,
    date: item.lastUpdate,
    note: `Status updated to ${status}`,
  })

  return item
}

export async function fetchAdminData() {
  return {
    grievances: [...grievances],
    users: [{ ...mockUser }],
    departments: [...DEPARTMENTS],
    feedback: [...feedbackItems],
  }
}

export const authService = {
  login: loginUser,
  register: registerUser,
  sendOtp,
}

export type { Grievance, GrievanceStatus }