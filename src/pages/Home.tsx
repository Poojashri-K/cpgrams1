import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { MouseEvent } from "react"
import {
  Search,
  UserCircle,
  Phone,
  ArrowRight,
  ClipboardCheck,
  Hash,
  Activity,
  Mail,
  MapPin,
} from "lucide-react"
import { Card } from "../components/ui"
import { mockStats } from "../lib/mock-data"

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n)
}

export function Home() {
  const { t } = useTranslation()

  function handleContactClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" })
    window.history.replaceState(null, "", "/#contact")
  }

  const actions: Array<{
    to: string
    icon: typeof Search
    title: string
    desc: string
    tone: string
    noArrow?: boolean
  }> = [
    {
      to: "/check-status",
      icon: Search,
      title: t("home.checkStatusTitle"),
      desc: t("home.checkStatusDesc"),
      tone: "bg-navy text-navy-foreground",
    },
    {
      to: "/login",
      icon: UserCircle,
      title: t("home.loginTitle"),
      desc: t("home.loginDesc"),
      tone: "bg-green text-green-foreground",
    },
    {
      to: "/#contact",
      icon: Phone,
      title: t("home.contactTitle"),
      desc: t("home.contactDesc"),
      tone: "bg-saffron text-saffron-foreground",
      noArrow: true,
    },
  ]

  const steps = [
    { icon: ClipboardCheck, title: t("home.step1Title"), desc: t("home.step1Desc") },
    { icon: Hash, title: t("home.step2Title"), desc: t("home.step2Desc") },
    { icon: Activity, title: t("home.step3Title"), desc: t("home.step3Desc") },
  ]

  const stats = [
    { value: formatNumber(mockStats.totalGrievances), label: t("home.totalGrievances") },
    { value: formatNumber(mockStats.resolved), label: t("home.resolved") },
    {
      value: `${mockStats.avgResolutionDays} ${t("home.days")}`,
      label: t("home.avgResolution"),
    },
  ]

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="inline-flex items-center rounded-full bg-navy-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              {t("common.ministry")}
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-tight sm:text-5xl">
              {t("home.heroTitle")}
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lg text-navy-foreground/85 leading-relaxed">
              {t("home.heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/#contact"
                onClick={handleContactClick}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-saffron px-7 text-base font-semibold text-saffron-foreground hover:opacity-90"
              >
                {t("home.contactTitle")}
              </Link>
              <Link
                to="/check-status"
                className="inline-flex h-12 items-center rounded-md border border-navy-foreground/30 px-7 text-base font-semibold hover:bg-navy-muted"
              >
                {t("home.heroSecondary")}
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-navy-foreground/15 shadow-lg">
            <img
              src="/cpgrams-home-hero.png"
              alt="Citizens receiving help through a Government of India public grievance service"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-navy-foreground/15 bg-navy-muted">
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-navy-foreground/15 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="py-6 text-center">
                <p className="text-3xl font-bold text-saffron">{s.value}</p>
                <p className="mt-1 text-sm text-navy-foreground/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Action cards */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {actions.map((a) => (
            <Link key={a.to} to={a.to} onClick={a.to === "/#contact" ? handleContactClick : undefined} className="group">
              <Card className="h-full p-6 transition-shadow hover:shadow-md">
                <div className={`inline-flex rounded-lg p-3 ${a.tone}`}>
                  <a.icon className="h-6 w-6" aria-hidden />
                </div>
                <h2 className="mt-4 text-xl font-bold text-navy">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                {!a.noArrow && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-saffron">
                    {t("dashboard.view")}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-center text-3xl font-bold text-navy">{t("home.howItWorks")}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm ring-1 ring-border">
                  <s.icon className="h-7 w-7 text-navy" aria-hidden />
                </div>
                <div className="mx-auto mt-3 flex h-7 w-7 items-center justify-center rounded-full bg-saffron text-sm font-bold text-saffron-foreground">
                  {i + 1}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-14">
        <Card className="grid gap-6 p-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-navy">{t("home.contactTitle")}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{t("home.contactDesc")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-1">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-secondary p-2"><Phone className="h-5 w-5 text-navy" aria-hidden /></span>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.helpline")}</p>
                <p className="font-semibold text-foreground">1800-11-1234</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-secondary p-2"><Mail className="h-5 w-5 text-navy" aria-hidden /></span>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.email")}</p>
                <p className="font-semibold text-foreground">help-cpgrams@gov.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-secondary p-2"><MapPin className="h-5 w-5 text-navy" aria-hidden /></span>
              <div>
                <p className="text-xs text-muted-foreground">{t("home.address")}</p>
                <p className="font-semibold text-foreground">Sardar Patel Bhawan, New Delhi - 110001</p>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </>
  )
}
