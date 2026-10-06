import { useLanguage } from "@/context/LanguageContext"

type ScreeningFlowProps = {
    current: 1 | 2 | 3
    assessmentCode: string
}

export default function ScreeningFlow({
    current,
    assessmentCode,
}: ScreeningFlowProps) {
    const { tr } = useLanguage()

    const labels = [
        tr("Anak", "Child"),
        assessmentCode === "SPK"
            ? tr("Saringan", "Screening")
            : tr("Pemerhatian", "Observations"),
        tr("Ringkasan", "Summary"),
    ]

    return (
        <div className="flow-top">
            <div className="steps">
                {labels.map((label, index) => {
                    const step = index + 1
                    const stateClass =
                        current === step
                            ? "active"
                            : current > step
                                ? "complete"
                                : ""

                    return (
                        <span
                            key={label}
                            className={stateClass}
                        >
                            <b>{step}</b>
                            {label}

                            {index < labels.length - 1 && (
                                <i aria-hidden="true" />
                            )}
                        </span>
                    )
                })}
            </div>
        </div>
    )
}