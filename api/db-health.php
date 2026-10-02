<?php

require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

$stmt = $pdo->query('SELECT DATABASE() AS database_name, NOW() AS server_time');
$result = $stmt->fetch();

echo json_encode([
    'success' => true,
    'message' => 'Database connection is working',
    'database' => $result['database_name'],
    'server_time' => $result['server_time'],
]);
