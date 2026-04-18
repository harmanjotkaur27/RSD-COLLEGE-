<?php
/**
 * RSD College Ferozpur - Login Handler
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

if (!empty($data->username) && !empty($data->password) && !empty($data->role)) {
    try {
        $query = "SELECT * FROM users WHERE username = :username AND role = :role LIMIT 1";
        $stmt = $conn->prepare($query);
        $stmt->bindParam(":username", $data->username);
        $stmt->bindParam(":role", $data->role);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Note: In production, use password_hash() and password_verify()
        if ($user && $data->password === $user['password']) {
            $response = [
                "status" => "success",
                "user" => [
                    "id" => $user['user_id'],
                    "username" => $user['username'],
                    "role" => $user['role'],
                    "name" => $user['full_name']
                ]
            ];
            
            // If student, fetch their student-specific info
            if ($user['role'] === 'student') {
                $s_query = "SELECT s.*, c.course_name FROM students s 
                           JOIN courses c ON s.course_id = c.course_id 
                           WHERE s.user_id = :uid";
                $s_stmt = $conn->prepare($s_query);
                $s_stmt->bindParam(":uid", $user['user_id']);
                $s_stmt->execute();
                $student = $s_stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($student) {
                    $response['user']['studentId'] = $student['student_id'];
                    $response['user']['course'] = $student['course_name'];
                    $response['user']['roll_no'] = $student['roll_no'];
                }
            }
            
            echo json_encode($response);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Incomplete login data"]);
}
?>
