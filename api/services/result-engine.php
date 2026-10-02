<?php

function evaluateAssessmentResult(
    PDO $pdo,
    string $assessmentCode,
    int $assessmentId,
    int $ageGroupId,
    int $ageMonths,
    array $answers
): array {

    /*
    |--------------------------------------------------------------------------
    | Load question + domain metadata
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            q.id AS question_id,
            q.question_ms,
            q.question_en,
            q.is_starred,

            d.id AS domain_id,
            d.code AS domain_code,
            d.name_ms AS domain_name_ms,
            d.name_en AS domain_name_en,
            d.sort_order AS domain_sort_order,

            q.sort_order AS question_sort_order

        FROM questions q

        JOIN domains d
            ON d.id = q.domain_id

        WHERE q.assessment_type_id = ?
          AND q.age_group_id = ?
          AND q.is_active = 1
          AND d.is_active = 1

        ORDER BY
            d.sort_order ASC,
            q.sort_order ASC
    ");

    $stmt->execute([
        $assessmentId,
        $ageGroupId,
    ]);

    $questions = $stmt->fetchAll();

    /*
    |--------------------------------------------------------------------------
    | Domain summary
    |--------------------------------------------------------------------------
    */

    $domains = [];

    $negativeItems = [];

    $totalPositive = 0;
    $totalNegative = 0;
    $starredNegativeCount = 0;

    foreach ($questions as $question) {
        $questionId =
            (int) $question['question_id'];

        $domainId =
            (int) $question['domain_id'];

        $answer =
            isset($answers[$questionId])
            ? (int) $answers[$questionId]
            : null;

        if (!isset($domains[$domainId])) {
            $domains[$domainId] = [
                'id' => $domainId,

                'code' =>
                $question['domain_code'],

                'name_ms' =>
                $question['domain_name_ms'],

                'name_en' =>
                $question['domain_name_en'],

                'total' => 0,
                'positive' => 0,
                'negative' => 0,
            ];
        }

        $domains[$domainId]['total']++;

        if ($answer === 1) {
            $domains[$domainId]['positive']++;
            $totalPositive++;

            continue;
        }

        if ($answer === 0) {
            $domains[$domainId]['negative']++;
            $totalNegative++;

            $isStarred =
                (bool) $question['is_starred'];

            if ($isStarred) {
                $starredNegativeCount++;
            }

            $negativeItems[] = [
                'question_id' =>
                $questionId,

                'domain_code' =>
                $question['domain_code'],

                'domain_name_ms' =>
                $question['domain_name_ms'],

                'question_ms' =>
                $question['question_ms'],

                'question_en' =>
                $question['question_en'],

                'is_starred' =>
                $isStarred,
            ];
        }
    }

    $domainResults =
        array_values($domains);

    /*
    |--------------------------------------------------------------------------
    | Parental Checklist
    |--------------------------------------------------------------------------
    |
    | PC remains descriptive.
    | No pass/fail.
    | No diagnostic interpretation.
    |--------------------------------------------------------------------------
    */

    if ($assessmentCode === 'PC') {
        return [
            'status' => 'DESCRIPTIVE',

            'engine_version' =>
            'kizzu-pc-v1',

            'data' => [
                'assessment_code' => 'PC',

                'age_months' =>
                $ageMonths,

                'total_questions' =>
                count($questions),

                'total_observed' =>
                $totalPositive,

                'total_not_yet' =>
                $totalNegative,

                'domains' =>
                $domainResults,

                'not_yet_items' =>
                $negativeItems,

                'interpretation_type' =>
                'descriptive',

                'disclaimer' =>
                'Checklist ini memberi ringkasan pemerhatian perkembangan dan bukan diagnosis atau pengganti penilaian profesional.',
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | SPK
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | This is a Kizzu internal rule set.
    |
    | The supplied SPK contains additional / adapted items compared with
    | the official KPM SSP instrument, therefore this must NOT be presented
    | as an official KPM result.
    |--------------------------------------------------------------------------
    */

    if ($assessmentCode === 'SPK') {

        $status = null;
        $reassessmentMonths = null;

        /*
        |--------------------------------------------------------------------------
        | All achieved
        |--------------------------------------------------------------------------
        */

        if ($totalNegative === 0) {
            $status = 'ON_TRACK';
        }

        /*
        |--------------------------------------------------------------------------
        | Important/starred item not achieved
        |--------------------------------------------------------------------------
        */ elseif ($starredNegativeCount >= 1) {
            $status =
                'REFER_FOR_FURTHER_ASSESSMENT';
        }

        /*
        |--------------------------------------------------------------------------
        | Two or more not achieved
        |--------------------------------------------------------------------------
        */ elseif ($totalNegative >= 2) {
            $status =
                'REFER_FOR_FURTHER_ASSESSMENT';
        }

        /*
        |--------------------------------------------------------------------------
        | One ordinary item not achieved
        |--------------------------------------------------------------------------
        */ else {
            $status =
                'MONITOR_REASSESS';

            $reassessmentMonths =
                $ageMonths < 24
                ? 2
                : 3;
        }

        return [
            'status' =>
            $status,

            'engine_version' =>
            'kizzu-spk-v1',

            'data' => [
                'assessment_code' =>
                'SPK',

                'age_months' =>
                $ageMonths,

                'total_questions' =>
                count($questions),

                'total_achieved' =>
                $totalPositive,

                'total_not_achieved' =>
                $totalNegative,

                'starred_not_achieved_count' =>
                $starredNegativeCount,

                'reassessment_months' =>
                $reassessmentMonths,

                'domains' =>
                $domainResults,

                'not_achieved_items' =>
                $negativeItems,

                'interpretation_type' =>
                'kizzu_internal_guidance',

                'disclaimer' =>
                'Keputusan ini ialah panduan awal berdasarkan jawapan yang diberikan dan bukan diagnosis. Dapatkan penilaian profesional jika terdapat kebimbangan terhadap perkembangan anak.',
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Unknown assessment
    |--------------------------------------------------------------------------
    */

    throw new RuntimeException(
        'Unsupported assessment type.'
    );
}
