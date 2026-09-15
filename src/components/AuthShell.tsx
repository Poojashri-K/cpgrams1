import type { ReactNode } from "react"
import { cn } from "../lib/utils"

export function AuthShell({
  title,
  subtitle,
  children,
  admin = false,
  icon,
}: {
  title: string
  subtitle: string
  children: ReactNode
  admin?: boolean
  icon?: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div
        className={cn(
          "overflow-hidden rounded-xl border shadow-sm",
          admin ? "border-navy" : "border-border",
        )}
      >
        <div className={cn("px-6 py-6 text-center", admin ? "bg-navy text-navy-foreground" : "bg-secondary")}>
          {icon || <img src="/cpgrams-emblem.png" alt="" className="mx-auto h-14 w-14" aria-hidden />}
          <h1 className={cn("mt-3 text-2xl font-bold", admin ? "text-navy-foreground" : "text-navy")}>
            {title}
          </h1>
          <p className={cn("mt-1 text-sm", admin ? "text-navy-foreground/80" : "text-muted-foreground")}>
            {subtitle}
          </p>
        </div>
        <div className="bg-card px-6 py-6 sm:px-8">{children}</div>
      </div>
    </div>
  )
}
