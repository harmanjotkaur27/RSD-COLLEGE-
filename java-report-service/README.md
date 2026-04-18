# Java Attendance Report Service

This service generates attendance reports in CSV or PDF format for the RSD College project.

## Run instructions

1. Open a terminal in `java-report-service`.
2. Compile the service:

```bash
javac AttendanceReportService.java
```

3. Start the service:

```bash
java AttendanceReportService
```

4. The service listens on `http://localhost:8081`.

## API

- `GET /health`
  - Returns `{"status":"ok"}`.

- `POST /report`
  - Accepts a JSON payload with:
    - `attendance`: array of objects with `studentId`, `roll_no`, `full_name`, `status`
    - `date`
    - `course_code`
    - `semester`
    - `teacher_id`
    - `format`: `csv` or `pdf`

The PHP backend forwards report requests to this service and returns a file download to the browser.
