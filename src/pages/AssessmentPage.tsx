import { useEffect, useMemo, useState } from "react"

import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Check,
    CheckCircle2,
    Pencil,
} from "lucide-react"

import ScreeningShell from "@/components/screening/ScreeningShell"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import type {
    AssessmentAnswers,
    AssessmentData,
    ParentChildDetails,
} from "@/types/assessment"

type AssessmentPageProps = {
    assessmentData: AssessmentData
    details: ParentChildDetails

    submitting: boolean
    submitError: string | null

    onBackToDetails: () => void

    onComplete: (
        answers: AssessmentAnswers,
    ) => Promise<void>
}

export default function AssessmentPage({
    assessmentData,
    details,
    submitting,
    submitError,
    onBackToDetails,
    onComplete,
}: AssessmentPageProps) {
    const [domainIndex, setDomainIndex] =
        useState(0)

    const [answers, setAnswers] =
        useState<AssessmentAnswers>({})

    const [error, setError] =
        useState<string | null>(null)

    const [reviewMode, setReviewMode] =
        useState(false)

    const domains = assessmentData.domains
    const currentDomain = domains[domainIndex]

    const positiveLabel =
        assessmentData.assessment.code === "SPK"
            ? "Tercapai"
            : "Boleh"

    const negativeLabel =
        assessmentData.assessment.code === "SPK"
            ? "Tidak Tercapai"
            : "Belum"

    const totalAnswered =
        Object.keys(answers).length

    const overallProgress =
        assessmentData.total_questions > 0
            ? Math.round(
                (totalAnswered /
                    assessmentData.total_questions) *
                100,
            )
            : 0

    const currentDomainAnswered = useMemo(() => {
        if (!currentDomain) {
            return 0
        }

        return currentDomain.questions.filter(
            (question) =>
                answers[question.id] !== undefined,
        ).length
    }, [answers, currentDomain])

    const currentDomainComplete =
        currentDomain
            ? currentDomainAnswered ===
            currentDomain.questions.length
            : false

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }, [domainIndex, reviewMode])

    function answerQuestion(
        questionId: number,
        value: boolean,
    ) {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }))

        setError(null)
    }

    function nextDomain() {
        if (!currentDomain) {
            return
        }

        if (!currentDomainComplete) {
            const unanswered =
                currentDomain.questions.length -
                currentDomainAnswered

            setError(
                `Masih ada ${unanswered} soalan yang belum dijawab.`,
            )

            return
        }

        setError(null)

        const isLastDomain =
            domainIndex === domains.length - 1

        if (isLastDomain) {
            setReviewMode(true)
            return
        }

        setDomainIndex(
            (current) => current + 1,
        )
    }

    function previousDomain() {
        setError(null)

        if (domainIndex === 0) {
            onBackToDetails()
            return
        }

        setDomainIndex(
            (current) => current - 1,
        )
    }

    function editDomain(index: number) {
        setDomainIndex(index)
        setReviewMode(false)
        setError(null)
    }

    if (reviewMode) {
        return (
            <ScreeningShell
                step="04"
                label="Semak"
                maxWidth="medium"
            >
                <div className="py-10 md:py-14">
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                            setReviewMode(false)
                            setDomainIndex(domains.length - 1)
                        }}
                        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 disabled:opacity-50"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </button>

                    <header className="max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-9 bg-sky-500" />
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                                Semakan akhir
                            </p>
                        </div>

                        <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-5xl">
                            Semak jawapan
                        </h1>

                        <p className="mt-4 max-w-xl leading-7 text-slate-500">
                            Pastikan jawapan berdasarkan pemerhatian terhadap{" "}
                            <span className="font-semibold text-slate-800">
                                {details.childName}
                            </span>
                            .
                        </p>
                    </header>

                    <div className="mt-10 flex items-center gap-4 border-y border-slate-100 py-5">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                            <CheckCircle2 className="size-5" />
                        </div>

                        <div>
                            <p className="font-semibold text-slate-950">
                                Semua soalan telah dijawab
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {assessmentData.total_questions} daripada{" "}
                                {assessmentData.total_questions} soalan lengkap.
                            </p>
                        </div>
                    </div>

                    <section className="mt-12">
                        <div className="mb-3 flex items-baseline justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
                                Ringkasan domain
                            </h2>
                            <span className="text-xs text-slate-400">
                                {domains.length} domain
                            </span>
                        </div>

                        <div className="border-t border-slate-200">
                            {domains.map((domain, index) => {
                                const yesCount =
                                    domain.questions.filter(
                                        (question) =>
                                            answers[question.id] === true,
                                    ).length

                                const noCount =
                                    domain.questions.filter(
                                        (question) =>
                                            answers[question.id] === false,
                                    ).length

                                return (
                                    <div
                                        key={domain.id}
                                        className="grid gap-4 border-b border-slate-100 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="pt-0.5 font-mono text-xs text-slate-300">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>

                                            <div>
                                                <p className="font-semibold text-slate-950">
                                                    {domain.name_ms}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {positiveLabel} {yesCount}
                                                    <span className="mx-2 text-slate-300">·</span>
                                                    {negativeLabel} {noCount}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            disabled={submitting}
                                            onClick={() => editDomain(index)}
                                            className="w-fit justify-self-start rounded-full px-3 text-slate-500 sm:justify-self-end"
                                        >
                                            <Pencil className="size-3.5" />
                                            Edit
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {submitError && (
                        <div className="mt-8 flex gap-3 border-l-2 border-red-400 bg-red-50/60 px-4 py-3 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 size-4 shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-md text-xs leading-5 text-slate-400">
                            Jawapan ini tidak menentukan diagnosis. Keputusan akan diterangkan berdasarkan assessment yang digunakan.
                        </p>

                        <Button
                            type="button"
                            size="lg"
                            disabled={submitting}
                            onClick={() => void onComplete(answers)}
                            className="h-12 rounded-full px-7"
                        >
                            {submitting
                                ? "Menyimpan..."
                                : "Sahkan Jawapan"}

                            {!submitting && (
                                <Check className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </ScreeningShell>
        )
    }

    if (!currentDomain) {
        return null
    }

    return (
        <ScreeningShell
            step="03"
            label="Assessment"
            maxWidth="medium"
        >
            <div className="py-8 md:py-12">
                <div className="mb-8 flex items-start justify-between gap-5">
                    <button
                        type="button"
                        onClick={previousDomain}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </button>

                    <div className="text-right">
                        <p className="text-xs font-medium text-slate-400">
                            {details.childName}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                            {assessmentData.age.group}
                        </p>
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-500">
                            Kemajuan
                        </span>
                        <span className="font-medium text-slate-400">
                            {totalAnswered} / {assessmentData.total_questions}
                        </span>
                    </div>

                    <Progress
                        value={overallProgress}
                        className="h-1.5"
                    />
                </div>

                <header className="mt-12 max-w-2xl">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-semibold text-sky-600">
                            {String(domainIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px w-8 bg-sky-500" />
                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                            Domain {domainIndex + 1} / {domains.length}
                        </span>
                    </div>

                    <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-slate-950 md:text-5xl">
                        {currentDomain.name_ms}
                    </h1>

                    {currentDomain.name_en && (
                        <p className="mt-2 text-sm text-slate-400">
                            {currentDomain.name_en}
                        </p>
                    )}

                    <p className="mt-5 max-w-xl leading-7 text-slate-500">
                        Pilih jawapan yang paling menggambarkan kebolehan anak sekarang.
                    </p>
                </header>

                <section className="mt-10 border-t border-slate-200">
                    {currentDomain.questions.map((question, index) => {
                        const answer = answers[question.id]

                        return (
                            <article
                                key={question.id}
                                className="border-b border-slate-100 py-7 md:py-8"
                            >
                                <div className="grid gap-5 md:grid-cols-[42px_1fr]">
                                    <div className="font-mono text-xs font-semibold text-slate-300 md:pt-1">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>

                                    <div>
                                        {question.subdomain_ms && (
                                            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">
                                                {question.subdomain_ms}
                                            </p>
                                        )}

                                        <p className="text-base font-medium leading-7 text-slate-900 md:text-lg">
                                            {question.question_ms}
                                        </p>

                                        {question.question_en && (
                                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                                {question.question_en}
                                            </p>
                                        )}

                                        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
                                            <button
                                                type="button"
                                                aria-pressed={answer === true}
                                                onClick={() =>
                                                    answerQuestion(
                                                        question.id,
                                                        true,
                                                    )
                                                }
                                                className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${answer === true
                                                        ? "border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-100"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                                                    }`}
                                            >
                                                {positiveLabel}
                                            </button>

                                            <button
                                                type="button"
                                                aria-pressed={answer === false}
                                                onClick={() =>
                                                    answerQuestion(
                                                        question.id,
                                                        false,
                                                    )
                                                }
                                                className={`min-h-11 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${answer === false
                                                        ? "border-sky-200 bg-sky-50 text-sky-800"
                                                        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700"
                                                    }`}
                                            >
                                                {negativeLabel}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </section>

                {error && (
                    <div className="mt-6 flex gap-3 border-l-2 border-red-400 bg-red-50/60 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" />
                        {error}
                    </div>
                )}

                <div className="mt-8 flex flex-col gap-5 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                        {currentDomainAnswered} / {currentDomain.questions.length} dijawab dalam domain ini
                    </p>

                    <Button
                        type="button"
                        size="lg"
                        className="h-12 rounded-full px-7"
                        onClick={nextDomain}
                    >
                        {domainIndex === domains.length - 1
                            ? "Semak Jawapan"
                            : "Seterusnya"}

                        <ArrowRight className="size-4" />
                    </Button>
                </div>
            </div>
        </ScreeningShell>
    )
}
