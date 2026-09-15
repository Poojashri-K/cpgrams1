import type { ReactNode } from "react"

export function PageHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="border-b border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold text-navy text-balance">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )
}
