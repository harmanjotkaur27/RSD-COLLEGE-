<?php
/**
 * RSD College Ferozpur - Database Configuration
 */
$host = "localhost";
$db_name = "rsd_college_db";
$username = "root";
$password = ""; // Default XAMPP password is empty

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]));
}
?>
