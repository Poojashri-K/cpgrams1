import { useTranslation } from "react-i18next"
import { Badge } from "./ui"
import type { GrievanceStatus } from "../lib/mock-data"

const toneMap: Record<GrievanceStatus, "navy" | "green" | "amber" | "gray" | "red"> = {
  submitted: "navy",
  underReview: "amber",
  inProgress: "amber",
  resolved: "green",
  closed: "gray",
  rejected: "red",
}

export function StatusBadge({ status }: { status: GrievanceStatus }) {
  const { t } = useTranslation()
  return <Badge tone={toneMap[status]}>{t(`statusValues.${status}`)}</Badge>
}
