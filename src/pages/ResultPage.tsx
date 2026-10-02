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
                        : "Keputusan tidak dapat dimuatkan.",
                )
            } finally {
                setLoading(false)
            }
        }

        void loadResult()
    }, [referenceCode])

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white p-5">
                <div className="text-center">
                    <RefreshCcw className="mx-auto size-6 animate-spin text-sky-600" />
                    <p className="mt-4 text-sm text-slate-400">
                        Menyediakan keputusan...
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
                        Keputusan tidak dapat dibuka
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {error}
                    </p>

                    <Button
                        className="mt-7 rounded-full"
                        onClick={onStartNew}
                    >
                        Kembali
                    </Button>
                </div>
            </main>
        )
    }

    const result = data.result
    const isPc = data.assessment.code === "PC"

    const whatsappNumber = (
        import.meta.env
            .VITE_KIZZU_WHATSAPP_NUMBER ?? ""
    ).replace(/\D/g, "")

    const whatsappMessage =
        data.cta.whatsapp_message

    const repeatLabel = isPc
        ? "Buat Checklist Semula"
        : "Buat Saringan Semula"

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
                            {data.age.group}
                        </p>

                        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 md:text-6xl">
                            {result.title}
                        </h1>

                        <p className="mt-5 max-w-2xl leading-7 text-slate-500">
                            {result.message}
                        </p>
                    </div>

                    <div className="md:text-right">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            No. Rujukan
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
                            {result.positive_label}
                        </p>
                    </div>

                    <div className="sm:border-l sm:border-slate-100 sm:pl-8">
                        <p className="text-6xl font-black tracking-[-0.06em] text-sky-600 md:text-7xl">
                            {result.total_negative}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {result.negative_label}
                        </p>
                    </div>
                </section>

                {/* Domains */}

                <section className="py-12 md:py-14">
                    <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                Ringkasan
                            </p>
                            <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                Mengikut domain perkembangan
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
                                                        {domain.name_ms}
                                                    </p>

                                                    {domain.name_en && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {domain.name_en}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 text-right">
                                                <p className="font-bold text-slate-950">
                                                    {domain.positive} / {domain.total}
                                                </p>
                                                {domain.negative > 0 && (
                                                    <p className="mt-1 text-xs font-semibold text-sky-600">
                                                        {domain.negative} {result.negative_label}
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
                                    Perlu diberi perhatian
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                    Kemahiran yang masih belum {isPc ? "diperhatikan" : "tercapai"}
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
                                                {item.domain_name_ms}
                                            </p>
                                            <p className="mt-2 leading-7 text-slate-800">
                                                {item.question_ms}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Recommendations */}

                {data.recommendations.length > 0 && (
                    <section className="border-t border-slate-200 py-12 md:py-14">
                        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">
                                    Cadangan di rumah
                                </p>
                                <h2 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950">
                                    Aktiviti yang boleh dicuba
                                </h2>
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
                                                {activity.title}
                                            </h3>

                                            <p className="mt-3 leading-7 text-slate-600">
                                                {activity.instructions}
                                            </p>

                                            {activity.supports && (
                                                <div className="mt-4 border-l-2 border-sky-200 pl-4">
                                                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                        Menyokong
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                                        {activity.supports}
                                                    </p>
                                                </div>
                                            )}

                                            {activity.safety_note && (
                                                <p className="mt-4 text-xs leading-5 text-slate-400">
                                                    Nota keselamatan: {activity.safety_note}
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
                                Langkah seterusnya
                            </p>
                            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
                                {result.next_action}
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
                                {data.cta.title}
                            </h2>

                            <p className="mt-3 leading-7 text-slate-600">
                                {data.cta.description}
                            </p>

                            <p className="mt-4 text-xs leading-5 text-slate-400">
                                Kongsi No. Rujukan assessment untuk memudahkan perbincangan dengan team Kizzu.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            disabled={!whatsappNumber}
                            onClick={openWhatsApp}
                            className="h-12 shrink-0 rounded-full px-6"
                        >
                            <MessageCircle className="size-4" />
                            {data.cta.button_label}
                        </Button>
                    </div>

                    {!whatsappNumber && (
                        <p className="relative z-10 mt-4 text-xs text-slate-500">
                            Nombor WhatsApp admin belum dikonfigurasi.
                        </p>
                    )}
                </section>

                {/* Footer */}

                <footer className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex gap-3 text-slate-400">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                        <p className="max-w-2xl text-xs leading-5">
                            {data.disclaimer}
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
