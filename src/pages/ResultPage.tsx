import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Eye,
    MessageCircle,
    RefreshCcw,
    ShieldCheck,
} from "lucide-react"

import {
    useEffect,
    useState,
} from "react"

import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"
import { Button } from "@/components/ui/button"
import { getResult } from "@/services/assessment"

import type {
    AssessmentResult,
} from "@/types/assessment"

type ResultPageProps = {
    referenceCode: string
    onStartNew: () => void
}

export default function ResultPage({
    referenceCode,
    onStartNew,
}: ResultPageProps) {
    const {
        language,
        tr,
    } = useLanguage()

    const [data, setData] =
        useState<AssessmentResult | null>(null)

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState<string | null>(null)

    useEffect(() => {
        async function loadResult() {
            try {
                setLoading(true)
                setError(null)

                const result =
                    await getResult(referenceCode)

                setData(result)
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : tr("Keputusan tidak dapat dimuatkan.", "The result could not be loaded."),
                )
            } finally {
                setLoading(false)
            }
        }

        void loadResult()
    }, [referenceCode, language])

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white p-5">
                <div className="text-center">
                    <RefreshCcw className="mx-auto size-6 animate-spin text-sky-600" />
                    <p className="mt-4 text-sm text-slate-400">
                        {tr("Menyediakan keputusan...", "Preparing result...")}
                    </p>
                </div>
            </main>
        )
    }

    if (error || !data) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white px-5">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <AlertCircle className="size-5" />
                    </div>

                    <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                        {tr("Keputusan tidak dapat dibuka", "Unable to open result")}
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <Button
                        className="mt-7 rounded-full"
                        onClick={onStartNew}
                    >
                        {tr("Kembali", "Back")}
                    </Button>
                </div>
            </main>
        )
    }

    const result = data.result
    const isPc = data.assessment.code === "PC"
    const hasConcern =
        result.total_negative > 0

    const reassessmentMonths =
        data.age.months < 24
            ? 2
            : 3

    const localizedResult = (() => {
        if (language === "ms") {
            return {
                title: result.title,
                message: result.message,
                nextAction: result.next_action,
                positiveLabel: result.positive_label,
                negativeLabel: result.negative_label,
            }
        }

        if (isPc) {
            return {
                title: "Development Summary",
                message:
                    "This summary shows the skills that have and have not yet been observed based on the answers provided.",
                nextAction:
                    result.total_negative === 0
                        ? "Continue age-appropriate developmental activities and keep observing your child's progress over time."
                        : "Continue providing opportunities and suitable activities for skills that have not yet been observed. If you remain concerned, consider discussing your child's development with a qualified professional.",
                positiveLabel: "Able",
                negativeLabel: "Not Yet",
            }
        }

        if (result.status === "ON_TRACK") {
            return {
                title: "All Screening Items Achieved",
                message:
                    "Based on the answers provided, all screening items for this age group have been achieved.",
                nextAction:
                    "Continue providing age-appropriate developmental activities and stimulation.",
                positiveLabel: "Achieved",
                negativeLabel: "Not Achieved",
            }
        }

        if (result.status === "MONITOR_REASSESS") {
            return {
                title: "Monitor and Reassess",
                message:
                    "One skill in this screening has not yet been achieved based on the answers provided.",
                nextAction:
                    `Provide suitable developmental opportunities and activities, then reassess after ${reassessmentMonths} months.`,
                positiveLabel: "Achieved",
                negativeLabel: "Not Achieved",
            }
        }

        if (
            result.status ===
            "REFER_FOR_FURTHER_ASSESSMENT"
        ) {
            return {
                title: "Further Assessment Recommended",
                message:
                    "Based on the response pattern in this screening, some developmental skills may benefit from further attention.",
                nextAction:
                    "Consider discussing the result with a child-development professional for a more comprehensive assessment and guidance.",
                positiveLabel: "Achieved",
                negativeLabel: "Not Achieved",
            }
        }

        return {
            title: "Screening Result",
            message:
                "The screening result has been recorded.",
            nextAction:
                "Continue observing your child's development.",
            positiveLabel: "Achieved",
            negativeLabel: "Not Achieved",
        }
    })()

    const ageGroupLabel = (() => {
        if (language === "ms") {
            return data.age.group
        }

        const months =
            data.age.months

        if (data.assessment.code === "SPK") {
            if (months <= 17) return "1 Year"
            if (months <= 23) return "1.5 Years"
            if (months <= 35) return "2 Years"
            if (months <= 47) return "3 Years"
            if (months <= 59) return "4 Years"
            if (months <= 71) return "5 Years"
            return "6 Years"
        }

        if (months <= 17) return "1–1.5 Years"
        if (months <= 23) return "1.5–2 Years"
        if (months <= 35) return "2–3 Years"
        if (months <= 47) return "3–4 Years"
        if (months <= 59) return "4–5 Years"
        return "5–6 Years"
    })()

    const whatsappNumber = (
        import.meta.env
            .VITE_KIZZU_WHATSAPP_NUMBER ?? ""
    ).replace(/\D/g, "")

    const whatsappMessage =
        language === "ms"
            ? data.cta.whatsapp_message
            : [
                `Hi Kizzu, I have just completed the ${data.assessment.code === "SPK" ? "Child Development Screening" : "Parental Checklist"} on the Kizzu website.`,
                "",
                `Reference No.: ${data.reference_code}`,
                `Result: ${localizedResult.title}`,
                "",
                "I would like further guidance.",
            ].join("\n")

    const repeatLabel = isPc
        ? tr(
            "Buat Checklist Semula",
            "Restart Checklist",
        )
        : tr(
            "Buat Saringan Semula",
            "Restart Screening",
        )

    const localizedCta = (() => {
        if (language === "ms") {
            return {
                title: data.cta.title,
                description: data.cta.description,
                buttonLabel: data.cta.button_label,
            }
        }

        if (isPc) {
            if (result.total_negative === 0) {
                return {
                    title: "Want to keep supporting your child's development?",
                    description:
                        "The Kizzu team can help you explore suitable activities and programmes to continue supporting your child's development.",
                    buttonLabel: "WhatsApp Kizzu Admin",
                }
            }

            return {
                title: "Would you like to understand any of these skills further?",
                description:
                    "You can speak with the Kizzu team for guidance on your child's development and suitable activities.",
                buttonLabel: "WhatsApp Kizzu Admin",
            }
        }

        if (result.status === "ON_TRACK") {
            return {
                title: "Keep the positive development going",
                description:
                    "If you would like more activity ideas or want to learn about suitable Kizzu programmes, the Kizzu team is here to help.",
                buttonLabel: "WhatsApp Kizzu Admin",
            }
        }

        if (result.status === "MONITOR_REASSESS") {
            return {
                title: "Need guidance during the monitoring period?",
                description:
                    "Speak with the Kizzu team about suitable activities to support your child's skills before reassessment.",
                buttonLabel: "WhatsApp Kizzu Admin",
            }
        }

        return {
            title: "Want to discuss the next step?",
            description:
                "The Kizzu team can help you understand options for further assessment and developmental support.",
            buttonLabel: "WhatsApp Kizzu Admin",
        }
    })()

    function openWhatsApp() {
        if (!whatsappNumber) {
            return
        }

        const message =
            encodeURIComponent(whatsappMessage)

        window.open(
            `https://wa.me/${whatsappNumber}?text=${message}`,
            "_blank",
            "noopener,noreferrer",
        )
    }

    return (
        <ScreeningShell maxWidth="wide">
            <div className="py-10 md:py-14">
                {/* Hero */}

                <section className="grid gap-8 border-b border-slate-200 pb-12 md:grid-cols-[1fr_220px] md:items-end">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="h-px w-9 bg-sky-500" />
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                                {data.assessment.name}
                            </p>
                        </div>

                        <p className="mt-6 text-sm font-semibold text-slate-500">
                            {data.child.name}
                            <span className="mx-2 text-slate-300">·</span>
                            {ageGroupLabel}
                        </p>

                        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 md:text-6xl">
                            {localizedResult.title}
                        </h1>

                        <p className="mt-5 max-w-2xl leading-7 text-slate-500">
                            {localizedResult.message}
                        </p>
                    </div>

                    <div className="md:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {tr("No. Rujukan", "Reference No.")}
                        </p>
                        <p className="mt-2 break-all font-mono text-xs font-medium leading-5 text-slate-600">
                            {data.reference_code}
                        </p>
                    </div>
                </section>

                {/* Overall numbers */}

                <section className="grid gap-8 border-b border-slate-200 py-10 sm:grid-cols-2">
                    <div>
                        <p className="text-6xl font-black tracking-[-0.06em] text-slate-950 md:text-7xl">
                            {result.total_positive}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {localizedResult.positiveLabel}
                        </p>
                    </div>

                    <div className="sm:border-l sm:border-slate-100 sm:pl-8">
                        <p className="text-6xl font-black tracking-[-0.06em] text-sky-600 md:text-7xl">
                            {result.total_negative}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {localizedResult.negativeLabel}
                        </p>
                    </div>
                </section>

                {/* Domains */}

                <section className="py-12 md:py-14">
                    <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                {tr("Ringkasan", "Summary")}
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                {tr("Mengikut domain perkembangan", "By developmental domain")}
                            </h2>
                        </div>

                        <div className="border-t border-slate-200">
                            {result.domains.map((domain, index) => {
                                const percentage =
                                    domain.total > 0
                                        ? Math.round(
                                            (domain.positive /
                                                domain.total) *
                                            100,
                                        )
                                        : 0

                                return (
                                    <div
                                        key={domain.id}
                                        className="border-b border-slate-100 py-5"
                                    >
                                        <div className="flex items-start justify-between gap-5">
                                            <div className="flex gap-4">
                                                <span className="pt-0.5 font-mono text-xs text-slate-300">
                                                    {String(index + 1).padStart(2, "0")}
                                                </span>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {language === "en" && domain.name_en
                                                            ? domain.name_en
                                                            : domain.name_ms}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="font-bold text-slate-950">
                                                    {domain.positive} / {domain.total}
                                                </p>
                                                {domain.negative > 0 && (
                                                    <p className="mt-1 text-xs font-semibold text-sky-600">
                                                        {domain.negative} {localizedResult.negativeLabel}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-sky-500 transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Items to watch */}

                {result.items_to_watch.length > 0 && (
                    <section className="border-t border-slate-200 py-12 md:py-14">
                        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                    {tr("Perlu diberi perhatian", "Items to watch")}
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                    {isPc
                                        ? tr(
                                            "Kemahiran yang masih belum diperhatikan",
                                            "Skills not yet observed",
                                        )
                                        : tr(
                                            "Kemahiran yang masih belum tercapai",
                                            "Skills not yet achieved",
                                        )}
                                </h2>
                            </div>

                            <div className="border-t border-slate-200">
                                {result.items_to_watch.map((item, index) => (
                                    <div
                                        key={item.question_id}
                                        className="grid gap-3 border-b border-slate-100 py-6 sm:grid-cols-[42px_1fr]"
                                    >
                                        <span className="font-mono text-xs font-semibold text-sky-600">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <div>
                                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-600">
                                                {language === "en"
                                                    ? result.domains.find(
                                                        (domain) =>
                                                            domain.code === item.domain_code,
                                                    )?.name_en ?? item.domain_name_ms
                                                    : item.domain_name_ms}
                                            </p>
                                            <p className="mt-2 leading-7 text-slate-800">
                                                {language === "en"
                                                    ? item.question_en ?? item.question_ms
                                                    : item.question_ms}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Recommendations / Enrichment */}

                {data.recommendations.length > 0 && (
                    <section className="border-t border-slate-200 py-12 md:py-14">
                        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                    {hasConcern
                                        ? tr(
                                            "Cadangan di rumah",
                                            "At-home suggestions",
                                        )
                                        : tr(
                                            "Aktiviti pengayaan",
                                            "Enrichment activities",
                                        )}
                                </p>

                                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                    {hasConcern
                                        ? tr(
                                            "Aktiviti yang boleh dicuba",
                                            "Activities to try",
                                        )
                                        : tr(
                                            "Teruskan perkembangan positif",
                                            "Keep growing",
                                        )}
                                </h2>

                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {hasConcern
                                        ? tr(
                                            "Aktiviti ini dipilih untuk menyokong kemahiran yang masih berkembang.",
                                            "These activities are selected to support skills that are still developing.",
                                        )
                                        : isPc
                                            ? tr(
                                                "Semua kemahiran dalam checklist ini telah diperhatikan. Gunakan aktiviti ini sebagai idea pengayaan yang sesuai dengan umur anak.",
                                                "All skills in this checklist have been observed. Use these as age-appropriate enrichment ideas for your child.",
                                            )
                                            : tr(
                                                "Semua item saringan telah tercapai. Gunakan aktiviti ini untuk terus menyokong perkembangan anak.",
                                                "All screening items have been achieved. Use these activities to keep supporting your child's development.",
                                            )}
                                </p>
                            </div>

                            <div className="border-t border-slate-200">
                                {data.recommendations.map((activity, index) => (
                                    <article
                                        key={activity.id}
                                        className="grid gap-4 border-b border-slate-100 py-7 sm:grid-cols-[42px_1fr]"
                                    >
                                        <span className="font-mono text-xs font-semibold text-sky-600">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>

                                        <div>
                                            <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-950">
                                                {language === "en" ? activity.title_en ?? activity.title : activity.title}
                                            </h3>

                                            <p className="mt-3 leading-7 text-slate-600">
                                                {language === "en" ? activity.instructions_en ?? activity.instructions : activity.instructions}
                                            </p>

                                            {(language === "en"
                                                ? activity.supports_en ?? activity.supports
                                                : activity.supports) && (
                                                <div className="mt-4 border-l-2 border-sky-200 pl-4">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        {tr("Menyokong", "Supports")}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                        {language === "en"
                                                            ? activity.supports_en ?? activity.supports
                                                            : activity.supports}
                                                    </p>
                                                </div>
                                            )}

                                            {(language === "en"
                                                ? activity.safety_note_en ?? activity.safety_note
                                                : activity.safety_note) && (
                                                <p className="mt-4 text-xs leading-5 text-slate-400">
                                                    {tr("Nota keselamatan:", "Safety note:")}{" "}
                                                    {language === "en"
                                                        ? activity.safety_note_en ?? activity.safety_note
                                                        : activity.safety_note}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Next action */}

                <section className="border-t border-slate-200 py-10">
                    <div className="flex gap-4">
                        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                            {result.status === "ON_TRACK" ? (
                                <CheckCircle2 className="size-4" />
                            ) : result.status === "MONITOR_REASSESS" || isPc ? (
                                <Eye className="size-4" />
                            ) : (
                                <ArrowRight className="size-4" />
                            )}
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-600">
                                {tr("Langkah seterusnya", "Next step")}
                            </p>
                            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                                {localizedResult.nextAction}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Kizzu CTA */}

                <section className="relative overflow-hidden rounded-[28px] bg-sky-50 px-6 py-8 md:px-9 md:py-10">
                    <div
                        aria-hidden="true"
                        className="absolute -right-12 -top-14 size-44 rounded-full border-[28px] border-white/60"
                    />

                    <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-xl">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                Kizzu
                            </p>

                            <h2 className="mt-3 text-2xl font-black tracking-[-0.035em] text-slate-950 md:text-3xl">
                                {localizedCta.title}
                            </h2>

                            <p className="mt-3 leading-7 text-slate-600">
                                {localizedCta.description}
                            </p>

                            <p className="mt-4 text-xs leading-5 text-slate-400">
                                {tr("Kongsi No. Rujukan assessment untuk memudahkan perbincangan dengan team Kizzu.", "Share the assessment reference number to make it easier to discuss the result with the Kizzu team.")}
                            </p>
                        </div>

                        <Button
                            size="lg"
                            disabled={!whatsappNumber}
                            onClick={openWhatsApp}
                            className="h-12 shrink-0 rounded-full px-6"
                        >
                            <MessageCircle className="size-4" />
                            {localizedCta.buttonLabel}
                        </Button>
                    </div>

                    {!whatsappNumber && (
                        <p className="relative z-10 mt-4 text-xs text-slate-500">
                            {tr("Nombor WhatsApp admin belum dikonfigurasi.", "The admin WhatsApp number has not been configured.")}
                        </p>
                    )}
                </section>

                {/* Footer */}

                <footer className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex gap-3 text-slate-400">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                        <p className="max-w-2xl text-xs leading-5">
                            {language === "ms"
                                ? data.disclaimer
                                : isPc
                                    ? "This checklist is a developmental observation summary and is not a diagnostic tool or a substitute for professional assessment."
                                    : "This result is an initial guide based on the answers provided and is not a diagnosis."}
                        </p>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={onStartNew}
                            className="rounded-full"
                        >
                            {repeatLabel}
                        </Button>
                    </div>
                </footer>
            </div>
        </ScreeningShell>
    )
}
