<?php
/**
 * RSD College Ferozpur - Save Attendance
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->attendance) && !empty($data->date) && !empty($data->course_code) && !empty($data->teacher_id)) {
    try {
        $conn->beginTransaction();

        // Get course_id from code
        $c_query = "SELECT course_id FROM courses WHERE course_code = :code";
        $c_stmt = $conn->prepare($c_query);
        $c_stmt->bindParam(":code", $data->course_code);
        $c_stmt->execute();
        $course = $c_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$course) throw new Exception("Invalid course code");
        $course_id = $course['course_id'];

        $saved_count = 0;
        foreach ($data->attendance as $record) {
            // Support both studentId and roll_no for flexibility
            $studentId = null;
            
            if (!empty($record->studentId) && $record->studentId > 0) {
                $studentId = $record->studentId;
            } elseif (!empty($record->roll_no)) {
                // Look up student by roll_no (used in import flow)
                $s_query = "SELECT student_id FROM students WHERE roll_no = :roll";
                $s_stmt = $conn->prepare($s_query);
                $s_stmt->bindParam(":roll", $record->roll_no);
                $s_stmt->execute();
                $student = $s_stmt->fetch(PDO::FETCH_ASSOC);
                if ($student) {
                    $studentId = $student['student_id'];
                }
            }
            
            if (!$studentId) {
                continue; // Skip if student not found
            }
            
            // Check if record already exists to avoid duplicates (Update if exists)
            $check = "SELECT attendance_id FROM attendance 
                      WHERE student_id = :sid AND course_id = :cid AND date = :dt";
            $c_stmt = $conn->prepare($check);
            $c_stmt->bindParam(":sid", $studentId);
            $c_stmt->bindParam(":cid", $course_id);
            $c_stmt->bindParam(":dt", $data->date);
            $c_stmt->execute();
            $existing = $c_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                $query = "UPDATE attendance SET status = :status, marked_by = :tid 
                          WHERE student_id = :sid AND course_id = :cid AND date = :dt";
            } else {
                $query = "INSERT INTO attendance (student_id, course_id, date, status, marked_by) 
                          VALUES (:sid, :cid, :dt, :status, :tid)";
            }
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":sid", $studentId);
            $stmt->bindParam(":cid", $course_id);
            $stmt->bindParam(":dt", $data->date);
            $stmt->bindParam(":status", $record->status);
            $stmt->bindParam(":tid", $data->teacher_id);
            $stmt->execute();
            $saved_count++;
        }

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Attendance saved successfully", "saved_count" => $saved_count]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
}
?>
