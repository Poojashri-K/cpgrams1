import { useRef, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, Search, FileText, CalendarDays, Building2, Tag } from "lucide-react"
import { PageHeader } from "../components/PageHeader"
import { Captcha } from "../components/Captcha"
import { StatusBadge } from "../components/StatusBadge"
import { Timeline } from "../components/Timeline"
import { Button, Card, Input, Label, FieldError } from "../components/ui"
import { fetchGrievanceByReg } from "../lib/services"
import type { Grievance } from "../lib/mock-data"

export function CheckStatus() {
  const { t } = useTranslation()
  const [regNumber, setRegNumber] = useState("")
  const [captchaValid, setCaptchaValid] = useState(false)
  const captchaCode = useRef("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Grievance | null>(null)

  const handleCaptcha = useCallback((code: string) => {
    captchaCode.current = code
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    if (!regNumber.trim()) {
      setError(t("errors.required"))
      return
    }
    if (!captchaValid) {
      setError(t("status.invalidCaptcha"))
      return
    }

    setLoading(true)
    try {
      const g = await fetchGrievanceByReg(regNumber)
      setResult(g)
    } catch {
      setError(t("status.notFound"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader title={t("status.title")} subtitle={t("status.subtitle")} />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Label htmlFor="reg" required>
                {t("status.regNumber")}
              </Label>
              <Input
                id="reg"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder={t("status.regNumberPlaceholder")}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Try <code className="rounded bg-secondary px-1">CPG/2024/001234</code>
              </p>
            </div>

            <div>
              <Label required>{t("status.captcha")}</Label>
              <Captcha onChange={handleCaptcha} onValidChange={setCaptchaValid} />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <FieldError>{error}</FieldError>
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              <Search className="h-5 w-5" aria-hidden />
              {t("status.checkButton")}
            </Button>
          </form>
        </Card>

        {result && (
          <Card className="mt-6 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t("status.resultTitle")}
                </p>
                <p className="font-mono text-lg font-bold text-navy">{result.regNumber}</p>
              </div>
              <StatusBadge status={result.status} />
            </div>

            <div className="space-y-5 p-6">
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden />
                <p className="font-semibold text-foreground">{result.subject}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail icon={CalendarDays} label={t("status.filedOn")} value={result.filedOn} />
                <Detail icon={CalendarDays} label={t("status.lastUpdate")} value={result.lastUpdate} />
                <Detail icon={Tag} label={t("status.category")} value={result.category} />
                <Detail icon={Building2} label={t("status.department")} value={result.department} />
              </div>

              <div>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("status.timeline")}
                </h2>
                <Timeline entries={result.timeline} />
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  )
}
