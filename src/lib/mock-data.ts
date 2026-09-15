export type GrievanceStatus =
  | "submitted"
  | "underReview"
  | "inProgress"
  | "resolved"
  | "closed"
  | "rejected"

export interface TimelineEntry {
  status: GrievanceStatus
  date: string
  note: string
}

export interface Grievance {
  id: string
  regNumber: string
  subject: string
  description: string
  category: string
  department: string
  priority: "low" | "medium" | "high" | "urgent"
  status: GrievanceStatus
  filedOn: string
  lastUpdate: string
  state: string
  district: string
  location?: { lat: number; lng: number; label: string }
  timeline: TimelineEntry[]
}

export const CATEGORIES = [
  "Public Distribution System",
  "Electricity & Power",
  "Water Supply & Sanitation",
  "Roads & Transport",
  "Health & Family Welfare",
  "Education",
  "Pension & Retirement Benefits",
  "Municipal Services",
  "Police & Law Enforcement",
  "Revenue & Land Records",
]

export const DEPARTMENTS = [
  "Department of Food & Public Distribution",
  "Ministry of Power",
  "Ministry of Jal Shakti",
  "Ministry of Road Transport & Highways",
  "Ministry of Health & Family Welfare",
  "Department of School Education & Literacy",
  "Department of Pension & Pensioners' Welfare",
  "Ministry of Housing & Urban Affairs",
  "Ministry of Home Affairs",
  "Department of Land Resources",
]

export const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
]

export const mockGrievances: Grievance[] = [
  {
    id: "1",
    regNumber: "CPG/2024/001234",
    subject: "Irregular ration distribution at fair price shop",
    description:
      "The fair price shop in our locality has not distributed the monthly ration quota for the past two months. Multiple families are affected and the dealer is unresponsive.",
    category: "Public Distribution System",
    department: "Department of Food & Public Distribution",
    priority: "high",
    status: "inProgress",
    filedOn: "2024-11-02",
    lastUpdate: "2024-11-18",
    state: "Tamil Nadu",
    district: "Chennai",
    location: { lat: 13.0827, lng: 80.2707, label: "Chennai, Tamil Nadu" },
    timeline: [
      { status: "submitted", date: "2024-11-02", note: "Grievance submitted successfully" },
      { status: "underReview", date: "2024-11-05", note: "Assigned to District Supply Officer" },
      { status: "inProgress", date: "2024-11-18", note: "Field inspection scheduled" },
    ],
  },
  {
    id: "2",
    regNumber: "CPG/2024/001180",
    subject: "Frequent power cuts in residential area",
    description:
      "Our neighbourhood experiences unscheduled power cuts lasting 4-6 hours daily, affecting work-from-home and students.",
    category: "Electricity & Power",
    department: "Ministry of Power",
    priority: "medium",
    status: "resolved",
    filedOn: "2024-10-15",
    lastUpdate: "2024-11-10",
    state: "Maharashtra",
    district: "Pune",
    location: { lat: 18.5204, lng: 73.8567, label: "Pune, Maharashtra" },
    timeline: [
      { status: "submitted", date: "2024-10-15", note: "Grievance submitted successfully" },
      { status: "underReview", date: "2024-10-18", note: "Forwarded to State Electricity Board" },
      { status: "inProgress", date: "2024-10-28", note: "Transformer upgrade approved" },
      { status: "resolved", date: "2024-11-10", note: "Transformer replaced, supply stabilised" },
    ],
  },
  {
    id: "3",
    regNumber: "CPG/2024/001301",
    subject: "Pending pension disbursement for retired teacher",
    description:
      "My father, a retired government school teacher, has not received his pension for three months despite submitting all documents.",
    category: "Pension & Retirement Benefits",
    department: "Department of Pension & Pensioners' Welfare",
    priority: "urgent",
    status: "underReview",
    filedOn: "2024-11-20",
    lastUpdate: "2024-11-22",
    state: "Kerala",
    district: "Kochi",
    location: { lat: 9.9312, lng: 76.2673, label: "Kochi, Kerala" },
    timeline: [
      { status: "submitted", date: "2024-11-20", note: "Grievance submitted successfully" },
      { status: "underReview", date: "2024-11-22", note: "Document verification in progress" },
    ],
  },
]

export const mockUser = {
  id: "u1",
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  mobile: "9876543210",
  state: "Tamil Nadu",
  district: "Chennai",
  city: "Chennai",
  pinCode: "600001",
  profilePhoto: "",
}

export const mockStats = {
  totalGrievances: 4826512,
  resolved: 4391208,
  avgResolutionDays: 21,
}
