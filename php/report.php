<?php
/**
 * RSD College Ferozpur - Attendance Report API
 * This endpoint forwards report generation requests to the Java report service.
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = json_decode(file_get_contents('php://input'));
if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload"]);
    exit;
}

$required = ['attendance', 'date', 'course_code', 'semester', 'teacher_id', 'format'];
foreach ($required as $field) {
    if (!isset($data->{$field}) || $data->{$field} === '') {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Missing required field: $field"]);
        exit;
    }
}

$format = strtolower(trim($data->format));
if (!in_array($format, ['csv', 'pdf'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Unsupported report format. Use 'csv' or 'pdf'."]);
    exit;
}

$javaUrl = 'http://localhost:8081/report';
$payload = json_encode([ 
    'attendance' => $data->attendance,
    'date' => $data->date,
    'course_code' => $data->course_code,
    'semester' => $data->semester,
    'teacher_id' => $data->teacher_id,
    'format' => $format
]);

if (function_exists('curl_version')) {
    $ch = curl_init($javaUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HEADER, true);
    $response = curl_exec($ch);
    $error = curl_error($ch);
    $info = curl_getinfo($ch);
    curl_close($ch);

    if ($response === false) {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Java service request failed: $error"]);
        exit;
    }

    $headerSize = $info['header_size'] ?? 0;
    $responseHeaders = substr($response, 0, $headerSize);
    $body = substr($response, $headerSize);
    $statusCode = $info['http_code'] ?: 500;
    $contentType = $info['content_type'] ?: 'application/octet-stream';

    if ($statusCode !== 200) {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo $body;
        exit;
    }

    header("Content-Type: $contentType");
    header('Content-Disposition: attachment; filename="attendance-report.' . $format . '"');
    echo $body;
    exit;
}

// Fallback if cURL is unavailable
$options = [
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\n",
        'content' => $payload,
        'ignore_errors' => true
    ]
];
$context = stream_context_create($options);
$result = file_get_contents($javaUrl, false, $context);
$statusCode = 500;
if (isset($http_response_header) && preg_match('#HTTP/\d+\.\d+\s+(\d+)#', $http_response_header[0], $matches)) {
    $statusCode = intval($matches[1]);
}

if ($result === false || $statusCode !== 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Java service request failed."]);
    exit;
}

$contentType = 'application/octet-stream';
foreach ($http_response_header as $header) {
    if (stripos($header, 'Content-Type:') === 0) {
        $contentType = trim(substr($header, strlen('Content-Type:')));
        break;
    }
}

header("Content-Type: $contentType");
header('Content-Disposition: attachment; filename="attendance-report.' . $format . '"');
echo $result;
exit;
?>