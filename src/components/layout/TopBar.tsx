import { useTranslation } from "react-i18next"
import { AArrowDown, AArrowUp, ALargeSmall, Contrast, Globe } from "lucide-react"
import { LANGUAGES } from "../../i18n"
import { useSettings } from "../../store/settings"
import { cn } from "../../lib/utils"

export function TopBar() {
  const { t, i18n } = useTranslation()
  const { increaseFont, decreaseFont, setFontScale, toggleContrast, highContrast, fontScale } =
    useSettings()

  return (
    <div className="bg-navy text-navy-foreground">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-xs">
        <p className="font-medium">{t("common.govtOfIndia")}</p>

        <div className="flex items-center gap-4">
          {/* Font size controls */}
          <div className="flex items-center gap-1" role="group" aria-label={t("accessibility.fontSize")}>
            <button
              type="button"
              onClick={decreaseFont}
              disabled={fontScale === "sm"}
              className="rounded p-1 hover:bg-navy-muted disabled:opacity-40"
              aria-label={t("accessibility.decreaseFont")}
              title={t("accessibility.decreaseFont")}
            >
              <AArrowDown className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setFontScale("base")}
              className="rounded p-1 hover:bg-navy-muted"
              aria-label={t("accessibility.normalFont")}
              title={t("accessibility.normalFont")}
            >
              <ALargeSmall className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={increaseFont}
              disabled={fontScale === "lg"}
              className="rounded p-1 hover:bg-navy-muted disabled:opacity-40"
              aria-label={t("accessibility.increaseFont")}
              title={t("accessibility.increaseFont")}
            >
              <AArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* High contrast */}
          <button
            type="button"
            onClick={toggleContrast}
            aria-pressed={highContrast}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 hover:bg-navy-muted",
              highContrast && "bg-navy-muted",
            )}
            title={t("accessibility.highContrast")}
          >
            <Contrast className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{t("accessibility.highContrast")}</span>
          </button>

          {/* Language */}
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4" aria-hidden />
            <label htmlFor="lang-select" className="sr-only">
              {t("accessibility.language")}
            </label>
            <select
              id="lang-select"
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="rounded bg-navy-muted px-1.5 py-1 text-xs text-navy-foreground focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="text-foreground">
                  {l.native}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
