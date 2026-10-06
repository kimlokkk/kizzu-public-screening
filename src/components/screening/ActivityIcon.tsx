import DomainIcon from "@/components/screening/DomainIcon"

type ActivityIconProps = {
    category: string
}

export default function ActivityIcon({
    category,
}: ActivityIconProps) {
    const value =
        (category || "").toUpperCase()

    // Exact SELF_CARE artwork from boss pc-v1.js
    if (value === "SELF_CARE") {
        return (
            <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                focusable="false"
            >
                <path
                    d="m15 7-12 9 7 10 6-4v22h17V22l6 4 7-10-12-9c-2 9-17 9-19 0Z"
                    fill="#18A367"
                />
                <path
                    d="M19 9c0 7 11 7 11 0"
                    fill="none"
                    stroke="#FFBE16"
                    strokeWidth="4"
                />
                <path
                    d="m20 28 3 3 6-7"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }

    // Exact VISUAL / FINE artwork from boss pc-v1.js
    if (/VISUAL|FINE/.test(value)) {
        return (
            <svg
                viewBox="0 0 48 48"
                aria-hidden="true"
                focusable="false"
            >
                <rect
                    x="3"
                    y="9"
                    width="30"
                    height="35"
                    rx="4"
                    fill="#1675EB"
                />
                <path
                    d="M10 34h14M10 39h8"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <path
                    d="m16 28 4-11L34 3l10 10-14 14-11 4Z"
                    fill="#FFBE16"
                />
                <path
                    d="m34 3 3-2a3 3 0 0 1 4 0l5 5a3 3 0 0 1 0 4l-2 3Z"
                    fill="#F33E68"
                />
                <path
                    d="m16 28 3 3-4 1Z"
                    fill="#202124"
                />
            </svg>
        )
    }

    if (
        /LANGUAGE|COMMUNICATION|SPEECH/.test(
            value,
        )
    ) {
        return (
            <DomainIcon code="LANGUAGE_COMMUNICATION" />
        )
    }

    if (
        /SOCIAL|EMOTION|PERSONAL/.test(
            value,
        )
    ) {
        return (
            <DomainIcon code="SOCIAL_EMOTIONAL" />
        )
    }

    if (
        /MOTOR|PHYSICAL|GROSS|BALANCE|LOCOMOTOR|BALL/.test(
            value,
        )
    ) {
        return (
            <DomainIcon code="PHYSICAL_DEVELOPMENT" />
        )
    }

    return (
        <DomainIcon code="COGNITIVE_THINKING" />
    )
}
