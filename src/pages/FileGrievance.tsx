import { useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Mic, Search, Square, Volume2 } from "lucide-react"
import { Button, Card, Input, Label, Select, Textarea } from "../components/ui"
import { DEPARTMENTS, GOVERNMENT_TYPES, STATES, submitGrievance } from "../lib/services"

export function FileGrievance() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [governmentType, setGovernmentType] = useState<string>(GOVERNMENT_TYPES[0])
  const [state, setState] = useState("")
  const [department, setDepartment] = useState("")
  const [query, setQuery] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [listening, setListening] = useState(false)
  const listeningRef = useRef(false)
  const recognition = useRef<any>(null)
  const language = i18n.language?.split("-")[0] || "en"
  const speechLanguage = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN"
  const filteredDepartments = useMemo(
    () => DEPARTMENTS.filter((item) => item.toLowerCase().includes(query.toLowerCase())),
    [query],
  )

  function toggleVoice() {
    const browserWindow = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }
    const Recognition = browserWindow.SpeechRecognition || browserWindow.webkitSpeechRecognition
    if (!Recognition) return
    if (listening) {
      recognition.current?.stop()
      listeningRef.current = false
      setListening(false)
      return
    }
    const current = new Recognition()
    current.lang = speechLanguage
    current.continuous = true
    current.interimResults = true
    current.maxAlternatives = 1
    current.onresult = (event: any) => {
      let transcript = ""
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) transcript += event.results[index][0].transcript
      }
      if (transcript) setDescription((value) => `${value}${value ? " " : ""}${transcript.trim()}`)
    }
    current.onerror = () => { listeningRef.current = false; setListening(false) }
    current.onend = () => {
      if (listeningRef.current) {
        try { current.start() } catch { setListening(false) }
      }
    }
    recognition.current = current
    current.start()
    listeningRef.current = true
    setListening(true)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = await submitGrievance({ subject, description, category: "General", department, state: governmentType === "State Government" ? state : "Central Government" })
    sessionStorage.setItem(`cpgrams-${result.regNumber}`, JSON.stringify(result.grievance))
    navigate(`/grievance-confirmation?reg=${encodeURIComponent(result.regNumber)}`)
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-saffron">{t("fileGrievance.eyebrow", "Citizen services")}</p>
        <h1 className="mt-2 text-3xl font-bold text-navy">{t("fileGrievance.title", "File a grievance")}</h1>
        <p className="mt-2 text-muted-foreground">{t("fileGrievance.subtitle", "Submit your concern to the appropriate government department.")}</p>
      </div>
      <Card className="p-6">
        <form className="space-y-5" onSubmit={submit}>
          <div><Label required htmlFor="government">{t("fileGrievance.governmentType", "Government type")}</Label><Select id="government" value={governmentType} onChange={(event) => setGovernmentType(event.target.value)}>{GOVERNMENT_TYPES.map((type) => <option value={type}>{type === "Central Government" ? t("fileGrievance.centralGovernment", type) : t("fileGrievance.stateGovernment", type)}</option>)}</Select></div>
          {governmentType === "State Government" && <div><Label required htmlFor="state">{t("fileGrievance.stateUt", "State / UT")}</Label><Select id="state" value={state} onChange={(event) => setState(event.target.value)} required><option value="">{t("fileGrievance.selectState", "Select State / UT")}</option>{STATES.map((item) => <option key={item}>{item}</option>)}</Select></div>}
          <div><Label required htmlFor="department">{t("fileGrievance.department", "Department")}</Label><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden /><Input id="department-search" className="pl-9" value={query} onChange={(event) => { setQuery(event.target.value); setDepartment("") }} placeholder={t("fileGrievance.searchDepartments", "Search departments")} aria-label={t("fileGrievance.searchDepartments", "Search departments")} /></div><Select id="department" className="mt-2" value={department} onChange={(event) => setDepartment(event.target.value)} required><option value="">{t("fileGrievance.selectDepartment", "Select department")}</option>{filteredDepartments.map((item) => <option key={item}>{item}</option>)}</Select></div>
          <div><Label required htmlFor="subject">{t("fileGrievance.subject", "Subject")}</Label><Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} required /></div>
          <div><div className="flex items-center justify-between gap-3"><Label required htmlFor="description">{t("fileGrievance.description", "Description")}</Label><Button type="button" variant={listening ? "primary" : "outline"} size="sm" onClick={toggleVoice} aria-pressed={listening} aria-label={listening ? t("fileGrievance.stopVoice", "Stop voice input") : t("fileGrievance.startVoice", "Start voice input")}>{listening ? <Square className="mr-2 h-4 w-4" aria-hidden /> : <Mic className="mr-2 h-4 w-4" aria-hidden />}{listening ? t("fileGrievance.stop", "Stop") : t("fileGrievance.voiceInput", "Voice input")}</Button></div>{listening && <p className="mt-2 flex items-center gap-2 text-sm font-medium text-destructive" role="status"><Volume2 className="h-4 w-4 animate-pulse" aria-hidden />{t("fileGrievance.recording", "Recording — click Stop when finished")}</p>}<Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} required rows={7} /></div>
          <Button type="submit" className="w-full">{t("fileGrievance.submit", "Submit Grievance")}</Button>
        </form>
      </Card>
    </section>
  )
}

export default FileGrievance
