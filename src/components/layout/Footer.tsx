import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Phone, Mail, MapPin } from "lucide-react"
import { useAuth } from "../../store/auth"

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const { token, role } = useAuth()

  return (
    <footer className="mt-auto bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/cpgrams-emblem.png" alt="" className="h-10 w-10" aria-hidden />
            <div>
              <p className="font-bold">{t("common.appName")}</p>
              <p className="text-xs text-navy-foreground/70">{t("common.govtOfIndia")}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-navy-foreground/80">{t("common.ministry")}</p>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-foreground/70">
            {t("footer.quickLinks")}
          </h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">{t("nav.home")}</Link></li>
            {token && role === "user" && <li><Link to="/file-grievance" className="hover:underline">{t("nav.fileGrievance")}</Link></li>}
            <li><Link to="/check-status" className="hover:underline">{t("nav.checkStatus")}</Link></li>
            <li><Link to="/login" className="hover:underline">{t("nav.login")}</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-foreground/70">
            {t("footer.resources")}
          </h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faqs" className="hover:underline">{t("footer.faqs")}</Link></li>
            <li><a href="#" className="hover:underline">{t("footer.privacyPolicy")}</a></li>
            <li><a href="#" className="hover:underline">{t("footer.termsOfUse")}</a></li>
            <li><a href="#" className="hover:underline">{t("footer.sitemap")}</a></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-foreground/70">
            {t("home.contactTitle")}
          </h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" aria-hidden /> 1800-11-1234
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" aria-hidden /> help-cpgrams@gov.in
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Sardar Patel Bhawan, New Delhi - 110001
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-navy-foreground/70 sm:flex-row">
          <p>{t("footer.copyright", { year })}</p>
          <p>{t("footer.developedBy")}</p>
        </div>
      </div>
    </footer>
  )
}
