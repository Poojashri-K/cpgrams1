import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { LoaderCircle, Mic, Search, Sparkles, Square, Volume2 } from "lucide-react"
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  Textarea,
} from "../components/ui"
import {
  DEPARTMENTS,
  GOVERNMENT_TYPES,
  STATES,
  AUTHORITY_DIRECTORY,
  checkGrievanceDuplicates,
  recommendGrievanceDepartment,
  submitGrievance,
  type DepartmentRecommendation,
  type DuplicateGrievanceMatch,
} from "../lib/services"

export function FileGrievance() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [governmentType, setGovernmentType] = useState<string>(
    GOVERNMENT_TYPES[0],
  )
  const [state, setState] = useState("")
  const [department, setDepartment] = useState("")
  const [query, setQuery] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [recommendation, setRecommendation] = useState<DepartmentRecommendation | null>(null)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState(false)
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateGrievanceMatch[]>([])
  const [duplicateCheckLoading, setDuplicateCheckLoading] = useState(false)
  const [duplicateCheckError, setDuplicateCheckError] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState("")

  const listeningRef = useRef(false)
  const recognition = useRef<any>(null)
  const recommendationRequestId = useRef(0)

  const language = i18n.language?.split("-")[0] || "en"

  useEffect(() => {
    const meaningfulDescription = description.trim()

    setDuplicateMatches([])
    setDuplicateCheckError(false)

    if (meaningfulDescription.length < 50) {
      setDuplicateCheckLoading(false)
      return
    }

    const controller = new AbortController()
    setDuplicateCheckLoading(true)

    const timeout = window.setTimeout(() => {
      checkGrievanceDuplicates(
        subject.trim(),
        meaningfulDescription,
        recommendation?.predictedCategory || undefined,
        controller.signal,
      )
        .then((matches) => {
          if (!controller.signal.aborted) setDuplicateMatches(matches)
        })
        .catch(() => {
          if (!controller.signal.aborted) setDuplicateCheckError(true)
        })
        .finally(() => {
          if (!controller.signal.aborted) setDuplicateCheckLoading(false)
        })
    }, 700)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [description, subject, recommendation?.predictedCategory])

  const speechLanguage =
    language === "ta"
      ? "ta-IN"
      : language === "hi"
        ? "hi-IN"
        : "en-IN"

  const filteredDepartments = useMemo(
    () =>
      DEPARTMENTS.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  const recommendedDepartment = recommendation?.recommendations.find(
    (item) => item.department !== "Responsible local authority",
  )?.department ?? AUTHORITY_DIRECTORY.find(
    (item) => item.category === recommendation?.predictedCategory && !item.localAuthorityOnly,
  )?.department
  const selectableDepartments = useMemo(
    () =>
      recommendedDepartment && !filteredDepartments.includes(recommendedDepartment)
        ? [recommendedDepartment, ...filteredDepartments]
        : filteredDepartments,
    [filteredDepartments, recommendedDepartment],
  )

  function clearRecommendation() {
    recommendationRequestId.current += 1
    setRecommendation(null)
    setRecommendationError(false)
    setRecommendationLoading(false)
  }

  async function requestDepartmentRecommendation() {
    const requestId = recommendationRequestId.current + 1
    recommendationRequestId.current = requestId
    setRecommendationLoading(true)
    setRecommendationError(false)
    setRecommendation(null)

    try {
      const result = await recommendGrievanceDepartment(
        subject.trim(),
        description.trim(),
        governmentType,
        state,
      )
      if (recommendationRequestId.current === requestId) setRecommendation(result)
    } catch {
      if (recommendationRequestId.current === requestId) setRecommendationError(true)
    } finally {
      if (recommendationRequestId.current === requestId) setRecommendationLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      listeningRef.current = false
      recognition.current?.stop()
    }
  }, [])

  function toggleVoice() {
    const browserWindow = window as Window & {
      SpeechRecognition?: new () => any
      webkitSpeechRecognition?: new () => any
    }

    const Recognition =
      browserWindow.SpeechRecognition ||
      browserWindow.webkitSpeechRecognition

    if (!Recognition) {
      setError("Voice input is not supported by this browser.")
      return
    }

    setError("")

    if (listening) {
      listeningRef.current = false
      recognition.current?.stop()
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

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        if (event.results[index].isFinal) {
          transcript += event.results[index][0].transcript
        }
      }

      if (transcript) {
        setDescription((value) =>
          `${value}${value ? " " : ""}${transcript.trim()}`,
        )
      }
    }

    current.onerror = () => {
      listeningRef.current = false
      setListening(false)
      setError("Voice input stopped. Please try again.")
    }

    current.onend = () => {
      if (listeningRef.current) {
        try {
          current.start()
        } catch {
          listeningRef.current = false
          setListening(false)
        }
      }
    }

    recognition.current = current
    listeningRef.current = true

    try {
      current.start()
      setListening(true)
    } catch {
      listeningRef.current = false
      setListening(false)
      setError("Unable to start voice input.")
    }
  }

  async function submit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setError("")

    if (listening) {
      setError("Please stop voice input before submitting.")
      return
    }

    try {
      const result = await submitGrievance({
        subject,
        description,
        category: recommendation?.predictedCategory || "General",
        department,
        governmentType,
        recommendationGenerated: Boolean(recommendation),
        state: (governmentType === "State Government" || governmentType === "Local Government") ? state : "",
      })

      sessionStorage.setItem(
        `cpgrams-${result.regNumber}`,
        JSON.stringify(result.grievance),
      )

      navigate(
        `/grievance-confirmation?reg=${encodeURIComponent(
          result.regNumber,
        )}`,
      )
    } catch {
      setError("Unable to submit grievance. Please try again.")
    }
  }

  function selectDepartment(value: string) {
    setDepartment(value)
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-saffron">
          {t("fileGrievance.eyebrow", "Citizen services")}
        </p>

        <h1 className="mt-2 text-3xl font-bold text-navy">
          {t("fileGrievance.title", "File a grievance")}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {t(
            "fileGrievance.subtitle",
            "Submit your concern to the appropriate government department.",
          )}
        </p>
      </div>

      <Card className="p-6">
        <form className="space-y-5" onSubmit={submit}>
          {error && (
            <div
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div>
            <Label required htmlFor="government">
              {t(
                "fileGrievance.governmentType",
                "Government type",
              )}
            </Label>

            <Select
              id="government"
              value={governmentType}
              onChange={(event) => {
                clearRecommendation()
                setGovernmentType(event.target.value)
              }}
            >
              {GOVERNMENT_TYPES.map((type) => (
                <option value={type} key={type}>
                  {type === "Central Government"
                    ? t("fileGrievance.centralGovernment", type)
                    : type === "State Government"
                      ? t("fileGrievance.stateGovernment", type)
                      : t("fileGrievance.localGovernment", type)}
                </option>
              ))}
            </Select>
          </div>

          {governmentType !== "Central Government" && (
            <div>
              <Label required htmlFor="state">
                {t("fileGrievance.stateUt", "State / UT")}
              </Label>

              <Select
                id="state"
                value={state}
                onChange={(event) => {
                  clearRecommendation()
                  setState(event.target.value)
                }}
                required
              >
                <option value="">
                  {t(
                    "fileGrievance.selectState",
                    "Select State / UT",
                  )}
                </option>

                {STATES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <Label required htmlFor="department">
              {t("fileGrievance.department", "Department")}
            </Label>

            <div className="relative">
              <Search
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
                aria-hidden
              />

              <Input
                id="department-search"
                className="pl-9"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  selectDepartment("")
                }}
                placeholder={t(
                  "fileGrievance.searchDepartments",
                  "Search departments",
                )}
                aria-label={t(
                  "fileGrievance.searchDepartments",
                  "Search departments",
                )}
              />
            </div>

            <Select
              id="department"
              className="mt-2"
              value={department}
              onChange={(event) => {
                selectDepartment(event.target.value)
              }}
              required
            >
              <option value="">
                {t(
                  "fileGrievance.selectDepartment",
                  "Select department",
                )}
              </option>

              {selectableDepartments.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </div>

          <div>
            <Label required htmlFor="subject">
              {t("fileGrievance.subject", "Subject")}
            </Label>

            <Input
              id="subject"
              value={subject}
              onChange={(event) => {
                recommendationRequestId.current += 1
                setRecommendation(null)
                setRecommendationError(false)
                setRecommendationLoading(false)
                setSubject(event.target.value)
              }}
              required
              maxLength={200}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <Label required htmlFor="description">
                {t(
                  "fileGrievance.description",
                  "Description",
                )}
              </Label>

              <Button
                type="button"
                variant={listening ? "primary" : "outline"}
                size="sm"
                onClick={toggleVoice}
                aria-pressed={listening}
                aria-label={
                  listening
                    ? t(
                        "fileGrievance.stopVoice",
                        "Stop voice input",
                      )
                    : t(
                        "fileGrievance.startVoice",
                        "Start voice input",
                      )
                }
              >
                {listening ? (
                  <Square
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                ) : (
                  <Mic
                    className="mr-2 h-4 w-4"
                    aria-hidden
                  />
                )}

                {listening
                  ? t("fileGrievance.stop", "Stop")
                  : t(
                      "fileGrievance.voiceInput",
                      "Voice input",
                    )}
              </Button>
            </div>

            {listening && (
              <p
                className="mt-2 flex items-center gap-2 text-sm font-medium text-destructive"
                role="status"
              >
                <Volume2
                  className="h-4 w-4 animate-pulse"
                  aria-hidden
                />
                {t(
                  "fileGrievance.recording",
                  "Recording — click Stop when finished",
                )}
              </p>
            )}

            <Textarea
              id="description"
              value={description}
              onChange={(event) => {
                recommendationRequestId.current += 1
                setRecommendation(null)
                setRecommendationError(false)
                setRecommendationLoading(false)
                setDescription(event.target.value)
              }}
              required
              rows={7}
              maxLength={5000}
            />

            {description.trim().length >= 50 && (
              <div className="mt-3 text-sm" aria-live="polite">
                {duplicateCheckLoading && (
                  <p role="status" className="text-muted-foreground">
                    {t("fileGrievance.duplicateChecking", "Checking for similar grievances...")}
                  </p>
                )}

                {duplicateCheckError && (
                  <p role="alert" className="text-danger">
                    {t("fileGrievance.duplicateCheckError", "Similar grievances could not be checked. You may still submit your grievance.")}
                  </p>
                )}

                {!duplicateCheckLoading && !duplicateCheckError && duplicateMatches.length === 0 && (
                  <p className="text-muted-foreground">
                    {t("fileGrievance.noDuplicates", "No similar grievances were found.")}
                  </p>
                )}

                {duplicateMatches.length > 0 && (
                  <div className="rounded-md border border-saffron/40 bg-saffron/5 p-3">
                    <p className="font-semibold text-navy">
                      {t("fileGrievance.duplicateMatches", "Potentially similar grievances")}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {t("fileGrievance.duplicateNotice", "Review these records. Similarity alone will not prevent submission.")}
                    </p>
                    <ul className="mt-2 space-y-2">
                      {duplicateMatches.map((match) => (
                        <li key={match.regNumber} className="border-t border-saffron/20 pt-2">
                          <p className="font-medium text-navy">
                            {match.regNumber} · {match.subject}
                          </p>
                          <p className="text-muted-foreground">
                            {t(`status.${match.status}`, match.status)} · {match.similarity}%
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 space-y-3" aria-live="polite">
              <Button
                type="button"
                variant="outline"
                disabled={recommendationLoading || subject.trim().length < 3 || description.trim().length < 10 || (governmentType !== "Central Government" && !state)}
                onClick={requestDepartmentRecommendation}
              >
                {recommendationLoading ? (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" aria-hidden />
                )}
                {recommendationLoading
                  ? t("fileGrievance.recommendationLoading", "Analyzing grievance...")
                  : t("fileGrievance.recommendDepartment", "Recommend a department")}
              </Button>

              {recommendationError && (
                <p role="alert" className="text-sm text-danger">
                  {t("fileGrievance.recommendationError", "Recommendations are unavailable. Please choose a department manually; you can still submit.")}
                </p>
              )}

              {recommendation && (
                <div className="rounded-md border border-saffron/40 bg-saffron/5 p-3 text-sm">
                  <p className="font-semibold text-navy">
                    {t("fileGrievance.predictedCategory", "Predicted category")}: {recommendation.predictedCategory || t("fileGrievance.uncategorized", "Unable to categorize")}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {t("fileGrievance.recommendedDepartment", "Recommended department")}: {recommendedDepartment || t("fileGrievance.noDepartmentRecommendation", "No mapped department available")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={listening}
          >
            {t(
              "fileGrievance.submit",
              "Submit Grievance",
            )}
          </Button>
        </form>
      </Card>
    </section>
  )
}

export default FileGrievance