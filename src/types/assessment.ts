export type AssessmentType = {
    id: number
    code: "PC" | "SPK"
    name: string
    description: string | null
}

export type AssessmentTypesResponse = {
    success: boolean
    data: AssessmentType[]
}

export type ParentChildDetails = {
    childName: string
    childDob: string
    parentName: string
    phone: string
    email: string
    location: string
}

export type AssessmentQuestion = {
    id: number
    subdomain_ms: string | null
    subdomain_en: string | null
    question_ms: string
    question_en: string | null
    is_starred: boolean
}

export type AssessmentDomain = {
    id: number
    code: string
    name_ms: string
    name_en: string | null
    questions: AssessmentQuestion[]
}

export type AssessmentData = {
    assessment: {
        id: number
        code: string
        name: string
        description: string | null
    }

    age: {
        months: number
        group: string
        min_month: number
        max_month: number
    }

    total_questions: number
    domains: AssessmentDomain[]
}

export type AssessmentResponse = {
    success: boolean
    data: AssessmentData
}

export type AssessmentAnswers =
    Record<number, boolean>

/*
|--------------------------------------------------------------------------
| Result
|--------------------------------------------------------------------------
*/

export type ResultDomain = {
    id: number
    code: string
    name_ms: string
    name_en: string | null

    total: number
    positive: number
    negative: number
}

export type ResultWatchItem = {
    question_id: number

    domain_code: string
    domain_name_ms: string

    question_ms: string
    question_en: string | null
}

export type AssessmentResult = {
    reference_code: string

    assessment: {
        code: "PC" | "SPK"
        name: string
    }

    child: {
        name: string
        dob: string
    }

    age: {
        months: number
        group: string
    }

    result: {
        status: string

        title: string
        message: string
        next_action: string

        positive_label: string
        negative_label: string

        total_positive: number
        total_negative: number

        domains: ResultDomain[]

        items_to_watch: ResultWatchItem[]

    }

    recommendations: RecommendationActivity[]

    cta: ResultCta

    disclaimer: string

    evaluated_at: string | null
    created_at: string
}

export type AssessmentResultResponse = {
    success: boolean
    data: AssessmentResult
}

export type RecommendationActivity = {
    id: number
    category: string
    title: string
    instructions: string
    supports: string | null
    safety_note: string | null
}

export type ResultCta = {
    title: string
    description: string
    button_label: string
    whatsapp_message: string
}