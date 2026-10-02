<?php

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

$stmt = $pdo->query("
    SELECT
        id,
        code,
        name,
        description
    FROM assessment_types
    WHERE is_active = 1
    ORDER BY id ASC
");

$assessments = $stmt->fetchAll();

echo json_encode([
    'success' => true,
    'data' => $assessments,
]);
