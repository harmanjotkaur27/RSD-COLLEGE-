<?php
/**
 * RSD College Ferozpur - Get Students for Attendance
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_config.php';

$course_code = isset($_GET['course']) ? $_GET['course'] : '';
$semester = isset($_GET['semester']) ? $_GET['semester'] : '';

if (!empty($course_code) && !empty($semester)) {
    try {
        $query = "SELECT s.student_id, s.roll_no, u.full_name 
                  FROM students s 
                  JOIN users u ON s.user_id = u.user_id 
                  JOIN courses c ON s.course_id = c.course_id 
                  WHERE c.course_code = :course AND s.semester = :sem 
                  ORDER BY s.roll_no ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":course", $course_code);
        $stmt->bindParam(":sem", $semester);
        $stmt->execute();
        
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "students" => $students]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Course and Semester are required"]);
}
?>
