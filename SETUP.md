# 🚀 RSD College Attendance System - Setup Guide

A complete college attendance management system with **PHP + SQLite backend**, **Java report service**, and a **modern web frontend**.

---

## 📋 Requirements

- **PHP** (≥ 8.x)
- **Java JDK** (LTS recommended - JDK 17 or 21)
- **SQLite** (bundled with PHP)
- **Node.js** (optional, for Vite dev server)

---

## 🔧 Step 1: Install Java

### Option A: Windows

1. Download **Temurin JDK (LTS)** from: https://adoptium.net/
2. Choose **JDK 17 LTS** or **JDK 21 LTS**
3. Run the installer and complete setup
4. Verify installation:
   ```bash
   java -version
   javac -version
   ```

### Option B: macOS / Linux

```bash
# macOS (Homebrew)
brew install openjdk@21

# Linux (Ubuntu/Debian)
sudo apt-get install openjdk-21-jdk
```

### Set JAVA_HOME (Recommended)

- **Windows**: Add environment variable `JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-21`
- **macOS/Linux**: Add to `.bashrc` or `.zshrc`:
  ```bash
  export JAVA_HOME="/usr/libexec/java_home -v 21"
  ```

---

## 🐘 Step 2: Install PHP

### Option A: Windows

1. Download PHP from: https://www.php.net/downloads
2. Choose **PHP 8.x (Thread Safe or Non-Thread Safe)**
3. Extract to a folder (e.g., `C:\php`)
4. Add PHP to PATH (environment variables)
5. Verify:
   ```bash
   php -v
   ```

### Option B: macOS

```bash
brew install php
php -v
```

### Option C: Linux (Ubuntu/Debian)

```bash
sudo apt-get install php php-cli php-pdo php-sqlite3
php -v
```

---

## 🗄️ Step 3: Configure SQLite in PHP

SQLite is **bundled with PHP** by default. Verify it's enabled in `php.ini`:

```ini
extension=pdo_sqlite
extension=sqlite3
```

(Most PHP installations have these enabled by default.)

---

## 📁 Step 4: Clone & Navigate to Project

```bash
git clone <repository-url> RSD-COLLEGE
cd RSD-COLLEGE
```

---

## 🗃️ Step 5: Initialize the Database

Run the database initialization script to create the SQLite file and populate sample data:

```bash
php php/init_db.php
```

You should see output like:
```
{"status":"success","message":"Database initialized successfully"}
```

This creates `php/rsd_college_new.db` with all necessary tables and sample data.

---

## ✅ Step 6: Verify Database Setup

Test the connection:

```bash
php php/test_db.php
```

Expected output:
```
{"status":"ok","database":"SQLite","students":20,"courses":5}
```

---

## 🚀 Step 7: Start All Services

You'll need **3 terminal windows**. Open them in the project root directory.

### Terminal 1: Start PHP Server

```bash
php -S localhost:8000
```

You should see:
```
Development Server is running on http://localhost:8000
```

### Terminal 2: Start Java Report Service

```bash
cd java-report-service
javac AttendanceReportService.java
java AttendanceReportService
```

You should see:
```
Java Report Service is running on http://localhost:8081
```

### Terminal 3: (Optional) Start Vite Dev Server

If you want frontend hot-reload during development:

```bash
npm install
npm run dev
```

Otherwise, just open the static `index.html` in your browser via PHP server.

---

## 🌐 Step 8: Access the Application

Open your browser and navigate to:

```
http://localhost:8000/index.html
```

---

## 👤 Login Credentials

### Teacher Account
- **Username**: `teacher1`
- **Password**: `pass123`
- **Role**: Teacher

### Student Accounts
- **Username**: `student123` to `student142`
- **Password**: `pass123`
- **Role**: Student

---

## 📚 Full Feature Workflow

### As a **Teacher**:

1. **Login** with `teacher1` / `pass123`

2. **Mark Attendance**:
   - Go to "Mark Attendance" tab
   - Select Course (e.g., BCA), Semester (e.g., 1), and Date
   - Click "Load Students"
   - Select Present/Absent for each student
   - Click "Save Attendance"
   - CSV/PDF download buttons appear

3. **Download Report**:
   - After saving, click "CSV" or "PDF" button
   - Report downloads with all marked attendance
   - Open in Excel or PDF viewer

4. **Import Attendance**:
   - Go to "Import Attendance" tab
   - Select Course, Semester, and Date
   - Upload a previously exported CSV or PDF file
   - Click "Import Attendance"
   - Records are parsed and saved to database

5. **Batch Statistics**:
   - Go to "Batch Statistics" tab
   - Select Course and Semester
   - View overall attendance % and per-student breakdown

6. **Student Search**:
   - Go to "Student Search" tab
   - Search by name or roll number
   - Click "View History" to see attendance records

7. **Daily Reports**:
   - Go to "Daily Reports" tab
   - Select a date and optional course filter
   - View summary of attendance for that day

---

### As a **Student**:

1. **Login** with `student123` / `pass123`

2. **View Attendance History**:
   - See all your attendance records by course/semester
   - Filter by date, course, or semester
   - View your overall attendance percentage

3. **Academic Year Overview**:
   - See attendance statistics grouped by academic year
   - Track performance across semesters

---

## 🛠️ Project Structure

```
RSD-COLLEGE-/
├── index.html                 # Main frontend
├── script.js                  # Application logic
├── styles.css                 # Styling
├── package.json               # Node dependencies (optional)
├── vite.config.ts             # Vite config (optional)
├── tsconfig.json              # TypeScript config (optional)
│
├── php/
│   ├── db_config.php          # Database configuration
│   ├── init_db.php            # Database initialization
│   ├── test_db.php            # Database health check
│   ├── login.php              # Authentication endpoint
│   ├── get_students.php       # Fetch students for attendance
│   ├── get_attendance.php     # Fetch attendance history
│   ├── get_attendance_batch.php # Batch attendance queries
│   ├── save_attendance.php    # Save attendance to DB
│   ├── report.php             # Report generation proxy (calls Java)
│   ├── import.php             # Import attendance from CSV/PDF
│   └── rsd_college_sqlite.sql # Database schema
│
├── java-report-service/
│   ├── AttendanceReportService.java  # Report generation service
│   └── README.md              # Java service guide
│
└── SETUP.md                   # This file
```

---

## 🧪 Testing the Full Flow

### Test 1: Mark & Export Attendance

1. **Login** as teacher
2. **Mark Attendance** for BCA Semester 1 on today's date
3. **Save Attendance** → buttons appear
4. **Download CSV** → open in Excel ✅
5. **Download PDF** → open in PDF viewer ✅

### Test 2: Import Attendance

1. **Go to** "Import Attendance" tab
2. **Upload** the CSV you downloaded
3. **Click** "Import Attendance" → success message
4. **Verify**: Go to "Mark Attendance", load same students → attendance is restored

### Test 3: Student View

1. **Logout** and **Login** as `student123`
2. **View** attendance history → shows records you marked
3. **Use filters** to search by date/course
4. **Check** Academic Year overview

### Test 4: Reports & Statistics

1. **Login** as teacher
2. **Go to** "Batch Statistics" → see overall attendance %
3. **Go to** "Daily Reports" → see attendance by date
4. **Search** for specific students and view their history

---

## 🐛 Troubleshooting

### PHP Server Won't Start

```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Use a different port
php -S localhost:9000
```

### Java Service Won't Start

```bash
# Check if port 8081 is in use
netstat -ano | findstr :8081  # Windows

# Ensure Java is in PATH
java -version

# Try from java-report-service directory
cd java-report-service
javac AttendanceReportService.java
java AttendanceReportService
```

### Database Not Found

```bash
# Reinitialize database
php php/init_db.php

# Verify it was created
ls -la php/rsd_college_new.db
```

### Login Fails

1. Verify PHP server is running: `http://localhost:8000/php/login.php`
2. Check `php/db_config.php` — database path should exist
3. Run: `php php/test_db.php` to check database

### Import/Export Not Working

1. Ensure **Java service is running** on port 8081
2. Verify firewall allows `localhost:8081`
3. Check browser console for errors (F12)

---

## 📖 Additional Resources

- **PHP Documentation**: https://www.php.net/docs.php
- **SQLite Documentation**: https://www.sqlite.org/docs.html
- **Java Documentation**: https://docs.oracle.com/en/java/javase/21/

---

## 🎉 You're Ready!

The system is now fully operational. Explore the features, test the workflows, and enjoy a complete attendance management solution!

For questions or issues, check the project repository or documentation.

---

## 📝 Quick Reference Commands

| Task | Command |
|------|---------|
| Initialize Database | `php php/init_db.php` |
| Test Database | `php php/test_db.php` |
| Start PHP Server | `php -S localhost:8000` |
| Start Java Service | `cd java-report-service && javac *.java && java AttendanceReportService` |
| Start Vite Dev | `npm run dev` |
| Access App | `http://localhost:8000/index.html` |

---

**Happy Learning! 🎓**