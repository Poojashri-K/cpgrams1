import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { RefreshCw } from "lucide-react"

function generate(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

/**
 * Renders a distorted-text captcha. Reports the current expected code to the parent
 * via onChange so validation can happen locally (mock backend).
 */
export function Captcha({ onChange, onValidChange }: { onChange?: (code: string) => void; onValidChange?: (valid: boolean) => void }) {
  const { t } = useTranslation()
  const [code, setCode] = useState(() => generate())
  const [value, setValue] = useState("")

  const refresh = useCallback(() => {
    setCode(generate())
    setValue("")
    onValidChange?.(false)
  }, [onValidChange])

  useEffect(() => {
    onChange?.(code)
    onValidChange?.(false)
  }, [code, onChange, onValidChange])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
      <div
        aria-hidden
        className="select-none rounded-md border border-input bg-secondary px-4 py-2 font-mono text-xl font-bold tracking-[0.4em] text-navy"
        style={{
          fontStyle: "italic",
          background:
            "repeating-linear-gradient(45deg, var(--color-secondary), var(--color-secondary) 6px, var(--color-muted) 6px, var(--color-muted) 12px)",
        }}
      >
        {code}
      </div>
      <button
        type="button"
        onClick={refresh}
        className="rounded-md border border-input p-2 text-navy hover:bg-secondary"
        aria-label={t("status.captchaRefresh")}
        title={t("status.captchaRefresh")}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
      </button>
      <span className="sr-only">Captcha code is {code.split("").join(" ")}</span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
          setValue(nextValue)
          onValidChange?.(nextValue === code)
        }}
        placeholder={t("status.captchaPlaceholder")}
        aria-label={t("status.captcha")}
        autoComplete="off"
        maxLength={6}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}
