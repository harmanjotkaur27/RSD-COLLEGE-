-- RSD College Ferozpur - Database Schema
-- Database: rsd_college_db
-- This script creates the necessary tables for the college management system.

CREATE DATABASE IF NOT EXISTS rsd_college_db;
USE rsd_college_db;

-- 1. Users Table (for Authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_VALUE
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    duration VARCHAR(50)
);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    course_id INT,
    semester INT,
    section VARCHAR(10),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

-- 4. Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    course_id INT,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    marked_by INT, -- Teacher's user_id
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id),
    FOREIGN KEY (marked_by) REFERENCES users(user_id)
);

-- Sample Data Insertion

-- Insert Courses
INSERT INTO courses (course_name, course_code, description, duration) VALUES
('Bachelor of Computer Applications', 'BCA', 'Undergraduate course in computer applications.', '3 Years'),
('Bachelor of Commerce', 'BCom', 'Undergraduate course in commerce and finance.', '3 Years'),
('Bachelor of Arts', 'BA', 'Undergraduate course in humanities and social sciences.', '3 Years'),
('Bachelor of Business Administration', 'BBA', 'Undergraduate course in business management.', '3 Years'),
('Bachelor of Science', 'BSc', 'Undergraduate course in science subjects.', '3 Years'),
('Master of Arts', 'MA', 'Postgraduate course in arts.', '2 Years'),
('Master of Commerce', 'MCom', 'Postgraduate course in commerce.', '2 Years');

-- Insert Users (Teachers and Students)
-- Passwords should be hashed in a real application
INSERT INTO users (username, password, role, full_name, email) VALUES
('teacher123', 'pass123', 'teacher', 'Prof. Rajesh Kumar', 'rajesh@rsdcollege.com'),
('student123', 'pass123', 'student', 'Amit Sharma', 'amit@gmail.com'),
('student124', 'pass123', 'student', 'Priya Singh', 'priya@gmail.com'),
('student125', 'pass123', 'student', 'Rahul Verma', 'rahul@gmail.com'),
('student126', 'pass123', 'student', 'Sonia Kaur', 'sonia@gmail.com'),
('student127', 'pass123', 'student', 'Vikram Jeet', 'vikram@gmail.com'),
('student128', 'pass123', 'student', 'Deepak Gill', 'deepak@gmail.com'),
('student129', 'pass123', 'student', 'Manpreet Kaur', 'manpreet@gmail.com'),
('student130', 'pass123', 'student', 'Jaspreet Singh', 'jaspreet@gmail.com'),
('student131', 'pass123', 'student', 'Kavita Rani', 'kavita@gmail.com'),
('student132', 'pass123', 'student', 'Rohan Mehra', 'rohan@gmail.com'),
('student133', 'pass123', 'student', 'Simran Kaur', 'simran@gmail.com'),
('student134', 'pass123', 'student', 'Arjun Dev', 'arjun@gmail.com'),
('student135', 'pass123', 'student', 'Neha Gupta', 'neha@gmail.com'),
('student136', 'pass123', 'student', 'Sahil Khan', 'sahil@gmail.com'),
('student137', 'pass123', 'student', 'Anjali Sharma', 'anjali@gmail.com'),
('student138', 'pass123', 'student', 'Gaurav Kumar', 'gaurav@gmail.com'),
('student139', 'pass123', 'student', 'Ishita Paul', 'ishita@gmail.com'),
('student140', 'pass123', 'student', 'Karan Singh', 'karan@gmail.com'),
('student141', 'pass123', 'student', 'Pooja Devi', 'pooja@gmail.com');

-- Insert Students mapping
INSERT INTO students (user_id, roll_no, course_id, semester, section) VALUES
(2, 'RSD-2023-001', 1, 1, 'A'),
(3, 'RSD-2023-002', 1, 1, 'A'),
(4, 'RSD-2023-003', 1, 1, 'A'),
(5, 'RSD-2023-004', 1, 1, 'A'),
(6, 'RSD-2023-005', 1, 1, 'A'),
(7, 'RSD-2023-006', 2, 1, 'B'),
(8, 'RSD-2023-007', 2, 1, 'B'),
(9, 'RSD-2023-008', 2, 1, 'B'),
(10, 'RSD-2023-009', 2, 1, 'B'),
(11, 'RSD-2023-010', 2, 1, 'B'),
(12, 'RSD-2023-011', 3, 1, 'C'),
(13, 'RSD-2023-012', 3, 1, 'C'),
(14, 'RSD-2023-013', 3, 1, 'C'),
(15, 'RSD-2023-014', 3, 1, 'C'),
(16, 'RSD-2023-015', 3, 1, 'C'),
(17, 'RSD-2023-016', 4, 1, 'D'),
(18, 'RSD-2023-017', 4, 1, 'D'),
(19, 'RSD-2023-018', 4, 1, 'D'),
(20, 'RSD-2023-019', 4, 1, 'D'),
(21, 'RSD-2023-020', 4, 1, 'D');

-- Sample Attendance Data
INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES
(1, 1, '2023-10-01', 'Present', 1),
(2, 1, '2023-10-01', 'Present', 1),
(3, 1, '2023-10-01', 'Absent', 1),
(4, 1, '2023-10-01', 'Present', 1),
(5, 1, '2023-10-01', 'Present', 1);

-- Comments:
-- 1. Import this file into your MySQL server using: SOURCE rsd_college_db.sql;
-- 2. Ensure the 'users' table is populated before 'students' and 'attendance'.
-- 3. The 'marked_by' field in 'attendance' refers to the teacher's user_id.
