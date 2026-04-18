<?php
/**
 * RSD College Ferozpur - Get Attendance History for Student
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_config.php';

$student_id = isset($_GET['student_id']) ? $_GET['student_id'] : '';

if (!empty($student_id)) {
    try {
        $query = "SELECT a.date, a.status, c.course_code as course, s.semester, u.full_name as markedBy 
                  FROM attendance a 
                  JOIN courses c ON a.course_id = c.course_id 
                  JOIN students s ON a.student_id = s.student_id 
                  LEFT JOIN users u ON a.marked_by = u.user_id 
                  WHERE a.student_id = :sid 
                  ORDER BY a.date DESC";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":sid", $student_id);
        $stmt->execute();
        
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "history" => $history]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Student ID is required"]);
}
?>
