import {
    ArrowRight,
    Check,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"

import type {
    AssessmentType,
} from "@/types/assessment"

type AssessmentIntroPageProps = {
    assessment: AssessmentType
    onStart: () => void
}

export default function AssessmentIntroPage({
    assessment,
    onStart,
}: AssessmentIntroPageProps) {
    const {
        language,
        tr,
    } = useLanguage()

    const isSpk =
        assessment.code === "SPK"

    const title = isSpk
        ? tr(
            "Saringan Perkembangan Kanak-Kanak",
            "Child Development Screening",
        )
        : "Parental Checklist"

    const heading = isSpk
        ? tr(
            "Lihat perkembangan anak mengikut lima domain utama.",
            "Explore your child's development across five key domains.",
        )
        : tr(
            "Semak kemahiran yang anda perhatikan pada anak.",
            "Review the skills you observe in your child.",
        )

    const description = isSpk
        ? tr(
            "Jawab berdasarkan kebolehan anak dalam aktiviti harian.",
            "Answer based on your child's current abilities in everyday activities.",
        )
        : tr(
            "Jawab berdasarkan perkara yang anak boleh lakukan tanpa bantuan.",
            "Answer based on what your child can currently do without help.",
        )

    const items = isSpk
        ? language === "ms"
            ? [
                "Umur 1 hingga 6 tahun",
                "Mengikut peringkat umur",
                "Keputusan dan aktiviti cadangan",
            ]
            : [
                "Ages 1 to 6 years",
                "Age-based questions",
                "Results and suggested activities",
            ]
        : language === "ms"
            ? [
                "Berdasarkan pemerhatian ibu bapa",
                "Mengikut umur anak",
                "Ringkasan perkembangan",
            ]
            : [
                "Based on parent observations",
                "Matched to your child's age",
                "Development summary",
            ]

    return (
        <ScreeningShell>
            <section className="relative grid min-h-[calc(100vh-95px)] items-center gap-12 overflow-hidden py-12 md:grid-cols-[1fr_280px] md:py-16">
                <div className="relative z-10">
                    <div className="mb-8 flex items-center gap-3">
                        <span className="h-px w-10 bg-sky-500" />

                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                            {title}
                        </p>
                    </div>

                    <h1 className="max-w-3xl text-[2.8rem] font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl md:text-7xl">
                        {heading}
                    </h1>

                    <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 md:text-lg">
                        {description}
                    </p>

                    <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
                        {items.map(
                            (item) => (
                                <div
                                    key={item}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex size-5 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                                        <Check className="size-3" />
                                    </div>

                                    <span className="text-sm font-medium text-slate-600">
                                        {item}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>

                    <Button
                        size="lg"
                        onClick={onStart}
                        className="mt-10 h-13 rounded-full px-7"
                    >
                        {isSpk
                            ? tr(
                                "Mulakan Saringan",
                                "Start Screening",
                            )
                            : tr(
                                "Mulakan Checklist",
                                "Start Checklist",
                            )}

                        <ArrowRight className="size-4" />
                    </Button>

                    <p className="mt-5 max-w-lg text-xs leading-5 text-slate-400">
                        {isSpk
                            ? tr(
                                "Hasil saringan ialah panduan awal dan bukan diagnosis.",
                                "The screening result is an initial guide and is not a diagnosis.",
                            )
                            : tr(
                                "Checklist ini ialah ringkasan pemerhatian dan bukan alat diagnosis.",
                                "This checklist summarises observations and is not a diagnostic tool.",
                            )}
                    </p>
                </div>

                <div
                    aria-hidden="true"
                    className="relative hidden h-[420px] md:block"
                >
                    <div className="absolute right-0 top-10 size-64 rounded-full border-[38px] border-sky-50" />
                    <div className="absolute bottom-14 right-32 size-24 rounded-full bg-sky-500" />
                    <div className="absolute bottom-5 right-4 font-black leading-none tracking-[-0.08em] text-slate-100">
                        <span className="text-[150px]">
                            01
                        </span>
                    </div>
                </div>
            </section>
        </ScreeningShell>
    )
}
