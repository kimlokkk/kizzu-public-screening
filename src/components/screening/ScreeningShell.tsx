import type {
    ReactNode,
} from "react"

import {
    useLanguage,
} from "@/context/LanguageContext"

type ScreeningShellProps = {
    children: ReactNode
    step?: string
    label?: string
    maxWidth?: "medium" | "wide"
}

export default function ScreeningShell({
    children,
    step,
    label,
    maxWidth = "wide",
}: ScreeningShellProps) {
    const {
        language,
        setLanguage,
        tr,
    } = useLanguage()

    const widthClass =
        maxWidth === "medium"
            ? "max-w-3xl"
            : "max-w-5xl"

    return (
        <main className="min-h-screen bg-white text-slate-950">
            <div
                className={`mx-auto w-full ${widthClass} px-5 md:px-8`}
            >
                <header className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 md:py-7">
                    <div className="flex min-w-0 items-center gap-3">
                        <img
                            src={`${import.meta.env.BASE_URL}brand/KizzuLong.png`}
                            alt="Kizzu Kids"
                            className="h-10 w-auto object-contain"
                        />

                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        {(step || label) && (
                            <div className="hidden items-center gap-3 sm:flex">
                                {label && (
                                    <p className="text-xs font-medium text-slate-400">
                                        {label}
                                    </p>
                                )}

                                {step && (
                                    <div className="flex size-8 items-center justify-center rounded-full border border-slate-200 font-mono text-[11px] font-bold text-slate-500">
                                        {step}
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className="flex items-center rounded-full border border-slate-200 bg-white p-1"
                            aria-label={tr(
                                "Pilihan bahasa",
                                "Language selector",
                            )}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setLanguage("ms")
                                }
                                aria-pressed={
                                    language === "ms"
                                }
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                    language === "ms"
                                        ? "bg-slate-950 text-white"
                                        : "text-slate-400 hover:text-slate-700"
                                }`}
                            >
                                BM
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setLanguage("en")
                                }
                                aria-pressed={
                                    language === "en"
                                }
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                    language === "en"
                                        ? "bg-slate-950 text-white"
                                        : "text-slate-400 hover:text-slate-700"
                                }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </header>

                {children}
            </div>
        </main>
    )
}
