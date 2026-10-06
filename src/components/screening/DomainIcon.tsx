type DomainIconProps = {
    code: string
    className?: string
}

function familyFor(code: string) {
    const value = code.toUpperCase()

    if (
        value === "SOCIAL_EMOTIONAL" ||
        value === "PERSONAL_SOCIAL" ||
        value.includes("SOCIAL") ||
        value.includes("EMOTION") ||
        value.includes("PERSONAL")
    ) {
        return "SOCIAL_EMOTIONAL"
    }

    if (
        value === "LANGUAGE_COMMUNICATION" ||
        value === "SPEECH_LANGUAGE" ||
        value.includes("LANGUAGE") ||
        value.includes("SPEECH") ||
        value.includes("COMMUNICATION")
    ) {
        return "LANGUAGE_COMMUNICATION"
    }

    if (
        value === "FINE_MOTOR" ||
        value.includes("FINE") ||
        value.includes("VISUAL")
    ) {
        return "FINE_MOTOR"
    }

    if (
        value === "PHYSICAL_DEVELOPMENT" ||
        value === "GROSS_MOTOR" ||
        value.includes("GROSS") ||
        value.includes("PHYSICAL")
    ) {
        return "PHYSICAL_DEVELOPMENT"
    }

    return "COGNITIVE_THINKING"
}

export default function DomainIcon({
    code,
    className = "",
}: DomainIconProps) {
    const family = familyFor(code)

    if (family === "SOCIAL_EMOTIONAL") {
        return (
            <svg
                className={className}
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                focusable="false"
            >
                <circle cx="16" cy="12" r="7" fill="#FFBE16" />
                <circle cx="35" cy="15" r="6" fill="#F33E68" />
                <path d="M4 39V29a12 12 0 0 1 24 0v10H4Z" fill="#1675EB" />
                <path d="M30 39V28a11 11 0 0 0-1-5 10 10 0 0 1 16 8v8H30Z" fill="#18A367" />
                <path d="M11 28q5 6 10 0" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        )
    }

    if (family === "LANGUAGE_COMMUNICATION") {
        return (
            <svg
                className={className}
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                focusable="false"
            >
                <path d="M26 19h12a8 8 0 0 1 8 8v7a8 8 0 0 1-8 8h-1v5l-8-5h-3a8 8 0 0 1-8-8v-7a8 8 0 0 1 8-8Z" fill="#FFBE16" />
                <path d="M11 3h20a9 9 0 0 1 9 9v10a9 9 0 0 1-9 9H19l-9 6v-6a9 9 0 0 1-8-9V12a9 9 0 0 1 9-9Z" fill="#1675EB" />
                <circle cx="12" cy="17" r="2.5" fill="white" />
                <circle cx="21" cy="17" r="2.5" fill="white" />
                <circle cx="30" cy="17" r="2.5" fill="white" />
            </svg>
        )
    }

    if (family === "PHYSICAL_DEVELOPMENT") {
        return (
            <svg
                className={className}
                viewBox="0 0 48 48"
                fill="none"
                aria-hidden="true"
                focusable="false"
            >
                <circle cx="29" cy="7" r="6" fill="#FFBE16" />
                <path d="m12 19 10-5 10 8 9-2" stroke="#18A367" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m23 16-5 15-10 11" stroke="#1675EB" strokeWidth="7" strokeLinecap="round" />
                <path d="m19 29 13 4 6 10" stroke="#F33E68" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        )
    }

    if (family === "FINE_MOTOR") {
        return (
            <svg
                className={className}
                viewBox="0 0 48 48"
                aria-hidden="true"
                focusable="false"
            >
                <rect x="3" y="9" width="30" height="35" rx="4" fill="#1675EB" />
                <path d="M10 34h14M10 39h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <path d="m16 28 4-11L34 3l10 10-14 14-11 4Z" fill="#FFBE16" />
                <path d="m34 3 3-2a3 3 0 0 1 4 0l5 5a3 3 0 0 1 0 4l-2 3Z" fill="#F33E68" />
                <path d="m16 28 3 3-4 1Z" fill="#202124" />
            </svg>
        )
    }

    return (
        <svg
            className={className}
            viewBox="0 0 48 48"
            fill="none"
            aria-hidden="true"
            focusable="false"
        >
            <rect x="3" y="27" width="19" height="18" rx="3" fill="#1675EB" />
            <rect x="26" y="27" width="19" height="18" rx="3" fill="#F33E68" />
            <path d="M13 21 24 3l11 18H13Z" fill="#FFBE16" />
            <path d="m9 36 3 3 6-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="35.5" cy="36" r="4" fill="white" />
        </svg>
    )
}
