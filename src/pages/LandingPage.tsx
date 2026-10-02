import { useEffect, useState } from "react"
import {
    ArrowRight,
    Baby,
    ClipboardCheck,
    Heart,
    LoaderCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { getAssessmentTypes } from "@/services/assessment"
import type { AssessmentType } from "@/types/assessment"

type LandingPageProps = {
    onSelectAssessment: (assessment: AssessmentType) => void
}

export default function LandingPage({
    onSelectAssessment,
}: LandingPageProps) {
    const [assessments, setAssessments] = useState<AssessmentType[]>([])
    const [selectedAssessment, setSelectedAssessment] =
        useState<AssessmentType | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadAssessments() {
            try {
                const data = await getAssessmentTypes()
                setAssessments(data)
            } catch {
                setError(
                    "Assessment tidak dapat dimuatkan. Sila cuba semula sebentar lagi.",
                )
            } finally {
                setLoading(false)
            }
        }

        loadAssessments()
    }, [])

    function getAssessmentIcon(code: string) {
        if (code === "PC") {
            return <Heart className="size-6" />
        }

        return <ClipboardCheck className="size-6" />
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-white">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 md:px-8 md:py-12">
                <header className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-sm">
                        <Baby className="size-5" />
                    </div>

                    <div>
                        <p className="text-lg font-bold tracking-tight text-slate-950">
                            KIZZU
                        </p>
                        <p className="text-xs text-slate-500">
                            Child Development
                        </p>
                    </div>
                </header>

                <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 md:py-20">
                    <div className="text-center">
                        <div className="mx-auto mb-5 inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                            Saringan perkembangan secara ringkas
                        </div>

                        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                            Kenali perkembangan anak anda dengan lebih dekat
                        </h1>

                        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-600 md:text-lg">
                            Pilih penilaian yang sesuai dan jawab beberapa soalan
                            berdasarkan pemerhatian terhadap perkembangan anak anda.
                        </p>
                    </div>

                    <div className="mt-10">
                        {loading && (
                            <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                                <LoaderCircle className="size-5 animate-spin" />
                                Memuatkan assessment...
                            </div>
                        )}

                        {error && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <div className="grid gap-4 md:grid-cols-2">
                                {assessments.map((assessment) => {
                                    const isSelected =
                                        selectedAssessment?.id === assessment.id

                                    return (
                                        <Card
                                            key={assessment.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedAssessment(assessment)}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    setSelectedAssessment(assessment)
                                                }
                                            }}
                                            className={`cursor-pointer transition-all duration-200 ${isSelected
                                                    ? "border-sky-400 bg-sky-50/70 shadow-md ring-2 ring-sky-100"
                                                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
                                                }`}
                                        >
                                            <CardHeader>
                                                <div
                                                    className={`mb-2 flex size-12 items-center justify-center rounded-2xl ${isSelected
                                                            ? "bg-sky-500 text-white"
                                                            : "bg-sky-50 text-sky-600"
                                                        }`}
                                                >
                                                    {getAssessmentIcon(assessment.code)}
                                                </div>

                                                <CardTitle className="text-xl">
                                                    {assessment.name}
                                                </CardTitle>

                                                <CardDescription className="leading-6">
                                                    {assessment.description}
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent>
                                                <div
                                                    className={`text-sm font-medium ${isSelected
                                                            ? "text-sky-700"
                                                            : "text-slate-500"
                                                        }`}
                                                >
                                                    {isSelected
                                                        ? "Dipilih"
                                                        : "Tekan untuk pilih"}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {!loading && !error && (
                        <div className="mt-8 flex justify-center">
                            <Button
                                size="lg"
                                className="h-12 w-full rounded-xl px-8 text-base sm:w-auto"
                                disabled={!selectedAssessment}
                                onClick={() => {
                                    if (selectedAssessment) {
                                        onSelectAssessment(selectedAssessment)
                                    }
                                }}
                            >
                                Mulakan Saringan
                                <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    )}

                    <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-5 text-slate-500">
                        Maklumat yang diberikan akan digunakan untuk menghasilkan
                        ringkasan berdasarkan jawapan anda. Saringan atas talian
                        tidak menggantikan penilaian profesional secara langsung.
                    </p>
                </section>

                <footer className="text-center text-xs text-slate-400">
                    © Kizzu Kids
                </footer>
            </div>
        </main>
    )
}