<?php

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json; charset=utf-8');

$type = isset($_GET['type'])
    ? strtoupper(trim($_GET['type']))
    : null;

$ageMonths = isset($_GET['age_months'])
    ? (int) $_GET['age_months']
    : null;

if (!$type || $ageMonths === null) {
    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'type and age_months are required',
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Assessment
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        id,
        code,
        name,
        description
    FROM assessment_types
    WHERE code = ?
      AND is_active = 1
    LIMIT 1
");

$stmt->execute([$type]);

$assessment = $stmt->fetch();

if (!$assessment) {
    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'Assessment not found',
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
      AND ? BETWEEN min_month AND max_month
      AND is_active = 1
    LIMIT 1
");

$stmt->execute([
    $assessment['id'],
    $ageMonths,
]);

$ageGroup = $stmt->fetch();

if (!$ageGroup) {
    http_response_code(404);

    echo json_encode([
        'success' => false,
        'message' => 'No age group available for this age',
    ]);

    exit;
}

/*
|--------------------------------------------------------------------------
| Questions + Domains
|--------------------------------------------------------------------------
*/

$stmt = $pdo->prepare("
    SELECT
        d.id AS domain_id,
        d.code AS domain_code,
        d.name_ms AS domain_name_ms,
        d.name_en AS domain_name_en,
        d.sort_order AS domain_sort_order,

        q.id AS question_id,
        q.subdomain_ms,
        q.subdomain_en,
        q.question_ms,
        q.question_en,
        q.is_starred,
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
    $assessment['id'],
    $ageGroup['id'],
]);

$rows = $stmt->fetchAll();

/*
|--------------------------------------------------------------------------
| Group Questions By Domain
|--------------------------------------------------------------------------
*/

$domains = [];

foreach ($rows as $row) {
    $domainId = $row['domain_id'];

    if (!isset($domains[$domainId])) {
        $domains[$domainId] = [
            'id' => (int) $row['domain_id'],
            'code' => $row['domain_code'],
            'name_ms' => $row['domain_name_ms'],
            'name_en' => $row['domain_name_en'],
            'questions' => [],
        ];
    }

    $domains[$domainId]['questions'][] = [
        'id' => (int) $row['question_id'],
        'subdomain_ms' => $row['subdomain_ms'],
        'subdomain_en' => $row['subdomain_en'],
        'question_ms' => $row['question_ms'],
        'question_en' => $row['question_en'],
        'is_starred' => (bool) $row['is_starred'],
    ];
}

$domains = array_values($domains);

/*
|--------------------------------------------------------------------------
| Response
|--------------------------------------------------------------------------
*/

echo json_encode([
    'success' => true,

    'data' => [
        'assessment' => [
            'id' => (int) $assessment['id'],
            'code' => $assessment['code'],
            'name' => $assessment['name'],
            'description' => $assessment['description'],
        ],

        'age' => [
            'months' => $ageMonths,
            'group' => $ageGroup['label'],
            'min_month' => (int) $ageGroup['min_month'],
            'max_month' => (int) $ageGroup['max_month'],
        ],

        'total_questions' => count($rows),

        'domains' => $domains,
    ],
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
