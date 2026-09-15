import { Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { TopBar } from "./TopBar"
import { Header } from "./Header"
import { Footer } from "./Footer"

export function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-saffron focus:px-4 focus:py-2 focus:text-saffron-foreground"
      >
        {t("common.skipToContent")}
      </a>
      <TopBar />
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  )
}
