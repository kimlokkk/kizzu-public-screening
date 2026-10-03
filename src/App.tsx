import {
  useEffect,
  useState,
} from "react"

import AssessmentIntroPage from "@/pages/AssessmentIntroPage"
import AssessmentPage from "@/pages/AssessmentPage"
import DetailsPage from "@/pages/DetailsPage"
import ResultPage from "@/pages/ResultPage"

import {
  getAssessment,
  getAssessmentTypes,
  submitAssessment,
} from "@/services/assessment"

import {
  useLanguage,
} from "@/context/LanguageContext"

import type {
  AssessmentAnswers,
  AssessmentData,
  AssessmentType,
  ParentChildDetails,
} from "@/types/assessment"

type Step =
  | "loading"
  | "intro"
  | "details"
  | "assessment"
  | "result"
  | "invalid"

type AssessmentCode =
  | "PC"
  | "SPK"

function getAssessmentCodeFromPath():
  AssessmentCode | null {
  const path =
    window.location.pathname
      .toLowerCase()
      .replace(/\/+$/, "")

  if (
    path.endsWith("/spk") ||
    path === "/spk"
  ) {
    return "SPK"
  }

  if (
    path.endsWith(
      "/parental-checklist",
    ) ||
    path ===
    "/parental-checklist"
  ) {
    return "PC"
  }

  return null
}

function getInitialReferenceCode() {
  const params =
    new URLSearchParams(
      window.location.search,
    )

  return params.get("ref")
}

function App() {
  
  const {
    tr,
  } = useLanguage()

  const assessmentCode =
    getAssessmentCodeFromPath()

  const initialReferenceCode =
    getInitialReferenceCode()

  useEffect(() => {
    if (assessmentCode === "SPK") {
      document.title = "Kizzu Kids | SPK"
      return
    }

    if (assessmentCode === "PC") {
      document.title =
        "Kizzu Kids | Parental Checklist"
      return
    }

    document.title =
      "Kizzu Kids | Child Development"
  }, [assessmentCode])

  const [step, setStep] =
    useState<Step>(
      assessmentCode
        ? "loading"
        : "invalid",
    )

  const [
    selectedAssessment,
    setSelectedAssessment,
  ] =
    useState<AssessmentType | null>(
      null,
    )

  const [details, setDetails] =
    useState<ParentChildDetails | null>(
      null,
    )

  const [
    assessmentData,
    setAssessmentData,
  ] =
    useState<AssessmentData | null>(
      null,
    )

  const [, setAnswers] =
    useState<AssessmentAnswers>({})

  const [
    referenceCode,
    setReferenceCode,
  ] =
    useState<string | null>(
      initialReferenceCode,
    )

  const [
    submitError,
    setSubmitError,
  ] =
    useState<string | null>(null)

  const [submitting, setSubmitting] =
    useState(false)

  useEffect(() => {
    if (!assessmentCode) {
      setStep("invalid")
      return
    }

    async function loadAssessmentType() {
      try {
        const types =
          await getAssessmentTypes()

        const assessment =
          types.find(
            (item) =>
              item.code ===
              assessmentCode,
          )

        if (!assessment) {
          setStep("invalid")
          return
        }

        setSelectedAssessment(
          assessment,
        )

        if (
          initialReferenceCode
        ) {
          setStep("result")
        } else {
          setStep("intro")
        }

      } catch {
        setStep("invalid")
      }
    }

    void loadAssessmentType()
  }, [
    assessmentCode,
    initialReferenceCode,
  ])

  function handleStart() {
    setDetails(null)
    setAssessmentData(null)
    setAnswers({})
    setSubmitError(null)

    setStep("details")
  }

  async function handleDetailsContinue(
    parentChildDetails:
      ParentChildDetails,
    ageMonths: number,
  ) {
    if (!selectedAssessment) {
      return
    }

    const data =
      await getAssessment(
        selectedAssessment.code,
        ageMonths,
      )

    setDetails(
      parentChildDetails,
    )

    setAssessmentData(data)

    setAnswers({})
    setReferenceCode(null)
    setSubmitError(null)

    setStep("assessment")
  }

  async function handleAssessmentComplete(
    completedAnswers:
      AssessmentAnswers,
  ) {
    if (
      !selectedAssessment ||
      !assessmentData ||
      !details
    ) {
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const result =
        await submitAssessment(
          selectedAssessment.code,
          assessmentData.age.months,
          details,
          completedAnswers,
        )

      setAnswers(
        completedAnswers,
      )

      setReferenceCode(
        result.reference_code,
      )

      const params =
        new URLSearchParams({
          ref:
            result.reference_code,
        })

      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      )

      setStep("result")

    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : tr(
            "Submission gagal disimpan.",
            "The submission could not be saved.",
          ),
      )

    } finally {
      setSubmitting(false)
    }
  }

  function startAgain() {
    setDetails(null)
    setAssessmentData(null)
    setAnswers({})
    setReferenceCode(null)

    setSubmitError(null)
    setSubmitting(false)

    window.history.replaceState(
      {},
      "",
      window.location.pathname,
    )

    setStep("intro")
  }

  if (step === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-400">
          {tr(
            "Memuatkan...",
            "Loading...",
          )}
        </p>
      </main>
    )
  }

  if (
    step === "invalid" ||
    !selectedAssessment
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-5">
        <div className="max-w-md text-center">
          <p className="text-sm font-semibold text-sky-600">
            KIZZU
          </p>

          <h1 className="mt-3 text-2xl font-bold text-slate-950">
            {tr(
              "Pautan tidak tersedia",
              "Link unavailable",
            )}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {tr(
              "Sila gunakan pautan saringan yang diberikan oleh Kizzu.",
              "Please use the screening link provided by Kizzu.",
            )}
          </p>
        </div>
      </main>
    )
  }

  if (
    step === "result" &&
    referenceCode
  ) {
    return (
      <ResultPage
        referenceCode={
          referenceCode
        }
        onStartNew={
          startAgain
        }
      />
    )
  }

  if (
    step === "assessment" &&
    assessmentData &&
    details
  ) {
    return (
      <AssessmentPage
        assessmentData={
          assessmentData
        }
        details={details}
        submitting={
          submitting
        }
        submitError={
          submitError
        }
        onBackToDetails={() => {
          setSubmitError(null)
          setStep("details")
        }}
        onComplete={
          handleAssessmentComplete
        }
      />
    )
  }

  if (step === "details") {
    return (
      <DetailsPage
        assessment={
          selectedAssessment
        }
        onBack={() =>
          setStep("intro")
        }
        onContinue={
          handleDetailsContinue
        }
      />
    )
  }

  return (
    <AssessmentIntroPage
      assessment={
        selectedAssessment
      }
      onStart={handleStart}
    />
  )
}

export default App
