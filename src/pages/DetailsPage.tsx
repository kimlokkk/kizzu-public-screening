import {
    ArrowLeft,
    ArrowRight,
} from "lucide-react"

import {
    useState,
} from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import ScreeningShell from "@/components/screening/ScreeningShell"
import { useLanguage } from "@/context/LanguageContext"

import {
    KLANG_VALLEY_LOCATIONS,
    OTHER_STATES,
} from "@/data/locations"

import {
    calculateAgeInMonths,
    formatAge,
} from "@/utils/age"

import {
    formatMalaysiaPhoneForDisplay,
    isValidEmail,
    isValidMalaysiaPhone,
    normalizeEmail,
    normalizeMalaysiaPhone,
    toTitleCase,
} from "@/utils/form"

import type {
    AssessmentType,
    ParentChildDetails,
} from "@/types/assessment"

type DetailsPageProps = {
    assessment: AssessmentType

    onBack: () => void

    onContinue: (
        details: ParentChildDetails,
        ageMonths: number,
    ) => Promise<void>
}

type FieldErrors = Partial<
    Record<
        keyof ParentChildDetails,
        string
    >
>

export default function DetailsPage({
    assessment,
    onBack,
    onContinue,
}: DetailsPageProps) {
    const {
        language,
        tr,
    } = useLanguage()

    const [form, setForm] =
        useState<ParentChildDetails>({
            childName: "",
            childDob: "",
            parentName: "",
            phone: "",
            email: "",
            location: "",
        })

    const [consent, setConsent] =
        useState(false)

    const [
        outsideKlangValley,
        setOutsideKlangValley,
    ] =
        useState(false)

    const [
        fieldErrors,
        setFieldErrors,
    ] = useState<FieldErrors>({})

    const [
        generalError,
        setGeneralError,
    ] =
        useState<string | null>(null)

    const [loading, setLoading] =
        useState(false)

    const ageMonths =
        form.childDob
            ? calculateAgeInMonths(
                form.childDob,
            )
            : null

    function updateField(
        field:
            keyof ParentChildDetails,
        value: string,
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }))

        setFieldErrors(
            (current) => ({
                ...current,
                [field]: undefined,
            }),
        )

        setGeneralError(null)
    }

    /*
    |--------------------------------------------------------------------------
    | Field Normalization
    |--------------------------------------------------------------------------
    */

    function normalizeNameField(
        field:
            | "childName"
            | "parentName",
    ) {
        updateField(
            field,
            toTitleCase(
                form[field],
            ),
        )
    }

    function normalizeEmailField() {
        updateField(
            "email",
            normalizeEmail(
                form.email,
            ),
        )
    }

    function normalizePhoneField() {
        if (!form.phone.trim()) {
            return
        }

        updateField(
            "phone",
            formatMalaysiaPhoneForDisplay(
                form.phone,
            ),
        )
    }

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    function validateForm(
        values: ParentChildDetails,
    ): FieldErrors {
        const errors: FieldErrors = {}

        if (!values.childName.trim()) {
            errors.childName =
                tr("Nama anak diperlukan.", "Child\'s name is required.")
        }

        if (!values.childDob) {
            errors.childDob =
                tr("Tarikh lahir diperlukan.", "Date of birth is required.")
        }

        if (!values.parentName.trim()) {
            errors.parentName =
                tr("Nama ibu bapa / penjaga diperlukan.", "Parent / guardian name is required.")
        }

        if (!values.phone.trim()) {
            errors.phone =
                tr("No. telefon diperlukan.", "Phone number is required.")
        } else if (
            !isValidMalaysiaPhone(
                values.phone,
            )
        ) {
            errors.phone =
                tr("Masukkan no. telefon Malaysia yang sah.", "Enter a valid Malaysian phone number.")
        }

        if (!values.email.trim()) {
            errors.email =
                tr("Email diperlukan.", "Email is required.")
        } else if (
            !isValidEmail(
                values.email,
            )
        ) {
            errors.email =
                tr("Format email tidak sah.", "Invalid email format.")
        }

        if (!values.location) {
            errors.location =
                tr("Sila pilih lokasi.", "Please select a location.")
        }

        return errors
    }

    async function handleSubmit() {
        setGeneralError(null)

        const normalizedForm: ParentChildDetails =
        {
            ...form,

            childName:
                toTitleCase(
                    form.childName,
                ),

            parentName:
                toTitleCase(
                    form.parentName,
                ),

            email:
                normalizeEmail(
                    form.email,
                ),

            phone:
                normalizeMalaysiaPhone(
                    form.phone,
                ),
        }

        setForm({
            ...normalizedForm,

            phone:
                normalizedForm.phone
                    ? `+${normalizedForm.phone}`
                    : "",
        })

        const errors =
            validateForm(
                normalizedForm,
            )

        setFieldErrors(errors)

        if (
            Object.keys(errors).length >
            0
        ) {
            setGeneralError(
                tr("Sila semak maklumat yang ditandakan.", "Please check the highlighted information."),
            )

            return
        }

        if (ageMonths === null) {
            setFieldErrors(
                (current) => ({
                    ...current,

                    childDob:
                        tr("Tarikh lahir tidak sah.", "Invalid date of birth."),
                }),
            )

            return
        }

        if (!consent) {
            setGeneralError(
                tr("Sila beri persetujuan sebelum meneruskan.", "Please provide consent before continuing."),
            )

            return
        }

        try {
            setLoading(true)

            await onContinue(
                normalizedForm,
                ageMonths,
            )

        } catch (error) {
            setGeneralError(
                error instanceof Error
                    ? error.message
                    : tr("Tidak dapat memuatkan assessment.", "Unable to load the assessment."),
            )

        } finally {
            setLoading(false)
        }
    }

    return (
        <ScreeningShell
            step="02"
            label={tr("Maklumat", "Details")}
            maxWidth="medium"
        >
            <div className="py-10 md:py-14">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
                >
                    <ArrowLeft className="size-4" />

                    {tr("Kembali", "Back")}
                </button>

                <div className="mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">
                        {assessment.code === "SPK"
                            ? tr("Saringan Perkembangan", "Developmental Screening")
                            : "Parental Checklist"}
                    </p>

                    <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] md:text-5xl">
                        {tr("Maklumat anak", "Child details")}
                    </h1>

                    <p className="mt-3 max-w-xl leading-7 text-slate-500">
                        {tr(
                            "Umur anak akan ditentukan secara automatik daripada tarikh lahir.",
                            "Your child's age will be calculated automatically from the date of birth.",
                        )}
                    </p>
                </div>

                {/* Child */}

                <section>
                    <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 pb-3">
                        <h2 className="font-bold">
                            {tr("Anak", "Child")}
                        </h2>

                        <span className="text-xs text-slate-400">
                            01
                        </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="childName">
                                {tr("Nama anak", "Child\'s name")}
                            </Label>

                            <Input
                                id="childName"
                                autoComplete="name"
                                value={form.childName}
                                onChange={(event) =>
                                    updateField(
                                        "childName",
                                        event.target.value,
                                    )
                                }
                                onBlur={() =>
                                    normalizeNameField(
                                        "childName",
                                    )
                                }
                                placeholder={tr("Nama anak", "Child\'s name")}
                                className={
                                    fieldErrors.childName
                                        ? "h-12 rounded-xl border-red-400"
                                        : "h-12 rounded-xl"
                                }
                            />

                            {fieldErrors.childName && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.childName
                                    }
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="childDob">
                                {tr("Tarikh lahir", "Date of birth")}
                            </Label>

                            <Input
                                id="childDob"
                                type="date"
                                value={form.childDob}
                                onChange={(event) =>
                                    updateField(
                                        "childDob",
                                        event.target.value,
                                    )
                                }
                                className={
                                    fieldErrors.childDob
                                        ? "h-12 rounded-xl border-red-400"
                                        : "h-12 rounded-xl"
                                }
                            />

                            {fieldErrors.childDob && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.childDob
                                    }
                                </p>
                            )}

                            {ageMonths !== null && (
                                <p className="pt-1 text-sm font-semibold text-sky-600">
                                    {language === "ms"
                                        ? formatAge(ageMonths)
                                        : `${Math.floor(ageMonths / 12)} ${Math.floor(ageMonths / 12) === 1 ? "year" : "years"}${ageMonths % 12 ? ` ${ageMonths % 12} ${ageMonths % 12 === 1 ? "month" : "months"}` : ""}`}
                                    {" · "}
                                    {ageMonths} {tr("bulan", "months")}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Parent */}

                <section className="mt-12">
                    <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 pb-3">
                        <h2 className="font-bold">
                            {tr("Ibu bapa / penjaga", "Parent / guardian")}
                        </h2>

                        <span className="text-xs text-slate-400">
                            02
                        </span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="parentName">
                                {tr("Nama", "Name")}
                            </Label>

                            <Input
                                id="parentName"
                                autoComplete="name"
                                value={form.parentName}
                                onChange={(event) =>
                                    updateField(
                                        "parentName",
                                        event.target.value,
                                    )
                                }
                                onBlur={() =>
                                    normalizeNameField(
                                        "parentName",
                                    )
                                }
                                placeholder={tr("Nama ibu bapa / penjaga", "Parent / guardian name")}
                                className={
                                    fieldErrors.parentName
                                        ? "h-12 rounded-xl border-red-400"
                                        : "h-12 rounded-xl"
                                }
                            />

                            {fieldErrors.parentName && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.parentName
                                    }
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">
                                {tr("No. telefon", "Phone number")}
                            </Label>

                            <Input
                                id="phone"
                                type="tel"
                                inputMode="tel"
                                autoComplete="tel"
                                value={form.phone}
                                onChange={(event) =>
                                    updateField(
                                        "phone",
                                        event.target.value,
                                    )
                                }
                                onBlur={
                                    normalizePhoneField
                                }
                                placeholder="0123456789"
                                className={
                                    fieldErrors.phone
                                        ? "h-12 rounded-xl border-red-400"
                                        : "h-12 rounded-xl"
                                }
                            />

                            {fieldErrors.phone && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.phone
                                    }
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                value={form.email}
                                onChange={(event) =>
                                    updateField(
                                        "email",
                                        event.target.value,
                                    )
                                }
                                onBlur={
                                    normalizeEmailField
                                }
                                placeholder="nama@email.com"
                                className={
                                    fieldErrors.email
                                        ? "h-12 rounded-xl border-red-400"
                                        : "h-12 rounded-xl"
                                }
                            />

                            {fieldErrors.email && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.email
                                    }
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="location">
                                {tr("Kawasan", "Area")}
                            </Label>

                            <select
                                id="location"
                                value={
                                    outsideKlangValley
                                        ? "__OTHER__"
                                        : form.location
                                }
                                onChange={(event) => {
                                    const value =
                                        event.target.value

                                    if (
                                        value === "__OTHER__"
                                    ) {
                                        setOutsideKlangValley(
                                            true,
                                        )

                                        updateField(
                                            "location",
                                            "",
                                        )

                                        return
                                    }

                                    setOutsideKlangValley(
                                        false,
                                    )

                                    updateField(
                                        "location",
                                        value,
                                    )
                                }}
                                className={`flex h-12 w-full appearance-none rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${fieldErrors.location
                                    ? "border-red-400"
                                    : "border-slate-200"
                                    }`}
                            >
                                <option value="">
                                    {tr("Pilih kawasan", "Select area")}
                                </option>

                                <optgroup label={tr("KL & Lembah Klang", "KL & Klang Valley")}>
                                    {KLANG_VALLEY_LOCATIONS.map(
                                        (location) => (
                                            <option
                                                key={location}
                                                value={location}
                                            >
                                                {location}
                                            </option>
                                        ),
                                    )}
                                </optgroup>

                                <option value="__OTHER__">
                                    {tr("Luar KL / Lembah Klang", "Outside KL / Klang Valley")}
                                </option>
                            </select>

                            {outsideKlangValley && (
                                <select
                                    aria-label={tr("Pilih negeri", "Select state")}
                                    value={form.location}
                                    onChange={(event) =>
                                        updateField(
                                            "location",
                                            event.target.value,
                                        )
                                    }
                                    className={`mt-3 flex h-12 w-full appearance-none rounded-xl border bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 ${fieldErrors.location
                                        ? "border-red-400"
                                        : "border-slate-200"
                                        }`}
                                >
                                    <option value="">
                                        {tr("Pilih negeri", "Select state")}
                                    </option>

                                    {OTHER_STATES.map(
                                        (state) => (
                                            <option
                                                key={state}
                                                value={state}
                                            >
                                                {state}
                                            </option>
                                        ),
                                    )}
                                </select>
                            )}

                            {fieldErrors.location && (
                                <p className="text-xs font-medium text-red-600">
                                    {
                                        fieldErrors.location
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Consent */}

                <div className="mt-10 flex gap-3 border-t border-slate-100 pt-7">
                    <Checkbox
                        id="consent"
                        checked={consent}
                        onCheckedChange={(value) =>
                            setConsent(
                                value === true,
                            )
                        }
                    />

                    <Label
                        htmlFor="consent"
                        className="max-w-xl cursor-pointer text-sm font-normal leading-6 text-slate-500"
                    >
                        {tr(
                            "Saya bersetuju maklumat ini digunakan untuk menghasilkan keputusan assessment ini.",
                            "I agree that this information may be used to generate the result for this assessment.",
                        )}
                    </Label>
                </div>

                {generalError && (
                    <p className="mt-5 text-sm font-medium text-red-600">
                        {generalError}
                    </p>
                )}

                <div className="mt-10 flex justify-end">
                    <Button
                        size="lg"
                        disabled={loading}
                        onClick={() => {
                            void handleSubmit()
                        }}
                        className="h-12 rounded-full px-7"
                    >
                        {loading
                            ? tr("Memuatkan...", "Loading...")
                            : tr("Teruskan", "Continue")}

                        {!loading && (
                            <ArrowRight className="size-4" />
                        )}
                    </Button>
                </div>
            </div>
        </ScreeningShell>
    )
}