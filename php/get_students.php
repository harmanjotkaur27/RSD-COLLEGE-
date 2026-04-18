<?php
/**
 * RSD College Ferozpur - Get Students for Attendance
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_config.php';

$course_code = isset($_GET['course']) ? trim($_GET['course']) : '';
$semester = isset($_GET['semester']) ? trim($_GET['semester']) : '';
$date = isset($_GET['date']) ? trim($_GET['date']) : '';

if (!empty($course_code) && !empty($semester)) {
    try {
        if (!empty($date)) {
            $query = "SELECT s.student_id, s.roll_no, u.full_name, a.status AS attendance_status 
                      FROM students s 
                      JOIN users u ON s.user_id = u.user_id 
                      JOIN courses c ON s.course_id = c.course_id 
                      LEFT JOIN attendance a ON a.student_id = s.student_id AND a.course_id = c.course_id AND a.date = :date ";
        } else {
            $query = "SELECT s.student_id, s.roll_no, u.full_name, NULL AS attendance_status 
                      FROM students s 
                      JOIN users u ON s.user_id = u.user_id 
                      JOIN courses c ON s.course_id = c.course_id ";
        }

        $query .= "WHERE c.course_code = :course AND s.semester = :sem 
                   ORDER BY s.roll_no ASC";
        
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":course", $course_code);
        $stmt->bindParam(":sem", $semester);
        if (!empty($date)) {
            $stmt->bindParam(":date", $date);
        }
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
