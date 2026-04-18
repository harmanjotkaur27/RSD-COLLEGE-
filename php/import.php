<?php
/**
 * RSD College Ferozpur - Import Attendance
 * Receives uploaded CSV/PDF file, parses it via Java service, and saves to DB.
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once 'db_config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Only POST requests are supported."]);
    exit;
}

$course_code = $_POST['course_code'] ?? '';
$semester = $_POST['semester'] ?? '';
$date = $_POST['date'] ?? '';
$teacher_id = $_POST['teacher_id'] ?? '';

if (empty($course_code) || empty($semester) || empty($date) || empty($teacher_id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "File upload failed."]);
    exit;
}

$file = $_FILES['file'];
$allowedTypes = ['text/csv', 'application/pdf'];
$allowedExtensions = ['csv', 'pdf'];

$fileType = $file['type'];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];

$extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
if (!in_array($fileType, $allowedTypes) && !in_array($extension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Only CSV and PDF files are allowed."]);
    exit;
}

// Send file to Java service for parsing
$javaUrl = 'http://localhost:8081/parse';
$boundary = '----FormBoundary' . md5(time());
$postData = "--$boundary\r\n";
$postData .= "Content-Disposition: form-data; name=\"file\"; filename=\"$fileName\"\r\n";
$postData .= "Content-Type: $fileType\r\n\r\n";
$postData .= file_get_contents($fileTmpPath) . "\r\n";
$postData .= "--$boundary\r\n";
$postData .= "Content-Disposition: form-data; name=\"course_code\"\r\n\r\n$course_code\r\n";
$postData .= "--$boundary\r\n";
$postData .= "Content-Disposition: form-data; name=\"semester\"\r\n\r\n$semester\r\n";
$postData .= "--$boundary\r\n";
$postData .= "Content-Disposition: form-data; name=\"date\"\r\n\r\n$date\r\n";
$postData .= "--$boundary--\r\n";

$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: multipart/form-data; boundary=$boundary\r\n",
        'content' => $postData,
        'ignore_errors' => true
    ]
]);

$result = file_get_contents($javaUrl, false, $context);
if ($result === false) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to parse file via Java service."]);
    exit;
}

$parsedData = json_decode($result, true);
if ($parsedData === null || !isset($parsedData['attendance'])) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Invalid response from Java service."]);
    exit;
}

$attendance = $parsedData['attendance'];
if (empty($attendance)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "No attendance records found in file."]);
    exit;
}

// Extract metadata from the first record if available
$extractedMetadata = [
    'course_code' => $course_code,
    'semester' => $semester,
    'date' => $date
];

// If data contains course/semester info, extract it from records
if (!empty($attendance[0])) {
    // The Java service returns parsed attendance records
    // Return the parsed data for preview without saving
    echo json_encode([
        "status" => "success",
        "message" => "File parsed successfully. Please review and save.",
        "attendance" => $attendance,
        "metadata" => $extractedMetadata,
        "count" => count($attendance)
    ]);
    exit;
}

try {
    $conn->beginTransaction();

    // Get course_id
    $c_query = "SELECT course_id FROM courses WHERE course_code = :code";
    $c_stmt = $conn->prepare($c_query);
    $c_stmt->bindParam(":code", $course_code);
    $c_stmt->execute();
    $course = $c_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$course) {
        throw new Exception("Invalid course code");
    }
    $course_id = $course['course_id'];

$importedCount = 0;
    foreach ($attendance as $record) {
        $rollNo = $record['roll_no'] ?? null;
        $status = $record['status'] ?? null;

        if (!$rollNo || !$status) {
            continue; // Skip invalid records
        }

        // Find student_id by roll_no
        $s_query = "SELECT student_id FROM students WHERE roll_no = :roll";
        $s_stmt = $conn->prepare($s_query);
        $s_stmt->bindParam(":roll", $rollNo);
        $s_stmt->execute();
        $student = $s_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            continue; // Skip if student not found
        }
        $studentId = $student['student_id'];

        // Check if record already exists
        $check = "SELECT attendance_id FROM attendance WHERE student_id = :sid AND course_id = :cid AND date = :dt";
        $c_stmt = $conn->prepare($check);
        $c_stmt->bindParam(":sid", $studentId);
        $c_stmt->bindParam(":cid", $course_id);
        $c_stmt->bindParam(":dt", $date);
        $c_stmt->execute();
        $existing = $c_stmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            $query = "UPDATE attendance SET status = :status, marked_by = :tid WHERE student_id = :sid AND course_id = :cid AND date = :dt";
        } else {
            $query = "INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES (:sid, :cid, :dt, :status, :tid)";
        }

        $stmt = $conn->prepare($query);
        $stmt->bindParam(":sid", $studentId);
        $stmt->bindParam(":cid", $course_id);
        $stmt->bindParam(":dt", $date);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":tid", $teacher_id);
        $stmt->execute();
        $importedCount++;
    }

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Attendance imported successfully", "imported_count" => $importedCount]);
} catch (Exception $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>