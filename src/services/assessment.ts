import type {
    AssessmentAnswers,
    AssessmentData,
    AssessmentResponse,
    AssessmentResult,
    AssessmentResultResponse,
    AssessmentType,
    AssessmentTypesResponse,
    ParentChildDetails,
} from "@/types/assessment"

/*
|--------------------------------------------------------------------------
| Assessment Types
|--------------------------------------------------------------------------
*/

export async function getAssessmentTypes(): Promise<
    AssessmentType[]
> {
    const response = await fetch(
        "/api/assessment-types.php",
    )

    if (!response.ok) {
        throw new Error(
            "Failed to load assessment types",
        )
    }

    const result: AssessmentTypesResponse =
        await response.json()

    if (!result.success) {
        throw new Error(
            "Unable to load assessment types",
        )
    }

    return result.data
}

/*
|--------------------------------------------------------------------------
| Assessment Questions
|--------------------------------------------------------------------------
*/

export async function getAssessment(
    type: string,
    ageMonths: number,
): Promise<AssessmentData> {
    const params = new URLSearchParams({
        type,
        age_months: String(ageMonths),
    })

    const response = await fetch(
        `/api/assessment.php?${params.toString()}`,
    )

    const result = await response.json()

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ??
            "Assessment tidak tersedia untuk umur ini",
        )
    }

    const typedResult =
        result as AssessmentResponse

    return typedResult.data
}

/*
|--------------------------------------------------------------------------
| Submit Assessment
|--------------------------------------------------------------------------
*/

export type SubmitAssessmentResult = {
    reference_code: string
    submission_id: number
    assessment_code: string
    age_group: string
    total_answers: number
    result_status: string
}

export async function submitAssessment(
    assessmentCode: string,
    ageMonths: number,
    details: ParentChildDetails,
    answers: AssessmentAnswers,
): Promise<SubmitAssessmentResult> {
    const answerList = Object.entries(
        answers,
    ).map(([questionId, value]) => ({
        question_id: Number(questionId),
        answer_value: value,
    }))

    const response = await fetch(
        "/api/submit-assessment.php",
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",
            },

            body: JSON.stringify({
                assessment_code:
                    assessmentCode,

                age_months:
                    ageMonths,

                child_name:
                    details.childName,

                child_dob:
                    details.childDob,

                parent_name:
                    details.parentName,

                phone:
                    details.phone,

                email:
                    details.email,

                location:
                    details.location,

                consent: true,

                answers:
                    answerList,
            }),
        },
    )

    const result =
        await response.json()

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ??
            "Submission tidak dapat disimpan.",
        )
    }

    return result.data
}

/*
|--------------------------------------------------------------------------
| Result
|--------------------------------------------------------------------------
*/

export async function getResult(
    referenceCode: string,
): Promise<AssessmentResult> {
    const params = new URLSearchParams({
        ref: referenceCode,
    })

    const response = await fetch(
        `/api/result.php?${params.toString()}`,
    )

    const result =
        await response.json()

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ??
            "Keputusan tidak dapat dimuatkan.",
        )
    }

    const typedResult =
        result as AssessmentResultResponse

    return typedResult.data
}