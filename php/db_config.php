<?php
/**
 * RSD College Ferozpur - SQLite Database Configuration
 */
$databasePath = __DIR__ . '/rsd_college_new.db';

try {
    $conn = new PDO("sqlite:$databasePath");
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec('PRAGMA foreign_keys = ON;');
} catch (PDOException $e) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]));
}
?>
