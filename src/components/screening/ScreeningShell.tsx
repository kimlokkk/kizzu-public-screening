import type {
    ReactNode,
} from "react"

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
    const widthClass =
        maxWidth === "medium"
            ? "max-w-3xl"
            : "max-w-5xl"

    return (
        <main className="min-h-screen bg-white text-slate-950">
            <div
                className={`mx-auto w-full ${widthClass} px-5 md:px-8`}
            >
                <header className="flex items-center justify-between border-b border-slate-100 py-5 md:py-7">
                    <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
                            K
                        </div>

                        <div>
                            <p className="text-sm font-black tracking-tight text-slate-950">
                                KIZZU
                            </p>
                            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.17em] text-slate-400">
                                Perkembangan Kanak-Kanak
                            </p>
                        </div>
                    </div>

                    {(step || label) && (
                        <div className="flex items-center gap-3">
                            {label && (
                                <p className="hidden text-xs font-medium text-slate-400 sm:block">
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
                </header>

                {children}
            </div>
        </main>
    )
}
