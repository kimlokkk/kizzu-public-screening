export function toTitleCase(
    value: string,
): string {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
        .replace(
            /(^|[\s'-])\p{L}/gu,
            (character) =>
                character.toUpperCase(),
        )
}

export function normalizeEmail(
    value: string,
): string {
    return value
        .trim()
        .toLowerCase()
}

export function isValidEmail(
    value: string,
): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizeEmail(value),
    )
}

export function normalizeMalaysiaPhone(
    value: string,
): string {
    let phone =
        value.replace(/\D/g, "")

    if (phone.startsWith("60")) {
        return phone
    }

    if (phone.startsWith("0")) {
        phone = phone.substring(1)
    }

    return `60${phone}`
}

export function isValidMalaysiaPhone(
    value: string,
): boolean {
    const phone =
        normalizeMalaysiaPhone(value)

    /*
     * Mobile Malaysia:
     * 601xxxxxxxx / 601xxxxxxxxx
     */
    return /^601\d{8,9}$/.test(phone)
}

export function formatMalaysiaPhoneForDisplay(
    value: string,
): string {
    const normalized =
        normalizeMalaysiaPhone(value)

    if (!isValidMalaysiaPhone(normalized)) {
        return value
    }

    return `+${normalized}`
}