<?php
/**
 * RSD College Ferozpur - Get Batch Attendance Records
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_config.php';

$course = isset($_GET['course']) ? trim($_GET['course']) : '';
$semester = isset($_GET['semester']) ? trim($_GET['semester']) : '';
$date = isset($_GET['date']) ? trim($_GET['date']) : '';

try {
    $query = "SELECT a.attendance_id, a.student_id, a.date, a.status, c.course_code AS course, s.semester, s.roll_no, u.full_name AS studentName, mar.full_name AS markedBy 
              FROM attendance a 
              JOIN students s ON a.student_id = s.student_id 
              JOIN users u ON s.user_id = u.user_id 
              JOIN courses c ON a.course_id = c.course_id 
              LEFT JOIN users mar ON a.marked_by = mar.user_id";

    $conditions = [];
    $params = [];

    if ($course !== '' && $course !== 'all') {
        $conditions[] = 'c.course_code = :course';
        $params[':course'] = $course;
    }

    if ($semester !== '' && $semester !== 'all') {
        $conditions[] = 's.semester = :semester';
        $params[':semester'] = $semester;
    }

    if ($date !== '') {
        $conditions[] = 'a.date = :date';
        $params[':date'] = $date;
    }

    if (count($conditions) > 0) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $query .= ' ORDER BY a.date DESC';

    $stmt = $conn->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'records' => $records]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>