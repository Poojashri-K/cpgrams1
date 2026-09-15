import { forwardRef } from "react"
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  LabelHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react"
import { Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

/* ---------------- Button ---------------- */
type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "destructive"
type Size = "sm" | "md" | "lg" | "icon"

const variants: Record<Variant, string> = {
  primary: "bg-navy text-navy-foreground hover:bg-navy-muted",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
  outline: "border border-border bg-card text-foreground hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  accent: "bg-saffron text-saffron-foreground hover:opacity-90",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
}
const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-base",
  icon: "h-10 w-10",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
)
Button.displayName = "Button"

/* ---------------- Input ---------------- */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border bg-card px-3 text-foreground placeholder:text-muted-foreground",
        "focus:border-ring",
        invalid ? "border-destructive" : "border-input",
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = "Input"

/* ---------------- Textarea ---------------- */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-md border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring",
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = "Textarea"

/* ---------------- Select ---------------- */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-card px-3 text-foreground focus:border-ring",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
)
Select.displayName = "Select"

/* ---------------- Label ---------------- */
export function Label({
  className,
  required,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn("mb-1.5 block text-sm font-medium text-foreground", className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </label>
  )
}

/* ---------------- Field wrapper ---------------- */
export function Field({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("space-y-1.5", className)}>{children}</div>
}

/* ---------------- Field error ---------------- */
export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null
  return <p className="mt-1 text-sm text-destructive">{children}</p>
}

/* ---------------- Card ---------------- */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
}

/* ---------------- Badge ---------------- */
export function Badge({
  className,
  tone = "navy",
  children,
}: {
  className?: string
  tone?: "navy" | "green" | "amber" | "gray" | "saffron" | "red"
  children: ReactNode
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy/10 text-navy",
    green: "bg-green/15 text-green",
    amber: "bg-[#c98a00]/15 text-[#8a5e00]",
    gray: "bg-muted text-muted-foreground",
    saffron: "bg-saffron/15 text-saffron",
    red: "bg-destructive/10 text-destructive",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
