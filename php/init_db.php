<?php
/**
 * RSD College Ferozpur - Initialize SQLite Database
 */
header('Content-Type: application/json; charset=UTF-8');
$databasePath = __DIR__ . '/rsd_college_new.db';
$schemaPath = __DIR__ . '/rsd_college_sqlite.sql';

if (!file_exists($schemaPath)) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Schema file not found.']);
    exit;
}

// Delete existing DB to ensure clean start
if (file_exists($databasePath)) {
    unlink($databasePath);
}

try {
    $conn = new PDO("sqlite:$databasePath");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec('PRAGMA foreign_keys = OFF;');

    $schema = file_get_contents($schemaPath);
    $conn->exec($schema);

    $conn->exec('PRAGMA foreign_keys = ON;');

    echo json_encode(['status' => 'success', 'message' => 'SQLite database initialized at ' . $databasePath]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>