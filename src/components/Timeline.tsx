import { useTranslation } from "react-i18next"
import { Check } from "lucide-react"
import type { TimelineEntry } from "../lib/mock-data"

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { t } = useTranslation()
  return (
    <ol className="relative ml-3 border-l-2 border-border">
      {entries.map((e, i) => {
        const isLast = i === entries.length - 1
        return (
          <li key={i} className="mb-6 ml-6 last:mb-0">
            <span
              className={`absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full ${
                isLast ? "bg-saffron" : "bg-green"
              }`}
            >
              <Check className="h-3 w-3 text-white" aria-hidden />
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">{t(`statusValues.${e.status}`)}</p>
              <time className="text-xs text-muted-foreground">{e.date}</time>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{e.note}</p>
          </li>
        )
      })}
    </ol>
  )
}
