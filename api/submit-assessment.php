<?php

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/result-engine.php';

header(
    'Content-Type: application/json; charset=utf-8'
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed',
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Read JSON
|--------------------------------------------------------------------------
*/

$input = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($input)) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' =>
        'Invalid JSON payload',
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Input
|--------------------------------------------------------------------------
*/

$assessmentCode = strtoupper(
    trim(
        $input['assessment_code']
            ?? ''
    )
);

$ageMonths =
    isset($input['age_months'])
    ? (int) $input['age_months']
    : null;

$childName =
    trim(
        $input['child_name']
            ?? ''
    );

$childDob =
    trim(
        $input['child_dob']
            ?? ''
    );

$parentName =
    trim(
        $input['parent_name']
            ?? ''
    );

$phone =
    trim(
        $input['phone']
            ?? ''
    );

$email =
    trim(
        $input['email']
            ?? ''
    );

$location =
    trim(
        $input['location']
            ?? ''
    );

$consent =
    $input['consent']
    ?? false;

$answers =
    $input['answers']
    ?? [];

/*
|--------------------------------------------------------------------------
| Normalize Parent / Child Details
|--------------------------------------------------------------------------
*/

$childName =
    titleCaseName(
        $childName
    );

$parentName =
    titleCaseName(
        $parentName
    );

$email =
    strtolower(
        trim($email)
    );

$phone =
    normalizeMalaysiaPhone(
        $phone
    );

$allowedLocations = [
    'Kuala Lumpur',
    'Cheras',
    'Ampang',
    'Setapak',
    'Wangsa Maju',
    'Kepong',
    'Sentul',
    'Bangsar',
    'Mont Kiara',
    'Sri Hartamas',
    'Petaling Jaya',
    'Shah Alam',
    'Subang Jaya',
    'Puchong',
    'Klang',
    'Kajang',
    'Bangi',
    'Seri Kembangan',
    'Cyberjaya',
    'Putrajaya',
    'Selayang',
    'Rawang',
    'Selangor (Luar Lembah Klang)',
    'Johor',
    'Kedah',
    'Kelantan',
    'Melaka',
    'Negeri Sembilan',
    'Pahang',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Terengganu',
    'Wilayah Persekutuan Labuan',
];

/*
|--------------------------------------------------------------------------
| Basic Validation
|--------------------------------------------------------------------------
*/

if (
    !$assessmentCode ||
    $ageMonths === null ||
    !$childName ||
    !$childDob ||
    !$parentName ||
    !$phone ||
    !$email ||
    ($assessmentCode !== 'PC' && !$location)
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,

        'message' =>
        'Maklumat submission tidak lengkap.',
    ]);

    exit;
}

if (
    !filter_var(
        $email,
        FILTER_VALIDATE_EMAIL
    )
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,

        'message' =>
        'Alamat email tidak sah.',
    ]);

    exit;
}

if (
    !preg_match(
        '/^601\d{8,9}$/',
        $phone
    )
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' =>
        'No. telefon tidak sah.',
    ]);

    exit;
}

if (
    ($assessmentCode !== 'PC' || $location !== '') &&
    !in_array(
        $location,
        $allowedLocations,
        true
    )
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' =>
        'Lokasi tidak sah.',
    ]);

    exit;
}

if ($assessmentCode !== 'PC' && $consent !== true) {
    http_response_code(422);

    echo json_encode([
        'success' => false,

        'message' =>
        'Persetujuan diperlukan sebelum submission.',
    ]);

    exit;
}

if (
    !is_array($answers) ||
    count($answers) === 0
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,

        'message' =>
        'Jawapan assessment tidak ditemui.',
    ]);

    exit;
}

try {

    /*
    |--------------------------------------------------------------------------
    | Assessment Type
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            code,
            name

        FROM assessment_types

        WHERE code = ?
          AND is_active = 1

        LIMIT 1
    ");

    $stmt->execute([
        $assessmentCode
    ]);

    $assessment =
        $stmt->fetch();

    if (!$assessment) {
        http_response_code(404);

        echo json_encode([
            'success' => false,

            'message' =>
            'Assessment tidak ditemui.',
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Age Group
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            id,
            label,
            min_month,
            max_month

        FROM age_groups

        WHERE assessment_type_id = ?
          AND ? BETWEEN
              min_month
              AND max_month
          AND is_active = 1

        LIMIT 1
    ");

    $stmt->execute([
        $assessment['id'],
        $ageMonths,
    ]);

    $ageGroup =
        $stmt->fetch();

    if (!$ageGroup) {
        http_response_code(422);

        echo json_encode([
            'success' => false,

            'message' =>
            'Tiada kumpulan umur yang sesuai.',
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Expected Question IDs
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT id

        FROM questions

        WHERE assessment_type_id = ?
          AND age_group_id = ?
          AND is_active = 1

        ORDER BY id
    ");

    $stmt->execute([
        $assessment['id'],
        $ageGroup['id'],
    ]);

    $questionIds =
        array_map(
            'intval',
            $stmt->fetchAll(
                PDO::FETCH_COLUMN
            )
        );

    /*
    |--------------------------------------------------------------------------
    | Normalize Submitted Answers
    |--------------------------------------------------------------------------
    */

    $normalizedAnswers = [];

    foreach ($answers as $answer) {

        if (
            !isset(
                $answer['question_id']
            ) ||
            !array_key_exists(
                'answer_value',
                $answer
            )
        ) {
            http_response_code(422);

            echo json_encode([
                'success' => false,

                'message' =>
                'Format jawapan tidak sah.',
            ]);

            exit;
        }

        $questionId =
            (int)
            $answer['question_id'];

        if (
            isset(
                $normalizedAnswers[$questionId]
            )
        ) {
            http_response_code(422);

            echo json_encode([
                'success' => false,

                'message' =>
                'Terdapat jawapan soalan yang berulang.',
            ]);

            exit;
        }

        $value =
            $answer['answer_value'];

        if (
            $value !== true &&
            $value !== false &&
            $value !== 1 &&
            $value !== 0
        ) {
            http_response_code(422);

            echo json_encode([
                'success' => false,

                'message' =>
                'Nilai jawapan tidak sah.',
            ]);

            exit;
        }

        $normalizedAnswers[$questionId] =
            filter_var(
                $value,
                FILTER_VALIDATE_BOOLEAN
            )
            ? 1
            : 0;
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Question Set
    |--------------------------------------------------------------------------
    */

    $submittedQuestionIds =
        array_keys(
            $normalizedAnswers
        );

    sort(
        $submittedQuestionIds
    );

    sort(
        $questionIds
    );

    if (
        $submittedQuestionIds
        !== $questionIds
    ) {
        http_response_code(422);

        echo json_encode([
            'success' => false,

            'message' =>
            'Jawapan tidak lengkap atau tidak sepadan dengan assessment.',
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate Result
    |--------------------------------------------------------------------------
    |
    | Evaluation happens on server.
    | Frontend cannot decide the result.
    |--------------------------------------------------------------------------
    */

    $evaluation =
        evaluateAssessmentResult(
            $pdo,
            $assessmentCode,
            (int) $assessment['id'],
            (int) $ageGroup['id'],
            $ageMonths,
            $normalizedAnswers
        );

    /*
    |--------------------------------------------------------------------------
    | Start Transaction
    |--------------------------------------------------------------------------
    */

    $pdo->beginTransaction();

    $referenceCode =
        bin2hex(
            random_bytes(16)
        );

    /*
    |--------------------------------------------------------------------------
    | Submission
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        INSERT INTO submissions
        (
            reference_code,

            assessment_type_id,
            age_group_id,

            age_months,

            child_name,
            child_dob,

            parent_name,
            phone,
            email,
            location,

            consent_at,

            status,

            result_status,
            result_engine_version,
            result_data,
            evaluated_at
        )
        VALUES
        (
            ?,

            ?,
            ?,

            ?,

            ?,
            ?,

            ?,
            ?,
            ?,
            ?,

            CASE WHEN ? = 1 THEN NOW() ELSE NULL END,

            'completed',

            ?,
            ?,
            ?,
            NOW()
        )
    ");

    $resultJson =
        json_encode(
            $evaluation['data'],
            JSON_UNESCAPED_UNICODE
                |
                JSON_UNESCAPED_SLASHES
        );

    if ($resultJson === false) {
        throw new RuntimeException(
            'Unable to encode result data.'
        );
    }

    $stmt->execute([
        $referenceCode,

        $assessment['id'],
        $ageGroup['id'],

        $ageMonths,

        $childName,
        $childDob,

        $parentName,
        $phone,
        $email,
        $location,

        $consent === true ? 1 : 0,

        $evaluation['status'],
        $evaluation['engine_version'],
        $resultJson,
    ]);

    $submissionId =
        (int)
        $pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | Answers
    |--------------------------------------------------------------------------
    */

    $answerStmt =
        $pdo->prepare("
            INSERT INTO submission_answers
            (
                submission_id,
                question_id,
                answer_value
            )
            VALUES
            (
                ?,
                ?,
                ?
            )
        ");

    foreach (
        $normalizedAnswers
        as
        $questionId =>
        $answerValue
    ) {
        $answerStmt->execute([
            $submissionId,
            $questionId,
            $answerValue,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    http_response_code(201);

    echo json_encode(
        [
            'success' => true,

            'data' => [
                'reference_code' =>
                $referenceCode,

                'submission_id' =>
                $submissionId,

                'assessment_code' =>
                $assessmentCode,

                'age_group' =>
                $ageGroup['label'],

                'total_answers' =>
                count(
                    $normalizedAnswers
                ),

                'result_status' =>
                $evaluation['status'],
            ],
        ],
        JSON_UNESCAPED_UNICODE
            |
            JSON_UNESCAPED_SLASHES
    );
} catch (Throwable $e) {

    if (
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    error_log(
        'Assessment submission error: '
            .
            $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,

        'message' =>
        'Submission tidak dapat disimpan. Sila cuba semula.',
    ]);
}

function titleCaseName(
    string $value
): string {
    $value = preg_replace(
        '/\s+/',
        ' ',
        trim($value)
    );

    return mb_convert_case(
        $value,
        MB_CASE_TITLE,
        'UTF-8'
    );
}

function normalizeMalaysiaPhone(
    string $value
): string {
    $phone = preg_replace(
        '/\D+/',
        '',
        $value
    );

    if ($phone === '') {
        return '';
    }

    if (
        str_starts_with(
            $phone,
            '60'
        )
    ) {
        return $phone;
    }

    if (
        str_starts_with(
            $phone,
            '0'
        )
    ) {
        $phone =
            substr(
                $phone,
                1
            );
    }

    return '60' . $phone;
}

