import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AttendanceReportService {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        server.createContext("/health", new HealthHandler());
        server.createContext("/report", new ReportHandler());
        server.createContext("/parse", new ParseHandler());
        server.setExecutor(null);
        System.out.println("Java Report Service is running on http://localhost:8081");
        server.start();
    }

    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            byte[] response = "{\"status\":\"ok\"}".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, response.length);
            exchange.getResponseBody().write(response);
            exchange.close();
        }
    }

    static class ReportHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "Only POST requests are supported.");
                return;
            }

            String body = readAll(exchange.getRequestBody());
            if (body == null || body.isEmpty()) {
                sendJson(exchange, 400, "Empty request body.");
                return;
            }

            ReportData reportData = parseReportData(body);
            if (reportData == null || !reportData.isValid()) {
                sendJson(exchange, 400, "Invalid report payload.");
                return;
            }

            try {
                if ("csv".equalsIgnoreCase(reportData.format)) {
                    byte[] csvBytes = generateCsv(reportData);
                    exchange.getResponseHeaders().add("Content-Type", "text/csv; charset=UTF-8");
                    exchange.getResponseHeaders().add("Content-Disposition", "attachment; filename=attendance-report.csv");
                    exchange.sendResponseHeaders(200, csvBytes.length);
                    exchange.getResponseBody().write(csvBytes);
                } else {
                    byte[] pdfBytes = generatePdf(reportData);
                    exchange.getResponseHeaders().add("Content-Type", "application/pdf");
                    exchange.getResponseHeaders().add("Content-Disposition", "attachment; filename=attendance-report.pdf");
                    exchange.sendResponseHeaders(200, pdfBytes.length);
                    exchange.getResponseBody().write(pdfBytes);
                }
            } catch (Exception e) {
                sendJson(exchange, 500, "Report generation failed: " + e.getMessage());
            } finally {
                exchange.close();
            }
        }

        private String readAll(InputStream stream) throws IOException {
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[4096];
            int n;
            while ((n = stream.read(data)) != -1) {
                buffer.write(data, 0, n);
            }
            return buffer.toString(StandardCharsets.UTF_8);
        }

        private ReportData parseReportData(String json) {
            String format = extractString(json, "format");
            String date = extractString(json, "date");
            String courseCode = extractString(json, "course_code");
            String semesterText = extractString(json, "semester");            if (semesterText == null) {
                semesterText = extractNumber(json, "semester");
            }            int semester = semesterText != null ? parseInt(semesterText) : -1;
            String attendanceBlock = extractArrayBlock(json, "attendance");
            List<AttendanceRow> rows = parseAttendanceRows(attendanceBlock);
            return new ReportData(format, date, courseCode, semester, rows);
        }

        private String extractString(String source, String key) {
            Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"]*)\"");
            Matcher matcher = pattern.matcher(source);
            return matcher.find() ? matcher.group(1) : null;
        }

        private String extractArrayBlock(String source, String key) {
            int index = source.indexOf('"' + key + '"');
            if (index < 0) {
                return null;
            }
            int bracket = source.indexOf('[', index);
            if (bracket < 0) {
                return null;
            }
            int depth = 0;
            for (int i = bracket; i < source.length(); i++) {
                char c = source.charAt(i);
                if (c == '[') {
                    depth++;
                } else if (c == ']') {
                    depth--;
                    if (depth == 0) {
                        return source.substring(bracket, i + 1);
                    }
                }
            }
            return null;
        }

        private List<AttendanceRow> parseAttendanceRows(String arrayJson) {
            List<AttendanceRow> rows = new ArrayList<>();
            if (arrayJson == null) {
                return rows;
            }
            Pattern objectPattern = Pattern.compile("\\{([^}]*)\\}");
            Matcher matcher = objectPattern.matcher(arrayJson);
            while (matcher.find()) {
                String objectText = matcher.group(1);
                String studentIdText = extractNumber(objectText, "studentId");
                String status = extractString('{' + objectText + '}', "status");
                String rollNo = extractString('{' + objectText + '}', "roll_no");
                String fullName = extractString('{' + objectText + '}', "full_name");
                int studentId = parseInt(studentIdText);
                if (studentId >= 0 && status != null) {
                    rows.add(new AttendanceRow(studentId, rollNo != null ? rollNo : "", fullName != null ? fullName : "", status));
                }
            }
            return rows;
        }

        private String extractNumber(String source, String key) {
            Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*(\\d+)");
            Matcher matcher = pattern.matcher(source);
            return matcher.find() ? matcher.group(1) : null;
        }

        private int parseInt(String value) {
            try {
                return Integer.parseInt(value);
            } catch (Exception e) {
                return -1;
            }
        }

        private byte[] generateCsv(ReportData data) {
            StringBuilder builder = new StringBuilder();
            builder.append("Roll No,Student Name,Course,Semester,Date,Status\n");
            for (AttendanceRow row : data.attendance) {
                builder.append(escapeCsv(row.rollNo)).append(',');
                builder.append(escapeCsv(row.fullName)).append(',');
                builder.append(escapeCsv(data.courseCode)).append(',');
                builder.append(data.semester).append(',');
                builder.append(escapeCsv(data.date)).append(',');
                builder.append(escapeCsv(row.status)).append('\n');
            }
            return builder.toString().getBytes(StandardCharsets.UTF_8);
        }

        private String escapeCsv(String value) {
            if (value == null) {
                return "";
            }
            String escaped = value.replace("\"", "\"\"");
            if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\"")) {
                escaped = '"' + escaped + '"';
            }
            return escaped;
        }

        private byte[] generatePdf(ReportData data) throws IOException {
            String title = String.format("Attendance Report for %s - Sem %d", data.courseCode, data.semester);
            StringBuilder contentBuilder = new StringBuilder();
            contentBuilder.append("BT\n");
            contentBuilder.append("/F1 18 Tf\n");
            contentBuilder.append("50 750 Td (").append(escapePdfText(title)).append(") Tj\n");
            contentBuilder.append("0 -24 Td (").append(escapePdfText("Date: " + data.date)).append(") Tj\n");
            contentBuilder.append("0 -24 Td (").append(escapePdfText("Roll No | Student Name | Status")).append(") Tj\n");
            int offsetY = 44;
            for (AttendanceRow row : data.attendance) {
                if (offsetY > 720) {
                    break;
                }
                String line = String.format("%s | %s | %s", row.rollNo, row.fullName, row.status);
                contentBuilder.append("0 -22 Td (").append(escapePdfText(line)).append(") Tj\n");
                offsetY += 22;
            }
            contentBuilder.append("ET\n");
            byte[] streamBytes = contentBuilder.toString().getBytes(StandardCharsets.US_ASCII);

            ByteArrayOutputStream pdf = new ByteArrayOutputStream();
            List<Integer> positions = new ArrayList<>();

            write(pdf, "%PDF-1.3\n");

            positions.add(pdf.size());
            write(pdf, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

            positions.add(pdf.size());
            write(pdf, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

            positions.add(pdf.size());
            write(pdf, "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");

            positions.add(pdf.size());
            write(pdf, "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");

            positions.add(pdf.size());
            write(pdf, "5 0 obj\n<< /Length " + streamBytes.length + " >>\nstream\n");
            pdf.write(streamBytes);
            write(pdf, "endstream\nendobj\n");

            int xrefStart = pdf.size();
            write(pdf, "xref\n0 6\n0000000000 65535 f \n");
            for (int pos : positions) {
                write(pdf, String.format("%010d 00000 n \n", pos));
            }
            write(pdf, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF\n");

            return pdf.toByteArray();
        }

        private void write(ByteArrayOutputStream output, String value) throws IOException {
            output.write(value.getBytes(StandardCharsets.US_ASCII));
        }

        private String escapePdfText(String value) {
            if (value == null) {
                return "";
            }
            return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
        }

        private void sendJson(HttpExchange exchange, int statusCode, String message) throws IOException {
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            String response = String.format("{\"status\":\"error\",\"message\":\"%s\"}", message.replace("\"", "\\\""));
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(statusCode, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        }
    }

    static class ParseHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "Only POST requests are supported.");
                return;
            }

            String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
            if (contentType == null || !contentType.contains("multipart/form-data")) {
                sendJson(exchange, 400, "Content-Type must be multipart/form-data.");
                return;
            }

            try {
                MultipartData multipartData = parseMultipart(exchange.getRequestBody(), contentType);
                String courseCode = multipartData.getField("course_code");
                String semesterStr = multipartData.getField("semester");
                String date = multipartData.getField("date");
                byte[] fileData = multipartData.getFileData();
                String fileName = multipartData.getFileName();

                if (courseCode == null || semesterStr == null || date == null || fileData == null) {
                    sendJson(exchange, 400, "Missing required fields or file.");
                    return;
                }

                int semester = parseInt(semesterStr);
                if (semester <= 0) {
                    sendJson(exchange, 400, "Invalid semester.");
                    return;
                }

                List<AttendanceRow> attendance = null;
                if (fileName.toLowerCase().endsWith(".csv")) {
                    attendance = parseCsv(fileData);
                } else if (fileName.toLowerCase().endsWith(".pdf")) {
                    attendance = parsePdf(fileData);
                } else {
                    sendJson(exchange, 400, "Unsupported file type. Only CSV and PDF are supported.");
                    return;
                }

                if (attendance == null || attendance.isEmpty()) {
                    sendJson(exchange, 400, "No valid attendance records found in file.");
                    return;
                }

                // Convert to JSON response
                StringBuilder json = new StringBuilder("{\"attendance\":[");
                for (int i = 0; i < attendance.size(); i++) {
                    AttendanceRow row = attendance.get(i);
                    json.append(String.format("{\"student_id\":%d,\"roll_no\":\"%s\",\"full_name\":\"%s\",\"status\":\"%s\"}",
                        row.studentId, escapeJson(row.rollNo), escapeJson(row.fullName), escapeJson(row.status)));
                    if (i < attendance.size() - 1) json.append(",");
                }
                json.append("]}");

                exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                byte[] response = json.toString().getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(200, response.length);
                exchange.getResponseBody().write(response);
            } catch (Exception e) {
                sendJson(exchange, 500, "Parsing failed: " + e.getMessage());
            } finally {
                exchange.close();
            }
        }

        private MultipartData parseMultipart(InputStream inputStream, String contentType) throws IOException {
            String boundary = extractBoundary(contentType);
            if (boundary == null) {
                throw new IOException("Invalid multipart boundary");
            }

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] data = new byte[4096];
            int n;
            while ((n = inputStream.read(data)) != -1) {
                buffer.write(data, 0, n);
            }
            byte[] bodyBytes = buffer.toByteArray();
            String body = new String(bodyBytes, StandardCharsets.UTF_8);

            MultipartData result = new MultipartData();
            String[] parts = body.split("--" + boundary);
            for (String part : parts) {
                part = part.trim();
                if (part.isEmpty() || part.equals("--")) continue;

                int headerEnd = part.indexOf("\r\n\r\n");
                if (headerEnd < 0) continue;

                String headers = part.substring(0, headerEnd);
                String content = part.substring(headerEnd + 4);

                if (headers.contains("Content-Disposition: form-data; name=\"file\"")) {
                    String filename = extractFilename(headers);
                    result.fileName = filename;
                    // Extract binary data properly
                    int partStart = body.indexOf(part);
                    if (partStart >= 0) {
                        int contentStart = body.indexOf("\r\n\r\n", partStart) + 4;
                        int contentEnd = body.indexOf("\r\n--" + boundary, contentStart);
                        if (contentEnd < 0) contentEnd = body.length();
                        result.fileData = Arrays.copyOfRange(bodyBytes, contentStart, contentEnd);
                    } else {
                        result.fileData = content.getBytes(StandardCharsets.UTF_8);
                    }
                } else if (headers.contains("Content-Disposition: form-data; name=\"course_code\"")) {
                    result.courseCode = content.trim();
                } else if (headers.contains("Content-Disposition: form-data; name=\"semester\"")) {
                    result.semester = content.trim();
                } else if (headers.contains("Content-Disposition: form-data; name=\"date\"")) {
                    result.date = content.trim();
                }
            }
            return result;
        }

        private String extractBoundary(String contentType) {
            Pattern pattern = Pattern.compile("boundary=([^;]+)");
            Matcher matcher = pattern.matcher(contentType);
            return matcher.find() ? matcher.group(1) : null;
        }

        private String extractFilename(String headers) {
            Pattern pattern = Pattern.compile("filename=\"([^\"]+)\"");
            Matcher matcher = pattern.matcher(headers);
            return matcher.find() ? matcher.group(1) : null;
        }

        private List<AttendanceRow> parseCsv(byte[] data) {
            List<AttendanceRow> rows = new ArrayList<>();
            String csv = new String(data, StandardCharsets.UTF_8);
            String[] lines = csv.split("\n");
            boolean isHeader = true;
            for (String line : lines) {
                line = line.trim();
                if (line.isEmpty()) continue;
                if (isHeader) {
                    isHeader = false;
                    continue; // Skip header
                }
                List<String> fields = parseCsvLine(line);
                if (fields.size() >= 6) {
                    String rollNo = fields.get(0);
                    String fullName = fields.get(1);
                    String status = fields.get(5);
                    rows.add(new AttendanceRow(-1, rollNo, fullName, status));
                }
            }
            return rows;
        }

        private List<String> parseCsvLine(String line) {
            List<String> fields = new ArrayList<>();
            boolean inQuotes = false;
            StringBuilder field = new StringBuilder();
            for (int i = 0; i < line.length(); i++) {
                char c = line.charAt(i);
                if (c == '"') {
                    if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                        field.append('"');
                        i++; // skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (c == ',' && !inQuotes) {
                    fields.add(field.toString());
                    field.setLength(0);
                } else {
                    field.append(c);
                }
            }
            fields.add(field.toString());
            return fields;
        }

        private List<AttendanceRow> parsePdf(byte[] data) {
            // Simple PDF text extraction (very basic)
            List<AttendanceRow> rows = new ArrayList<>();
            String pdfText = new String(data, StandardCharsets.UTF_8);
            // This is a very basic extraction - in a real implementation, you'd use a PDF library
            // For demo purposes, we'll look for patterns like "Roll No | Student Name | Status"
            Pattern pattern = Pattern.compile("([^-|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*(Present|Absent)");
            Matcher matcher = pattern.matcher(pdfText);
            while (matcher.find()) {
                String rollNo = matcher.group(1).trim();
                String fullName = matcher.group(2).trim();
                String status = matcher.group(3).trim();
                rows.add(new AttendanceRow(-1, rollNo, fullName, status));
            }
            return rows;
        }

        private String unescapeCsv(String value) {
            if (value == null) return "";
            value = value.trim();
            if (value.startsWith("\"") && value.endsWith("\"")) {
                value = value.substring(1, value.length() - 1);
                value = value.replace("\"\"", "\"");
            }
            return value;
        }

        private String escapeJson(String value) {
            if (value == null) return "";
            return value.replace("\\", "\\\\").replace("\"", "\\\"");
        }

        private int parseInt(String value) {
            try {
                return Integer.parseInt(value);
            } catch (Exception e) {
                return -1;
            }
        }

        private void sendJson(HttpExchange exchange, int statusCode, String message) throws IOException {
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            String response = String.format("{\"status\":\"error\",\"message\":\"%s\"}", message.replace("\"", "\\\""));
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(statusCode, bytes.length);
            exchange.getResponseBody().write(bytes);
            exchange.close();
        }
    }

    static class MultipartData {
        String courseCode;
        String semester;
        String date;
        String fileName;
        byte[] fileData;

        String getField(String name) {
            switch (name) {
                case "course_code": return courseCode;
                case "semester": return semester;
                case "date": return date;
                default: return null;
            }
        }

        byte[] getFileData() {
            return fileData;
        }

        String getFileName() {
            return fileName;
        }
    }

    static class ReportData {
        String format;
        String date;
        String courseCode;
        int semester;
        List<AttendanceRow> attendance;

        ReportData(String format, String date, String courseCode, int semester, List<AttendanceRow> attendance) {
            this.format = format;
            this.date = date;
            this.courseCode = courseCode;
            this.semester = semester;
            this.attendance = attendance;
        }

        boolean isValid() {
            return format != null && ("csv".equalsIgnoreCase(format) || "pdf".equalsIgnoreCase(format))
                    && date != null && !date.isEmpty()
                    && courseCode != null && !courseCode.isEmpty()
                    && semester > 0
                    && attendance != null && !attendance.isEmpty();
        }
    }

    static class AttendanceRow {
        int studentId;
        String rollNo;
        String fullName;
        String status;

        AttendanceRow(int studentId, String rollNo, String fullName, String status) {
            this.studentId = studentId;
            this.rollNo = rollNo;
            this.fullName = fullName;
            this.status = status;
        }
    }
}
