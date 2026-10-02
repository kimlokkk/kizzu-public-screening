<?php

require_once __DIR__ . '/config/app.php';

header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'Kizzu Screening API is running',
    'timestamp' => date('c')
]);
