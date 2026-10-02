export function calculateAgeInMonths(dateOfBirth: string): number {
    const birthDate = new Date(`${dateOfBirth}T00:00:00`)
    const today = new Date()

    let months =
        (today.getFullYear() - birthDate.getFullYear()) * 12 +
        (today.getMonth() - birthDate.getMonth())

    if (today.getDate() < birthDate.getDate()) {
        months--
    }

    return Math.max(months, 0)
}

export function formatAge(ageMonths: number): string {
    const years = Math.floor(ageMonths / 12)
    const months = ageMonths % 12

    if (years === 0) {
        return `${months} bulan`
    }

    if (months === 0) {
        return `${years} tahun`
    }

    return `${years} tahun ${months} bulan`
}