<?php
/**
 * RSD College Ferozpur - Save Attendance
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

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

        foreach ($data->attendance as $record) {
            // Check if record already exists to avoid duplicates (Update if exists)
            $check = "SELECT attendance_id FROM attendance 
                      WHERE student_id = :sid AND course_id = :cid AND date = :dt";
            $c_stmt = $conn->prepare($check);
            $c_stmt->bindParam(":sid", $record->studentId);
            $c_stmt->bindParam(":cid", $course_id);
            $c_stmt->bindParam(":dt", $data->date);
            $c_stmt->execute();
            
            if ($c_stmt->rowCount() > 0) {
                $query = "UPDATE attendance SET status = :status, marked_by = :tid 
                          WHERE student_id = :sid AND course_id = :cid AND date = :dt";
            } else {
                $query = "INSERT INTO attendance (student_id, course_id, date, status, marked_by) 
                          VALUES (:sid, :cid, :dt, :status, :tid)";
            }
            
            $stmt = $conn->prepare($query);
            $stmt->bindParam(":sid", $record->studentId);
            $stmt->bindParam(":cid", $course_id);
            $stmt->bindParam(":dt", $data->date);
            $stmt->bindParam(":status", $record->status);
            $stmt->bindParam(":tid", $data->teacher_id);
            $stmt->execute();
        }

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Attendance saved successfully"]);
    } catch (Exception $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Incomplete data"]);
}
?>
