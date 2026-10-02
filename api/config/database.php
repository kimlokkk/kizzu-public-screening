<?php

require_once __DIR__ . '/app.php';

$host = '127.0.0.1';
$port = '3306';
$dbname = 'kizzu_screening';
$username = 'root';
$password = '';

try {
    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);

    header('Content-Type: application/json');

    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => APP_ENV === 'local'
            ? $e->getMessage()
            : null,
    ]);

    exit;
}
