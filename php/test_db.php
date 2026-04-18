<?php
/**
 * RSD College Ferozpur - SQLite DB Test Endpoint
 */
header('Content-Type: application/json; charset=UTF-8');
require_once 'db_config.php';

try {
    $stmt = $conn->query('SELECT COUNT(*) AS count FROM users');
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode([
        'status' => 'success',
        'message' => 'SQLite connection works',
        'users' => intval($row['count'])
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>