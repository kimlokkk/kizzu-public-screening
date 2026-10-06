import {
    useEffect,
    useState,
} from "react"

import DomainIcon from "@/components/screening/DomainIcon"
import ScreeningFlow from "@/components/screening/ScreeningFlow"
import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"
import { MALAYSIA_LOCATIONS } from "@/data/locations"

import {
    formatMalaysiaPhoneForDisplay,
    isValidEmail,
    isValidMalaysiaPhone,
    normalizeEmail,
    normalizeMalaysiaPhone,
    toTitleCase,
} from "@/utils/form"

import type {
    AssessmentAnswers,
    AssessmentData,
    ParentChildDetails,
} from "@/types/assessment"

type AssessmentPageProps = {
    assessmentData: AssessmentData
    details: ParentChildDetails
    submitting: boolean
    submitError: string | null
    onBackToDetails: () => void
    onComplete: (
        answers: AssessmentAnswers,
        details: ParentChildDetails,
    ) => Promise<void>
}

type ParentErrors = Partial<
    Record<
        "parentName" | "phone" | "email" | "location",
        string
    >
>

export default function AssessmentPage({
    assessmentData,
    details,
    submitting,
    submitError,
    onBackToDetails,
    onComplete,
}: AssessmentPageProps) {
    const {
        language,
        tr,
    } = useLanguage()

    const [domainIndex, setDomainIndex] =
        useState(0)

    const [answers, setAnswers] =
        useState<AssessmentAnswers>({})

    const [error, setError] =
        useState<string | null>(null)

    const [unansweredIds, setUnansweredIds] =
        useState<number[]>([])

    const [reviewMode, setReviewMode] =
        useState(false)

    const [parentForm, setParentForm] =
        useState<ParentChildDetails>(details)

    const [consent, setConsent] =
        useState(false)

    const [parentErrors, setParentErrors] =
        useState<ParentErrors>({})

    const domains = assessmentData.domains
    const currentDomain =
        domains[domainIndex]

    const isSpk =
        assessmentData.assessment.code === "SPK"

    const positiveLabel =
        isSpk
            ? tr("Tercapai", "Achieved")
            : tr("Boleh", "Able")

    const negativeLabel =
        isSpk
            ? tr(
                "Tidak Tercapai",
                "Not Achieved",
            )
            : tr("Belum", "Not Yet")

    const totalAnswered =
        Object.keys(answers).length

    const progress =
        assessmentData.total_questions > 0
            ? (
                totalAnswered /
                assessmentData.total_questions
            ) * 100
            : 0

    const globalOffset =
        domains
            .slice(0, domainIndex)
            .reduce(
                (total, domain) =>
                    total +
                    domain.questions.length,
                0,
            )

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }, [domainIndex, reviewMode])

    function domainName(
        domain:
            AssessmentData["domains"][number],
    ) {
        if (
            language === "en" &&
            domain.name_en
        ) {
            return domain.name_en
        }

        return domain.name_ms
    }

    function questionText(
        question:
            AssessmentData["domains"][number]["questions"][number],
    ) {
        if (language === "en") {
            return (
                question.question_en ||
                tr(
                    "Terjemahan belum tersedia.",
                    "Translation not available.",
                )
            )
        }

        return question.question_ms
    }

    function answerQuestion(
        questionId: number,
        value: boolean,
    ) {
        setAnswers((current) => ({
            ...current,
            [questionId]: value,
        }))

        setUnansweredIds((current) =>
            current.filter(
                (id) => id !== questionId,
            ),
        )

        setError(null)
    }

    function nextDomain() {
        if (!currentDomain) {
            return
        }

        const missing =
            currentDomain.questions
                .filter(
                    (question) =>
                        answers[question.id] ===
                        undefined,
                )
                .map(
                    (question) =>
                        question.id,
                )

        if (missing.length > 0) {
            setUnansweredIds(missing)

            setError(
                tr(
                    "Sila jawab semua soalan dalam bahagian ini sebelum meneruskan.",
                    "Please answer every question in this section before continuing.",
                ),
            )
            return
        }

        setUnansweredIds([])
        setError(null)

        if (
            domainIndex ===
            domains.length - 1
        ) {
            setReviewMode(true)
            return
        }

        setDomainIndex(
            (current) => current + 1,
        )
    }

    function previousDomain() {
        setError(null)
        setUnansweredIds([])

        if (domainIndex === 0) {
            onBackToDetails()
            return
        }

        setDomainIndex(
            (current) => current - 1,
        )
    }

    function editDomain(index: number) {
        setDomainIndex(index)
        setReviewMode(false)
        setError(null)
        setUnansweredIds([])
    }

    function updateParent(
        field:
            | "parentName"
            | "phone"
            | "email"
            | "location",
        value: string,
    ) {
        setParentForm((current) => ({
            ...current,
            [field]: value,
        }))

        setParentErrors((current) => ({
            ...current,
            [field]: undefined,
        }))
    }

    function validateParent() {
        const errors: ParentErrors = {}

        const normalized: ParentChildDetails = {
            ...parentForm,
            parentName:
                toTitleCase(
                    parentForm.parentName,
                ),
            phone:
                normalizeMalaysiaPhone(
                    parentForm.phone,
                ),
            email:
                normalizeEmail(
                    parentForm.email,
                ),
        }

        if (!normalized.parentName.trim()) {
            errors.parentName =
                tr(
                    "Nama ibu bapa / penjaga diperlukan.",
                    "Parent / guardian name is required.",
                )
        }

        if (!normalized.phone.trim()) {
            errors.phone =
                tr(
                    "No. telefon diperlukan.",
                    "Phone number is required.",
                )
        } else if (
            !isValidMalaysiaPhone(
                normalized.phone,
            )
        ) {
            errors.phone =
                tr(
                    "Masukkan no. telefon Malaysia yang sah.",
                    "Enter a valid Malaysian phone number.",
                )
        }

        if (!normalized.email.trim()) {
            errors.email =
                tr(
                    "Email diperlukan.",
                    "Email is required.",
                )
        } else if (
            !isValidEmail(
                normalized.email,
            )
        ) {
            errors.email =
                tr(
                    "Format email tidak sah.",
                    "Invalid email format.",
                )
        }

        if (!normalized.location) {
            errors.location =
                tr(
                    "Sila pilih lokasi.",
                    "Please select a location.",
                )
        }

        setParentErrors(errors)

        setParentForm({
            ...normalized,
            phone:
                normalized.phone
                    ? `+${normalized.phone}`
                    : "",
        })

        return {
            errors,
            normalized,
        }
    }

    function submitReview(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const {
            errors,
            normalized,
        } = validateParent()

        if (
            Object.keys(errors).length >
            0
        ) {
            return
        }

        if (!consent) {
            setError(
                tr(
                    "Sila beri persetujuan sebelum menyimpan ringkasan.",
                    "Please provide consent before saving the summary.",
                ),
            )
            return
        }

        setError(null)

        void onComplete(
            answers,
            normalized,
        )
    }

    if (reviewMode) {
        const yesCount =
            Object.values(answers)
                .filter(Boolean)
                .length

        return (
            <ScreeningShell>
                <div className="flow-wrap">
                    <ScreeningFlow
                        current={3}
                        assessmentCode={
                            assessmentData
                                .assessment
                                .code
                        }
                    />

                    <div className="page-heading">
                        <h1>
                            {tr(
                                "Semak & simpan",
                                "Review & save",
                            )}
                        </h1>

                        <p>
                            {details.childName}
                            {" · "}
                            {assessmentData.age.group}
                        </p>
                    </div>

                    <details className="review-details">
                        <summary>
                            <span>
                                {yesCount}{" "}
                                {positiveLabel}
                                {" · "}
                                {
                                    assessmentData
                                        .total_questions -
                                    yesCount
                                }{" "}
                                {negativeLabel}
                            </span>

                            <span className="muted">
                                {tr(
                                    "Semak jawapan",
                                    "Review answers",
                                )}
                            </span>
                        </summary>

                        <div>
                            {domains.map(
                                (
                                    domain,
                                    index,
                                ) => {
                                    const positive =
                                        domain.questions.filter(
                                            (
                                                question,
                                            ) =>
                                                answers[
                                                question
                                                    .id
                                                ] ===
                                                true,
                                        ).length

                                    return (
                                        <div
                                            key={
                                                domain.id
                                            }
                                            className="review-domain"
                                        >
                                            <span>
                                                {
                                                    domainName(
                                                        domain,
                                                    )
                                                }
                                                <small>
                                                    {
                                                        positive
                                                    }{" "}
                                                    /{" "}
                                                    {
                                                        domain
                                                            .questions
                                                            .length
                                                    }{" "}
                                                    {
                                                        positiveLabel
                                                    }
                                                </small>
                                            </span>

                                            <button
                                                type="button"
                                                className="inline-link"
                                                disabled={
                                                    submitting
                                                }
                                                onClick={() =>
                                                    editDomain(
                                                        index,
                                                    )
                                                }
                                            >
                                                {tr(
                                                    "Ubah",
                                                    "Edit",
                                                )}
                                            </button>
                                        </div>
                                    )
                                },
                            )}
                        </div>
                    </details>

                    <form
                        className="form-panel"
                        onSubmit={submitReview}
                    >
                        <h2>
                            {tr(
                                "Maklumat ibu bapa",
                                "Parent details",
                            )}
                        </h2>

                        <div className="fields">
                            <div className="field full">
                                <label htmlFor="parentName">
                                    {tr(
                                        "Nama ibu / bapa / penjaga",
                                        "Parent / guardian name",
                                    )}
                                </label>

                                <input
                                    id="parentName"
                                    value={
                                        parentForm.parentName
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateParent(
                                            "parentName",
                                            event.target
                                                .value,
                                        )
                                    }
                                    onBlur={() =>
                                        updateParent(
                                            "parentName",
                                            toTitleCase(
                                                parentForm.parentName,
                                            ),
                                        )
                                    }
                                    autoComplete="name"
                                    required
                                />

                                {parentErrors.parentName && (
                                    <span className="field-error">
                                        {
                                            parentErrors.parentName
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="field full">
                                <label htmlFor="phone">
                                    {tr(
                                        "Nombor telefon",
                                        "Phone number",
                                    )}
                                </label>

                                <input
                                    id="phone"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={
                                        parentForm.phone
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateParent(
                                            "phone",
                                            event.target
                                                .value,
                                        )
                                    }
                                    onBlur={() =>
                                        updateParent(
                                            "phone",
                                            formatMalaysiaPhoneForDisplay(
                                                parentForm.phone,
                                            ),
                                        )
                                    }
                                    required
                                />

                                {parentErrors.phone && (
                                    <span className="field-error">
                                        {
                                            parentErrors.phone
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="field full">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={
                                        parentForm.email
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateParent(
                                            "email",
                                            event.target
                                                .value,
                                        )
                                    }
                                    onBlur={() =>
                                        updateParent(
                                            "email",
                                            normalizeEmail(
                                                parentForm.email,
                                            ),
                                        )
                                    }
                                    required
                                />

                                {parentErrors.email && (
                                    <span className="field-error">
                                        {
                                            parentErrors.email
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="field full">
                                <label htmlFor="location">
                                    {tr(
                                        "Lokasi",
                                        "Location",
                                    )}
                                </label>

                                <select
                                    id="location"
                                    value={
                                        parentForm.location
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        updateParent(
                                            "location",
                                            event.target
                                                .value,
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        {tr(
                                            "Pilih lokasi",
                                            "Select location",
                                        )}
                                    </option>

                                    {MALAYSIA_LOCATIONS.map(
                                        (
                                            location,
                                        ) => (
                                            <option
                                                key={
                                                    location
                                                }
                                                value={
                                                    location
                                                }
                                            >
                                                {
                                                    location
                                                }
                                            </option>
                                        ),
                                    )}
                                </select>

                                {parentErrors.location && (
                                    <span className="field-error">
                                        {
                                            parentErrors.location
                                        }
                                    </span>
                                )}
                            </div>
                        </div>

                        <label className="check">
                            <input
                                type="checkbox"
                                checked={consent}
                                onChange={(
                                    event,
                                ) =>
                                    setConsent(
                                        event.target
                                            .checked,
                                    )
                                }
                            />

                            <span>
                                {tr(
                                    "Saya bersetuju maklumat digunakan untuk rekod saringan dan sokongan Kizzu mengikut Dasar Privasi.",
                                    "I agree to the use of this information for the screening record and Kizzu support under the Privacy Policy.",
                                )}
                            </span>
                        </label>

                        {(error || submitError) && (
                            <p
                                className="error"
                                role="alert"
                            >
                                {
                                    submitError ||
                                    error
                                }
                            </p>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn secondary"
                                disabled={submitting}
                                onClick={() => {
                                    setReviewMode(
                                        false,
                                    )
                                    setDomainIndex(
                                        domains.length -
                                        1,
                                    )
                                }}
                            >
                                {tr(
                                    "Kembali",
                                    "Back",
                                )}
                            </button>

                            <button
                                type="submit"
                                className="btn"
                                disabled={submitting}
                            >
                                {submitting
                                    ? tr(
                                        "Menyimpan...",
                                        "Saving...",
                                    )
                                    : tr(
                                        "Lihat ringkasan",
                                        "View summary",
                                    )}
                            </button>
                        </div>
                    </form>
                </div>
            </ScreeningShell>
        )
    }

    return (
        <ScreeningShell>
            <div className="flow-wrap questions-wrap">
                <ScreeningFlow
                    current={2}
                    assessmentCode={
                        assessmentData
                            .assessment
                            .code
                    }
                />

                <div className="page-heading">
                    <p className="meta">
                        {details.childName}
                        {" · "}
                        {tr(
                            "Bahagian",
                            "Section",
                        )}{" "}
                        {domainIndex + 1}/
                        {domains.length}
                    </p>

                    <div className="section-heading">
                        <span className="area-icon">
                            <DomainIcon
                                code={
                                    currentDomain.code
                                }
                            />
                        </span>

                        <h1>
                            {domainName(
                                currentDomain,
                            )}
                        </h1>
                    </div>

                    <p>
                        {isSpk
                            ? tr(
                                "Pilih “Tercapai” jika kemahiran ini telah diperhatikan.",
                                "Choose “Achieved” if you have observed this skill.",
                            )
                            : tr(
                                "Pilih “Boleh” jika kemahiran ini pernah diperhatikan.",
                                "Choose “Able” if you have observed this skill.",
                            )}
                    </p>
                </div>

                <div className="progress-box">
                    <div
                        className="track"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={
                            assessmentData.total_questions
                        }
                        aria-valuenow={
                            totalAnswered
                        }
                    >
                        <span
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    <p>
                        {totalAnswered} /{" "}
                        {
                            assessmentData
                                .total_questions
                        }{" "}
                        {tr(
                            "jawapan",
                            "answers",
                        )}
                    </p>
                </div>

                <div className="question-list">
                    {currentDomain.questions.map(
                        (
                            question,
                            index,
                        ) => {
                            const answer =
                                answers[
                                question.id
                                ]

                            const unanswered =
                                unansweredIds.includes(
                                    question.id,
                                )

                            const subdomain =
                                language === "en"
                                    ? question
                                        .subdomain_en ||
                                    question
                                        .subdomain_ms
                                    : question
                                        .subdomain_ms

                            return (
                                <section
                                    key={
                                        question.id
                                    }
                                    className={`question ${unanswered
                                        ? "unanswered"
                                        : ""
                                        }`}
                                >
                                    <span className="num">
                                        {String(
                                            globalOffset +
                                            index +
                                            1,
                                        ).padStart(
                                            2,
                                            "0",
                                        )}
                                    </span>

                                    <div>
                                        {subdomain && (
                                            <small className="question-subdomain">
                                                {
                                                    subdomain
                                                }
                                            </small>
                                        )}

                                        <p>
                                            {questionText(
                                                question,
                                            )}
                                        </p>

                                        <div className="answer">
                                            <button
                                                type="button"
                                                aria-pressed={
                                                    answer ===
                                                    true
                                                }
                                                onClick={() =>
                                                    answerQuestion(
                                                        question.id,
                                                        true,
                                                    )
                                                }
                                            >
                                                {
                                                    positiveLabel
                                                }
                                            </button>

                                            <button
                                                type="button"
                                                className="no"
                                                aria-pressed={
                                                    answer ===
                                                    false
                                                }
                                                onClick={() =>
                                                    answerQuestion(
                                                        question.id,
                                                        false,
                                                    )
                                                }
                                            >
                                                {
                                                    negativeLabel
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            )
                        },
                    )}
                </div>

                {error && (
                    <p
                        className="error"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={
                            previousDomain
                        }
                    >
                        {tr(
                            "Kembali",
                            "Back",
                        )}
                    </button>

                    <button
                        type="button"
                        className="btn"
                        onClick={nextDomain}
                    >
                        {domainIndex ===
                            domains.length - 1
                            ? tr(
                                "Semak jawapan",
                                "Review answers",
                            )
                            : tr(
                                "Seterusnya",
                                "Continue",
                            )}
                    </button>
                </div>
            </div>
        </ScreeningShell>
    )
}