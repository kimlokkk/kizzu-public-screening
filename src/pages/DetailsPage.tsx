import { useEffect, useState } from "react"

import ScreeningFlow from "@/components/screening/ScreeningFlow"
import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"
import { calculateAgeInMonths } from "@/utils/age"
import { toTitleCase } from "@/utils/form"

import type {
    AssessmentType,
    ParentChildDetails,
} from "@/types/assessment"

type DetailsPageProps = {
    assessment: AssessmentType
    initialDetails?: ParentChildDetails | null
    onContinue: (
        details: ParentChildDetails,
        ageMonths: number,
    ) => Promise<void>
}

export default function DetailsPage({
    assessment,
    initialDetails,
    onContinue,
}: DetailsPageProps) {
    const { tr } = useLanguage()

    const [childName, setChildName] =
        useState(initialDetails?.childName ?? "")

    const [childDob, setChildDob] =
        useState(initialDetails?.childDob ?? "")

    const [error, setError] =
        useState<string | null>(null)

    const [loading, setLoading] =
        useState(false)

    useEffect(() => {
        if (initialDetails) {
            setChildName(initialDetails.childName)
            setChildDob(initialDetails.childDob)
        }
    }, [initialDetails])

    const isSpk =
        assessment.code === "SPK"

    async function submit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()
        setError(null)

        const normalizedName =
            toTitleCase(childName)

        if (!normalizedName.trim()) {
            setError(
                tr(
                    "Sila isi nama anak.",
                    "Please enter your child's name.",
                ),
            )
            return
        }

        const ageMonths =
            calculateAgeInMonths(childDob)

        if (ageMonths === null) {
            setError(
                tr(
                    "Tarikh lahir tidak sah.",
                    "Invalid date of birth.",
                ),
            )
            return
        }

        const details: ParentChildDetails = {
            childName: normalizedName,
            childDob,
            parentName:
                initialDetails?.parentName ?? "",
            phone:
                initialDetails?.phone ?? "",
            email:
                initialDetails?.email ?? "",
            location:
                initialDetails?.location ?? "",
        }

        try {
            setLoading(true)
            await onContinue(details, ageMonths)
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : tr(
                        "Saringan tidak dapat dimuatkan.",
                        "Unable to load the assessment.",
                    ),
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScreeningShell>
            <div className="flow-wrap entry-sheet">
                <section className="clean-intro">
                    <h1>
                        {isSpk ? (
                            <>
                                {tr(
                                    "Saringan ",
                                    "Child ",
                                )}
                                <span className="green-text">
                                    {tr(
                                        "Perkembangan",
                                        "Development",
                                    )}
                                </span>{" "}
                                <span className="blue-text">
                                    {tr(
                                        "Kanak-Kanak",
                                        "Screening",
                                    )}
                                </span>
                            </>
                        ) : (
                            <>
                                {tr(
                                    "Saringan ",
                                    "Child ",
                                )}
                                <span className="green-text">
                                    {tr(
                                        "Lewat Perkembangan",
                                        "Developmental Delay",
                                    )}
                                </span>{" "}
                                <span className="blue-text">
                                    {tr(
                                        "Anak",
                                        "Screening",
                                    )}
                                </span>
                            </>
                        )}
                    </h1>

                    <p>
                        {isSpk ? (
                            <>
                                {tr(
                                    "Saringan awal mengikut umur anak.",
                                    "An age-based developmental screening.",
                                )}
                                <br />
                                {tr(
                                    "Percuma · Umur 1 hingga 6 tahun",
                                    "Free · Ages 1 to 6 years",
                                )}
                            </>
                        ) : (
                            <>
                                {tr(
                                    "Semakan awal berdasarkan pemerhatian ibu bapa.",
                                    "An initial review based on parent observations.",
                                )}
                                <br />
                                {tr(
                                    "Percuma · Umur 1 hingga bawah 6 tahun",
                                    "Free · Ages 1 to under 6",
                                )}
                            </>
                        )}
                    </p>
                </section>

                <ScreeningFlow
                    current={1}
                    assessmentCode={assessment.code}
                />

                <form
                    className="form-panel"
                    onSubmit={submit}
                >
                    <h2>
                        {tr(
                            "Maklumat anak",
                            "Child details",
                        )}
                    </h2>

                    <div className="fields">
                        <div className="field full">
                            <label htmlFor="childName">
                                {tr(
                                    "Nama anak",
                                    "Child's name",
                                )}
                            </label>

                            <input
                                id="childName"
                                name="childName"
                                autoComplete="name"
                                maxLength={100}
                                value={childName}
                                onChange={(event) =>
                                    setChildName(
                                        event.target.value,
                                    )
                                }
                                onBlur={() =>
                                    setChildName(
                                        toTitleCase(childName),
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="field full">
                            <label htmlFor="childDob">
                                {tr(
                                    "Tarikh lahir",
                                    "Date of birth",
                                )}
                            </label>

                            <input
                                id="childDob"
                                name="childDob"
                                type="date"
                                value={childDob}
                                max={
                                    new Date()
                                        .toISOString()
                                        .split("T")[0]
                                }
                                onChange={(event) =>
                                    setChildDob(
                                        event.target.value,
                                    )
                                }
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p
                            className="error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        className="btn primary-wide"
                        type="submit"
                        disabled={loading}
                    >
                        <span>
                            {loading
                                ? tr(
                                    "Memuatkan...",
                                    "Loading...",
                                )
                                : isSpk
                                    ? tr(
                                        "Mula saringan",
                                        "Start screening",
                                    )
                                    : tr(
                                        "Mula checklist",
                                        "Start checklist",
                                    )}
                        </span>

                        <span aria-hidden="true">
                            →
                        </span>
                    </button>

                    <p className="form-note">
                        {isSpk
                            ? tr(
                                "Maklumat ibu bapa diperlukan untuk menyimpan ringkasan saringan.",
                                "Parent details are required to save the screening summary.",
                            )
                            : tr(
                                "Maklumat ibu bapa diperlukan untuk menyimpan ringkasan checklist.",
                                "Parent details are required to save the checklist summary.",
                            )}
                    </p>

                    <p className="disclaimer">
                        {isSpk
                            ? tr(
                                "Saringan awal berasaskan pemerhatian, bukan diagnosis.",
                                "An initial observation-based screening, not a diagnosis.",
                            )
                            : tr(
                                "Checklist ini berasaskan pemerhatian dan bukan diagnosis.",
                                "This checklist is observation-based and is not a diagnosis.",
                            )}{" "}

                        <a
                            href="/privacy-policy/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {tr(
                                "Privasi",
                                "Privacy",
                            )}
                        </a>
                    </p>
                </form>
            </div>
        </ScreeningShell>
    )
}