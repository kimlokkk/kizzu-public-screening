import {
    useEffect,
    useState,
} from "react"

import {
    ChevronDown,
} from "lucide-react"

import ActivityIcon from "@/components/screening/ActivityIcon"
import DomainIcon from "@/components/screening/DomainIcon"
import WatchIcon from "@/components/screening/WatchIcon"
import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"
import { getResult } from "@/services/assessment"

import type {
    AssessmentResult,
    RecommendationActivity,
} from "@/types/assessment"

type ResultPageProps = {
    referenceCode: string
    onStartNew: () => void
}

type Guidance = {
    level: "good" | "watch" | "refer"
    label: string
    title: string
    message: string
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

                setData(
                    await getResult(
                        referenceCode,
                    ),
                )
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : tr(
                            "Keputusan tidak dapat dimuatkan.",
                            "The result could not be loaded.",
                        ),
                )
            } finally {
                setLoading(false)
            }
        }

        void loadResult()
    }, [referenceCode])

    if (loading) {
        return (
            <ScreeningShell>
                <div className="loading">
                    <h1>
                        {tr(
                            "Menyediakan keputusan...",
                            "Preparing your results...",
                        )}
                    </h1>
                    <p className="fine">
                        {tr(
                            "Sila tunggu sebentar.",
                            "Please wait a moment.",
                        )}
                    </p>
                </div>
            </ScreeningShell>
        )
    }

    if (error || !data) {
        return (
            <ScreeningShell>
                <div className="loading">
                    <h1>
                        {tr(
                            "Keputusan belum dapat dibuka",
                            "Unable to open the results",
                        )}
                    </h1>
                    <p className="fine">
                        {error}
                    </p>
                    <button
                        className="btn secondary"
                        type="button"
                        onClick={onStartNew}
                    >
                        {tr(
                            "Kembali",
                            "Back",
                        )}
                    </button>
                </div>
            </ScreeningShell>
        )
    }

    const result = data.result
    const isPc =
        data.assessment.code === "PC"

    const guidance: Guidance = (() => {
        if (isPc) {
            if (result.total_negative === 0) {
                return {
                    level: "good",
                    label: tr(
                        "Langkah seterusnya",
                        "Next step",
                    ),
                    title: tr(
                        "Teruskan perkembangan",
                        "Keep supporting development",
                    ),
                    message: tr(
                        "Semua kemahiran dalam saringan ini telah diperhatikan. Teruskan aktiviti sesuai umur dan pemerhatian dari semasa ke semasa.",
                        "All skills in this screening have been observed. Continue age-appropriate activities and ongoing observation.",
                    ),
                }
            }

            if (result.total_negative === 1) {
                return {
                    level: "watch",
                    label: tr(
                        "Langkah seterusnya",
                        "Next step",
                    ),
                    title: tr(
                        "Pantau & cuba bersama anak",
                        "Monitor and try together",
                    ),
                    message: tr(
                        "Satu kemahiran belum diperhatikan. Ini tidak semestinya bermaksud kelewatan. Cuba aktiviti yang dicadangkan dan berbincang dengan pakar perkembangan kanak-kanak jika anda bimbang atau kemahiran masih belum muncul.",
                        "One skill has not yet been observed. This does not necessarily mean there is a delay. Try the suggested activities and speak with a child development specialist if you are concerned or the skill is still not emerging.",
                    ),
                }
            }

            return {
                level: "refer",
                label: tr(
                    "Langkah seterusnya",
                    "Next step",
                ),
                title: tr(
                    "Dapatkan pandangan pakar seawal mungkin",
                    "Speak with a child development specialist soon",
                ),
                message: tr(
                    "Beberapa kemahiran belum diperhatikan. Bawa hasil saringan ini kepada pakar perkembangan kanak-kanak seawal mungkin untuk menentukan langkah seterusnya. Saringan ini bukan diagnosis.",
                    "Several skills have not yet been observed. Share these screening results with a child development specialist as soon as possible to discuss the next steps. This screening is not a diagnosis.",
                ),
            }
        }

        if (result.status === "ON_TRACK") {
            return {
                level: "good",
                label: tr(
                    "Keputusan saringan",
                    "Screening result",
                ),
                title: tr(
                    "Semua item tercapai",
                    "All items achieved",
                ),
                message: tr(
                    "Teruskan aktiviti dan rangsangan perkembangan yang sesuai dengan umur anak.",
                    "Continue age-appropriate developmental activities and stimulation.",
                ),
            }
        }

        if (
            result.status ===
            "MONITOR_REASSESS"
        ) {
            const months =
                data.age.months < 24
                    ? 2
                    : 3

            return {
                level: "watch",
                label: tr(
                    "Keputusan saringan",
                    "Screening result",
                ),
                title: tr(
                    "Pantau dan nilai semula",
                    "Monitor and reassess",
                ),
                message: tr(
                    `Terdapat satu kemahiran yang masih belum tercapai. Berikan peluang dan rangsangan yang sesuai, kemudian nilai semula selepas ${months} bulan.`,
                    `One skill has not yet been achieved. Provide suitable developmental opportunities, then reassess after ${months} months.`,
                ),
            }
        }

        return {
            level: "refer",
            label: tr(
                "Keputusan saringan",
                "Screening result",
            ),
            title: tr(
                "Disarankan penilaian lanjut",
                "Further assessment recommended",
            ),
            message: tr(
                "Corak jawapan menunjukkan kemahiran perkembangan yang memerlukan perhatian lanjut. Pertimbangkan untuk berbincang dengan profesional perkembangan kanak-kanak.",
                "The response pattern suggests developmental skills that may need further attention. Consider discussing the result with a child-development professional.",
            ),
        }
    })()

    const positiveLabel =
        isPc
            ? tr("Boleh", "Able")
            : tr("Tercapai", "Achieved")

    const createdDate =
        data.created_at?.split(" ")[0]

    const dateLabel =
        createdDate
            ? new Intl.DateTimeFormat(
                language === "ms"
                    ? "ms-MY"
                    : "en-MY",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                },
            ).format(
                new Date(
                    `${createdDate}T12:00:00`,
                ),
            )
            : ""

    const exactAgeLabel = (() => {
        const years = Math.floor(
            data.age.months / 12,
        )

        const months =
            data.age.months % 12

        if (language === "ms") {
            return `${years} tahun ${months} bulan`
        }

        return `${years} ${
            years === 1 ? "year" : "years"
        } ${months} ${
            months === 1 ? "month" : "months"
        }`
    })()

    function domainName(
        domain:
            AssessmentResult["result"]["domains"][number],
    ) {
        if (
            language === "en" &&
            domain.name_en
        ) {
            return domain.name_en
        }

        return domain.name_ms
    }

    function activityTitle(
        activity: RecommendationActivity,
    ) {
        return language === "en"
            ? activity.title_en ||
            activity.title
            : activity.title
    }

    function activityInstructions(
        activity: RecommendationActivity,
    ) {
        return language === "en"
            ? activity.instructions_en ||
            activity.instructions
            : activity.instructions
    }

    function activitySupports(
        activity: RecommendationActivity,
    ) {
        return language === "en"
            ? activity.supports_en ||
            activity.supports
            : activity.supports
    }

    function activitySafety(
        activity: RecommendationActivity,
    ) {
        return language === "en"
            ? activity.safety_note_en ||
            activity.safety_note
            : activity.safety_note
    }

    function recommendationDomainCode(
        category: string,
    ) {
        const value =
            category.toUpperCase()

        if (
            value.includes("LANGUAGE") ||
            value.includes("SPEECH") ||
            value.includes("COMMUNICATION")
        ) {
            return "SPEECH_LANGUAGE"
        }

        if (
            value.includes("SOCIAL") ||
            value.includes("EMOTIONAL") ||
            value.includes("SELF_CARE") ||
            value.includes("PERSONAL")
        ) {
            return "PERSONAL_SOCIAL"
        }

        if (
            value.includes("FINE") ||
            value.includes("VISUAL_MOTOR")
        ) {
            return "FINE_MOTOR"
        }

        if (
            value.includes("GROSS") ||
            value.includes("PHYSICAL") ||
            value.includes("BALANCE") ||
            value.includes("LOCOMOTOR") ||
            value.includes("BALL")
        ) {
            return "GROSS_MOTOR"
        }

        if (
            value.includes("COGNITIVE") ||
            value.includes("PROBLEM") ||
            value.includes("EARLY_LEARNING")
        ) {
            return "COGNITIVE"
        }

        return "GENERAL"
    }

    const whatsappNumber = (
        import.meta.env
            .VITE_KIZZU_WHATSAPP_NUMBER ??
        ""
    ).replace(/\D/g, "")

    const whatsappMessage =
        isPc
            ? tr(
                "Hai Kizzu, saya ingin semak perkembangan anak saya dengan occupational therapist.",
                "Hi Kizzu, I would like to have my child's development checked by an occupational therapist.",
            )
            : tr(
                "Hai Kizzu, saya ingin berbincang tentang hasil saringan perkembangan anak saya dengan occupational therapist.",
                "Hi Kizzu, I would like to discuss my child's developmental screening results with an occupational therapist.",
            )

    const whatsappHref =
        whatsappNumber
            ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                whatsappMessage,
            )}`
            : undefined

    const watchedDomainCodes =
        Array.from(
            new Set(
                result.items_to_watch.map(
                    (item) =>
                        item.domain_code,
                ),
            ),
        )

    return (
        <ScreeningShell>
            <div
                className="result-wrap"
                data-assessment={
                    data.assessment.code
                }
            >
                <section className="clean-intro result-heading">
                    <h1>
                        {isPc
                            ? tr(
                                "Hasil Saringan Perkembangan Anak",
                                "Child Development Screening Results",
                            )
                            : tr(
                                "Hasil Saringan Perkembangan Kanak-Kanak",
                                "Child Development Screening Results",
                            )}
                        <br />
                        <span className="blue-text">
                            {data.child.name}
                        </span>
                    </h1>

                    <p>
                        {tr(
                            "Umur",
                            "Age",
                        )}:{" "}
                        {exactAgeLabel}
                        {dateLabel
                            ? ` · ${tr(
                                "Tarikh saringan",
                                "Screening date",
                            )}: ${dateLabel}`
                            : ""}
                    </p>
                </section>

                <section className="domains">
                    <div className="domain-grid">
                        {result.domains.map(
                            (domain) => (
                                <article
                                    key={domain.id}
                                    className="domain-result"
                                    data-domain={
                                        domain.code
                                    }
                                >
                                    <span className="area-icon">
                                        <DomainIcon
                                            code={
                                                domain.code
                                            }
                                        />
                                    </span>

                                    <h2>
                                        {domainName(
                                            domain,
                                        )}
                                    </h2>

                                    <p className="domain-count">
                                        <strong>
                                            {domain.positive}
                                        </strong>{" "}
                                        / {domain.total}{" "}
                                        {positiveLabel}
                                    </p>

                                    <div className="track">
                                        <span
                                            style={{
                                                width: `${
                                                    domain.total >
                                                    0
                                                        ? (
                                                            domain.positive /
                                                            domain.total
                                                        ) *
                                                        100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </article>
                            ),
                        )}
                    </div>
                </section>

                <section
                    className="guidance-card"
                    data-level={
                        guidance.level
                    }
                >
                    <span
                        className="guidance-dot"
                        aria-hidden="true"
                    />

                    <div>
                        <p className="guidance-label">
                            {guidance.label}
                        </p>

                        <h2>
                            {guidance.title}
                        </h2>

                        <p className="guidance-message">
                            {guidance.message}
                        </p>

                        {whatsappHref ? (
                            <a
                                className="btn whatsapp-btn"
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg
                                    className="whatsapp-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M20 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-4-1L3 20l1-4.5a8.5 8.5 0 1 1 16-4Z" />
                                    <path d="M8.5 8.5c.5 3 3 5.5 6 6L16 13" />
                                </svg>

                                <span>
                                    {tr(
                                        "WhatsApp Kizzu",
                                        "WhatsApp Kizzu",
                                    )}
                                </span>
                            </a>
                        ) : (
                            <button
                                type="button"
                                className="btn whatsapp-btn"
                                disabled
                            >
                                {tr(
                                    "WhatsApp belum dikonfigurasi",
                                    "WhatsApp not configured",
                                )}
                            </button>
                        )}
                    </div>
                </section>

                {result.items_to_watch.length >
                    0 ? (
                    <details className="result-details watch-card">
                        <summary>
                            <span className="watch-symbol">
                                <WatchIcon />
                            </span>

                            <span className="watch-title">
                                {isPc
                                    ? tr(
                                        "Belum diperhatikan",
                                        "Not yet observed",
                                    )
                                    : tr(
                                        "Belum tercapai",
                                        "Not yet achieved",
                                    )}

                                <small>
                                    {isPc
                                        ? tr(
                                            "Lihat kemahiran yang boleh diperhatikan lagi.",
                                            "Skills to keep observing.",
                                        )
                                        : tr(
                                            "Lihat kemahiran yang belum tercapai.",
                                            "Skills not yet achieved.",
                                        )}
                                </small>
                            </span>

                            <span className="detail-count">
                                {
                                    result
                                        .items_to_watch
                                        .length
                                }
                            </span>

                            <ChevronDown
                                className="details-chevron"
                                aria-hidden="true"
                            />
                        </summary>

                        <div className="watch-groups">
                            {watchedDomainCodes.map(
                                (domainCode) => {
                                    const items =
                                        result.items_to_watch.filter(
                                            (item) =>
                                                item.domain_code ===
                                                domainCode,
                                        )

                                    const domain =
                                        result.domains.find(
                                            (item) =>
                                                item.code ===
                                                domainCode,
                                        )

                                    const firstItem =
                                        items[0]

                                    return (
                                        <section
                                            key={
                                                domainCode
                                            }
                                            className="watch-group"
                                            data-domain={
                                                domainCode
                                            }
                                        >
                                            <h3 className="watch-group-heading">
                                                <span>
                                                    {domain
                                                        ? domainName(
                                                            domain,
                                                        )
                                                        : firstItem
                                                            .domain_name_ms}
                                                </span>

                                                <span className="watch-group-count">
                                                    {items.length}
                                                </span>
                                            </h3>

                                            <ul className="watch-group-list">
                                                {items.map(
                                                    (item) => (
                                                        <li
                                                            key={
                                                                item.question_id
                                                            }
                                                        >
                                                            <p>
                                                                {language ===
                                                                "en"
                                                                    ? item.question_en ||
                                                                    item.question_ms
                                                                    : item.question_ms}
                                                            </p>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </section>
                                    )
                                },
                            )}
                        </div>
                    </details>
                ) : (
                    <p className="positive-note">
                        {isPc
                            ? tr(
                                "Semua kemahiran yang ditanya dalam saringan ini telah diperhatikan.",
                                "All skills asked about in this screening have been observed.",
                            )
                            : tr(
                                "Semua item saringan bagi kumpulan umur ini telah tercapai.",
                                "All screening items for this age group have been achieved.",
                            )}
                    </p>
                )}

                {data.recommendations.length >
                    0 && (
                    <section className="activities">
                        <div className="activities-heading">
                            <h2>
                                {tr(
                                    "Cadangan aktiviti bersama anak",
                                    "Suggested activities with your child",
                                )}
                            </h2>
                        </div>

                        <div className="activity-stack">
                            {data.recommendations.map(
                                (activity) => {
                                    const activityDomain =
                                        recommendationDomainCode(
                                            activity.category,
                                        )

                                    return (
                                        <details
                                            className="activity-card"
                                            data-domain={
                                                activityDomain
                                            }
                                            key={
                                                activity.id
                                            }
                                        >
                                            <summary>
                                                <span className="activity-icon">
                                                    <ActivityIcon
                                                        category={
                                                            activity.category
                                                        }
                                                    />
                                                </span>

                                                <span className="activity-title">
                                                    <strong>
                                                        {activityTitle(
                                                            activity,
                                                        )}
                                                    </strong>

                                                    {activitySupports(
                                                        activity,
                                                    ) && (
                                                        <small>
                                                            {activitySupports(
                                                                activity,
                                                            )}
                                                        </small>
                                                    )}
                                                </span>

                                                <span
                                                    className="activity-toggle"
                                                    aria-hidden="true"
                                                >
                                                    <ChevronDown />
                                                </span>
                                            </summary>

                                            <div className="activity-body">
                                                <p>
                                                    {activityInstructions(
                                                        activity,
                                                    )}
                                                </p>

                                                {activitySafety(
                                                    activity,
                                                ) && (
                                                    <p className="activity-safety">
                                                        {tr(
                                                            "Nota keselamatan:",
                                                            "Safety note:",
                                                        )}{" "}
                                                        {activitySafety(
                                                            activity,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        </details>
                                    )
                                },
                            )}
                        </div>
                    </section>
                )}
            </div>
        </ScreeningShell>
    )
}
