import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import en from "./locales/en.json"
import hi from "./locales/hi.json"
import ta from "./locales/ta.json"

export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
] as const

const stored = typeof window !== "undefined" ? window.localStorage.getItem("cpgrams-lang") : null

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
  },
  lng: stored || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  parseMissingKeyHandler: (key) => {
    const labels: Record<string, string> = {
      "common.appFullName": "CPGRAMS",
      "common.ministry": "Government of India",
      "nav.fileGrievance": "File Grievance",
      "nav.checkStatus": "Check Grievance Status",
      "nav.dashboard": "Dashboard",
      "nav.logout": "Logout",
      "status.regNum": "Registration Number",
      "status.checkButton": "Check Status",
      "statusValues.submitted": "Submitted",
      "footer.quickLinks": "Quick Links",
      "footer.resources": "Resources",
      "home.contactTitle": "Contact Us",
      "home.loginTitle": "Login",
      "home.loginDesc": "Access your citizen dashboard.",
    }
    return labels[key] || key.split(".").pop()?.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()) || key
  },
})

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("cpgrams-lang", lng)
    document.documentElement.setAttribute("lang", lng)
  }
})

export default i18n
