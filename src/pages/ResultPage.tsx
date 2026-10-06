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

    const [copied, setCopied] =
        useState(false)

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
                            "Menyediakan ringkasan...",
                            "Preparing your summary...",
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
                            "Ringkasan belum dapat dibuka",
                            "Unable to open the summary",
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

    const total =
        result.total_positive +
        result.total_negative

    const guidance: Guidance = (() => {
        if (isPc) {
            if (result.total_negative === 0) {
                return {
                    level: "good",
                    label: tr(
                        "Panduan tindakan",
                        "Action guide",
                    ),
                    title: tr(
                        "Teruskan perkembangan",
                        "Keep supporting development",
                    ),
                    message: tr(
                        "Semua kemahiran dalam checklist umur ini telah diperhatikan. Teruskan aktiviti sesuai umur dan pemerhatian dari semasa ke semasa.",
                        "All skills in this age checklist have been observed. Continue age-appropriate activities and ongoing observation.",
                    ),
                }
            }

            if (result.total_negative === 1) {
                return {
                    level: "watch",
                    label: tr(
                        "Panduan tindakan",
                        "Action guide",
                    ),
                    title: tr(
                        "Pantau & cuba bersama anak",
                        "Monitor and try together",
                    ),
                    message: tr(
                        "Satu kemahiran belum diperhatikan. Ini tidak semestinya bermaksud kelewatan. Cuba aktiviti yang dicadangkan dan berbincang dengan doktor atau profesional perkembangan kanak-kanak jika anda bimbang atau kemahiran masih belum muncul.",
                        "One skill has not yet been observed. This does not necessarily mean there is a delay. Try the suggested activities and discuss it with a doctor or child-development professional if you are concerned or the skill is still not emerging.",
                    ),
                }
            }

            return {
                level: "refer",
                label: tr(
                    "Panduan tindakan",
                    "Action guide",
                ),
                title: tr(
                    "Disarankan berbincang dengan profesional",
                    "Professional discussion recommended",
                ),
                message: tr(
                    "Lebih daripada satu kemahiran belum diperhatikan. Checklist ini bukan diagnosis. Bawa ringkasan ini untuk berbincang dengan doktor atau profesional perkembangan kanak-kanak bagi menentukan sama ada saringan tervalidasi atau penilaian lanjut diperlukan.",
                    "More than one skill has not yet been observed. This checklist is not a diagnosis. Share this summary with a doctor or child-development professional to decide whether validated screening or further assessment is appropriate.",
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

    const negativeLabel =
        isPc
            ? tr("Belum", "Not yet")
            : tr(
                "Tidak Tercapai",
                "Not achieved",
            )

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

    async function copyLink() {
        try {
            await navigator.clipboard.writeText(
                window.location.href,
            )
            setCopied(true)

            window.setTimeout(
                () => setCopied(false),
                1600,
            )
        } catch {
            setCopied(false)
        }
    }

    const whatsappNumber = (
        import.meta.env
            .VITE_KIZZU_WHATSAPP_NUMBER ??
        ""
    ).replace(/\D/g, "")

    const whatsappMessage = [
        language === "ms"
            ? `Hi Kizzu, saya baru selesai ${isPc ? "Parental Checklist" : "Saringan Perkembangan Kanak-Kanak"} di laman Kizzu.`
            : `Hi Kizzu, I have just completed the ${isPc ? "Parental Checklist" : "Child Development Screening"} on the Kizzu website.`,
        "",
        `${tr("No. Rujukan", "Reference No.")}: ${data.reference_code}`,
        `${tr("Ringkasan", "Summary")}: ${guidance.title}`,
        "",
        tr(
            "Saya ingin mendapatkan panduan lanjut.",
            "I would like further guidance.",
        ),
    ].join("\n")

    const whatsappHref =
        whatsappNumber
            ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                whatsappMessage,
            )}`
            : undefined

    return (
        <ScreeningShell>
            <div className="result-wrap">
                <section className="clean-intro result-heading">
                    <h1>
                        {tr(
                            "Ringkasan",
                            "Summary",
                        )}
                        <br />
                        <span className="blue-text">
                            {data.child.name}
                        </span>
                    </h1>

                    <p>
                        {data.age.group}
                        {dateLabel
                            ? ` · ${dateLabel}`
                            : ""}
                    </p>
                </section>

                <div className="result-tools">
                    <div className="result-counts">
                        <span>
                            <strong>
                                {
                                    result.total_positive
                                }
                            </strong>{" "}
                            {positiveLabel}
                        </span>

                        <span>
                            <strong>
                                {
                                    result.total_negative
                                }
                            </strong>{" "}
                            {negativeLabel}
                        </span>
                    </div>

                    <div>
                        <button
                            className="btn secondary"
                            type="button"
                            onClick={() =>
                                void copyLink()
                            }
                        >
                            {copied
                                ? tr(
                                    "Disalin",
                                    "Copied",
                                )
                                : tr(
                                    "Salin pautan",
                                    "Copy link",
                                )}
                        </button>

                        <button
                            className="btn secondary"
                            type="button"
                            onClick={() =>
                                window.print()
                            }
                        >
                            {tr(
                                "Cetak",
                                "Print",
                            )}
                        </button>
                    </div>
                </div>

                <section
                    className="guidance-card"
                    data-level={guidance.level}
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
                        <p>
                            {guidance.message}
                        </p>
                    </div>
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
                                            {
                                                domain.positive
                                            }
                                        </strong>{" "}
                                        / {domain.total}{" "}
                                        {
                                            positiveLabel
                                        }
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

                    <p className="form-note">
                        {isPc
                            ? tr(
                                `Berdasarkan ${total} jawapan anda. Ini bukan pengesahan kelewatan perkembangan.`,
                                `Based on your ${total} answers. This does not confirm developmental delay.`,
                            )
                            : tr(
                                `Berdasarkan ${total} jawapan saringan.`,
                                `Based on ${total} screening responses.`,
                            )}
                    </p>
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
                                    {tr(
                                        "Lihat kemahiran yang boleh diperhatikan lagi.",
                                        "Skills to keep observing.",
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

                        <ul className="watch-list">
                            {result.items_to_watch.map(
                                (item) => {
                                    const domain =
                                        result.domains.find(
                                            (
                                                domain,
                                            ) =>
                                                domain.code ===
                                                item.domain_code,
                                        )

                                    return (
                                        <li
                                            key={
                                                item.question_id
                                            }
                                            data-domain={
                                                item.domain_code
                                            }
                                        >
                                            <span className="watch-item-icon">
                                                <DomainIcon
                                                    code={
                                                        item.domain_code
                                                    }
                                                />
                                            </span>

                                            <div className="watch-item-copy">
                                                <small>
                                                    {domain
                                                        ? domainName(
                                                            domain,
                                                        )
                                                        : language === "en"
                                                            ? item.domain_name_en ||
                                                            item.domain_name_ms
                                                            : item.domain_name_ms}
                                                </small>

                                                <p>
                                                    {language ===
                                                    "en"
                                                        ? item.question_en ||
                                                        item.question_ms
                                                        : item.question_ms}
                                                </p>
                                            </div>
                                        </li>
                                    )
                                },
                            )}
                        </ul>
                    </details>
                ) : (
                    <p className="positive-note">
                        {isPc
                            ? tr(
                                "Semua kemahiran yang ditanya dalam checklist ini telah diperhatikan.",
                                "All skills asked about in this checklist have been observed.",
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
                                {result.total_negative >
                                0
                                    ? tr(
                                        "Cuba bersama anak",
                                        "Try together",
                                    )
                                    : tr(
                                        "Aktiviti pengayaan",
                                        "Enrichment activities",
                                    )}
                            </h2>

                            <p>
                                {tr(
                                    "Pilih satu aktiviti untuk bermula.",
                                    "Choose one activity to start.",
                                )}
                            </p>
                        </div>

                        <div className="activity-stack">
                            {data.recommendations.map(
                                (
                                    activity,
                                ) => {
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
                                            <p className="instruction-label">
                                                {tr(
                                                    "Cara cuba",
                                                    "How to try",
                                                )}
                                            </p>

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

                <section className="next-step support-card">
                    <span className="support-icon area-icon">
                        <DomainIcon
                            code="LANGUAGE_COMMUNICATION"
                        />
                    </span>

                    <div className="support-copy">
                        <h2>
                            {tr(
                                "Bincang langkah seterusnya",
                                "Let's talk about next steps",
                            )}
                        </h2>

                        <p>
                            {guidance.level ===
                            "refer"
                                ? tr(
                                    "Kongsikan ringkasan ini dengan pasukan Kizzu untuk memahami pilihan penilaian dan sokongan yang sesuai.",
                                    "Share this summary with the Kizzu team to understand suitable assessment and support options.",
                                )
                                : tr(
                                    "Kongsikan ringkasan ini jika anda mahu panduan aktiviti atau perkembangan anak.",
                                    "Share this summary if you would like guidance on activities or your child's development.",
                                )}
                        </p>
                    </div>

                    {whatsappHref ? (
                        <a
                            className="btn"
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {tr(
                                "Bincang dengan Kizzu",
                                "Talk to Kizzu",
                            )}
                            <span aria-hidden="true">
                                ↗
                            </span>
                        </a>
                    ) : (
                        <button
                            type="button"
                            className="btn"
                            disabled
                        >
                            {tr(
                                "WhatsApp belum dikonfigurasi",
                                "WhatsApp not configured",
                            )}
                        </button>
                    )}
                </section>

                <p className="disclaimer">
                    {isPc
                        ? tr(
                            "Checklist ini berdasarkan pemerhatian ibu bapa dan bukan alat diagnosis atau pengganti saringan perkembangan yang tervalidasi. Jika anak kehilangan kemahiran yang pernah dikuasai, atau anda bimbang tentang perkembangannya, dapatkan nasihat profesional tanpa menunggu checklist seterusnya.",
                            "This checklist is based on parent observations and is not a diagnostic tool or a substitute for validated developmental screening. If your child loses a skill they previously had, or you are concerned about their development, seek professional advice without waiting for the next checklist.",
                        )
                        : tr(
                            "Keputusan SPK ialah panduan awal berdasarkan jawapan yang diberikan dan bukan diagnosis.",
                            "The SPK result is an initial guide based on the answers provided and is not a diagnosis.",
                        )}
                </p>

                <details className="reference-details">
                    <summary>
                        <span>
                            {tr(
                                "Rujukan & privasi",
                                "Reference & privacy",
                            )}
                        </span>

                        <ChevronDown
                            className="details-chevron"
                            aria-hidden="true"
                        />
                    </summary>

                    <p className="reference">
                        {data.reference_code}
                    </p>

                    <p className="form-note">
                        {tr(
                            "Pautan ini membuka ringkasan anak anda. Kongsi hanya dengan orang yang dipercayai.",
                            "This link opens your child's summary. Share it only with people you trust.",
                        )}
                    </p>
                </details>

                <button
                    className="inline-link new-checklist"
                    type="button"
                    onClick={onStartNew}
                >
                    {isPc
                        ? tr(
                            "Checklist baharu",
                            "New checklist",
                        )
                        : tr(
                            "Saringan baharu",
                            "New screening",
                        )}
                </button>
            </div>
        </ScreeningShell>
    )
}