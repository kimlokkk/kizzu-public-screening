import {
    useEffect,
    useState,
} from "react"

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
        path.endsWith("/pc") ||
        path === "/pc" ||
        path.endsWith(
            "/parental-checklist",
        )
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
    const { tr } = useLanguage()

    const assessmentCode =
        getAssessmentCodeFromPath()

    const initialReferenceCode =
        getInitialReferenceCode()

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
        if (assessmentCode === "SPK") {
            document.title =
                "Kizzu Kids | SPK"
            return
        }

        if (assessmentCode === "PC") {
            document.title =
                "Kizzu Kids | Saringan Lewat Perkembangan Anak"
            return
        }

        document.title =
            "Kizzu Kids | Child Development"
    }, [assessmentCode])

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
                    setStep("details")
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
        setReferenceCode(null)
        setSubmitError(null)
        setStep("assessment")
    }

    async function handleAssessmentComplete(
        completedAnswers:
            AssessmentAnswers,
        completedDetails:
            ParentChildDetails,
    ) {
        if (
            !selectedAssessment ||
            !assessmentData
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
                    completedDetails,
                    completedAnswers,
                )

            setDetails(
                completedDetails,
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
        setReferenceCode(null)
        setSubmitError(null)
        setSubmitting(false)

        window.history.replaceState(
            {},
            "",
            window.location.pathname,
        )

        setStep("details")
    }

    if (step === "loading") {
        return (
            <main className="loading">
                <h1>
                    {tr(
                        "Memuatkan...",
                        "Loading...",
                    )}
                </h1>
            </main>
        )
    }

    if (
        step === "invalid" ||
        !selectedAssessment
    ) {
        return (
            <main className="loading">
                <h1>
                    {tr(
                        "Pautan tidak tersedia",
                        "Link unavailable",
                    )}
                </h1>

                <p className="fine">
                    {tr(
                        "Sila gunakan pautan /pc atau /spk.",
                        "Please use the /pc or /spk link.",
                    )}
                </p>
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

    return (
        <DetailsPage
            assessment={
                selectedAssessment
            }
            initialDetails={
                details
            }
            onContinue={
                handleDetailsContinue
            }
        />
    )
}

export default App