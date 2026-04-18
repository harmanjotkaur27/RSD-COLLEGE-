/**
 * RSD College Ferozpur - Main Script
 * Handles SPA navigation, Authentication, and Attendance Portal logic.
 * 
 * NOTE: This script currently uses localStorage for demo purposes.
 * To use the PHP backend, you would replace the localStorage logic with 
 * fetch() calls to the scripts in the /php/ directory.
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// --- State Management ---
let currentUser = JSON.parse(localStorage.getItem('rsd_user')) || null;
let attendanceData = JSON.parse(localStorage.getItem('rsd_attendance')) || [];

// Initial Data if empty
const INITIAL_STUDENTS = [
    { id: 1, name: 'Amit Sharma', roll: 'RSD-2023-001', course: 'BCA', semester: 1, username: 'student123', password: 'pass123' },
    { id: 2, name: 'Priya Singh', roll: 'RSD-2023-002', course: 'BCA', semester: 1, username: 'student124', password: 'pass123' },
    { id: 3, name: 'Rahul Verma', roll: 'RSD-2023-003', course: 'BCA', semester: 1, username: 'student125', password: 'pass123' },
    { id: 4, name: 'Sonia Kaur', roll: 'RSD-2023-004', course: 'BCA', semester: 1, username: 'student126', password: 'pass123' },
    { id: 5, name: 'Vikram Jeet', roll: 'RSD-2023-005', course: 'BCA', semester: 1, username: 'student127', password: 'pass123' },
    { id: 6, name: 'Deepak Gill', roll: 'RSD-2023-006', course: 'BCom', semester: 1, username: 'student128', password: 'pass123' },
    { id: 7, name: 'Manpreet Kaur', roll: 'RSD-2023-007', course: 'BCom', semester: 1, username: 'student129', password: 'pass123' },
    { id: 8, name: 'Jaspreet Singh', roll: 'RSD-2023-008', course: 'BCom', semester: 1, username: 'student130', password: 'pass123' },
    { id: 9, name: 'Kavita Rani', roll: 'RSD-2023-009', course: 'BCom', semester: 1, username: 'student131', password: 'pass123' },
    { id: 10, name: 'Rohan Mehra', roll: 'RSD-2023-010', course: 'BCom', semester: 1, username: 'student132', password: 'pass123' },
    { id: 11, name: 'Simran Kaur', roll: 'RSD-2023-011', course: 'BA', semester: 1, username: 'student133', password: 'pass123' },
    { id: 12, name: 'Arjun Dev', roll: 'RSD-2023-012', course: 'BA', semester: 1, username: 'student134', password: 'pass123' },
    { id: 13, name: 'Neha Gupta', roll: 'RSD-2023-013', course: 'BA', semester: 1, username: 'student135', password: 'pass123' },
    { id: 14, name: 'Sahil Khan', roll: 'RSD-2023-014', course: 'BA', semester: 1, username: 'student136', password: 'pass123' },
    { id: 15, name: 'Anjali Sharma', roll: 'RSD-2023-015', course: 'BA', semester: 1, username: 'student137', password: 'pass123' },
    { id: 16, name: 'Gaurav Kumar', roll: 'RSD-2023-016', course: 'BBA', semester: 1, username: 'student138', password: 'pass123' },
    { id: 17, name: 'Ishita Paul', roll: 'RSD-2023-017', course: 'BBA', semester: 1, username: 'student139', password: 'pass123' },
    { id: 18, name: 'Karan Singh', roll: 'RSD-2023-018', course: 'BBA', semester: 1, username: 'student140', password: 'pass123' },
    { id: 19, name: 'Pooja Devi', roll: 'RSD-2023-019', course: 'BBA', semester: 1, username: 'student141', password: 'pass123' },
    { id: 20, name: 'Suresh Kumar', roll: 'RSD-2023-020', course: 'BBA', semester: 1, username: 'student142', password: 'pass123' }
];

// Pre-populate sample attendance if empty
if (attendanceData.length === 0) {
    const dates = ['2024-03-20', '2024-03-21', '2024-03-22', '2024-03-23', '2024-03-24'];
    INITIAL_STUDENTS.forEach(student => {
        dates.forEach(date => {
            attendanceData.push({
                studentId: student.id,
                course: student.course,
                semester: student.semester,
                date: date,
                status: Math.random() > 0.2 ? 'Present' : 'Absent',
                markedBy: 'Prof. Rajesh Kumar'
            });
        });
    });
    localStorage.setItem('rsd_attendance', JSON.stringify(attendanceData));
}

function initApp() {
    setupNavigation();
    setupMobileMenu();
    updateAuthUI();
    
    // Default to home
    showSection('home');
}

// --- Navigation Logic ---
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Close mobile menu if open
            document.querySelector('.nav-menu').classList.remove('active');
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function setupMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// --- Authentication Logic ---
function updateAuthUI() {
    const loginForm = document.getElementById('login-form-container');
    const dashboard = document.getElementById('dashboard-container');
    
    if (currentUser) {
        loginForm.style.display = 'none';
        dashboard.style.display = 'block';
        renderDashboard();
    } else {
        loginForm.style.display = 'block';
        dashboard.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const pass = passwordInput.value;
    const role = document.getElementById('role').value;
    
    const userError = document.getElementById('username-error');
    const passError = document.getElementById('password-error');
    
    // Clear previous errors
    userError.textContent = '';
    passError.textContent = '';
    usernameInput.style.borderColor = '#ddd';
    passwordInput.style.borderColor = '#ddd';

    // Teacher Login
    if (role === 'teacher') {
        if (username === 'teacher123' && pass === 'pass123') {
            currentUser = {
                username: username,
                role: role,
                name: 'Prof. Rajesh Kumar',
                course: null,
                studentId: null
            };
            localStorage.setItem('rsd_user', JSON.stringify(currentUser));
            updateAuthUI();
            return;
        } else if (username !== 'teacher123') {
            userError.textContent = 'Teacher username not found.';
            usernameInput.style.borderColor = 'var(--danger)';
        } else {
            passError.textContent = 'Incorrect password for teacher account.';
            passwordInput.style.borderColor = 'var(--danger)';
        }
    }

    // Student Login
    if (role === 'student') {
        const student = INITIAL_STUDENTS.find(s => s.username === username);
        if (student) {
            if (student.password === pass) {
                currentUser = {
                    username: username,
                    role: role,
                    name: student.name,
                    course: student.course,
                    studentId: student.id
                };
                localStorage.setItem('rsd_user', JSON.stringify(currentUser));
                updateAuthUI();
                return;
            } else {
                passError.textContent = 'Incorrect password for student account.';
                passwordInput.style.borderColor = 'var(--danger)';
            }
        } else {
            userError.textContent = 'Student username not found.';
            usernameInput.style.borderColor = 'var(--danger)';
        }
    }
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('rsd_user');
    updateAuthUI();
}

// --- Dashboard Rendering ---
function renderDashboard() {
    const userInfo = document.getElementById('user-display-name');
    const userRole = document.getElementById('user-display-role');
    const dashboardContent = document.getElementById('dashboard-content');
    
    userInfo.textContent = currentUser.name;
    userRole.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    
    if (currentUser.role === 'teacher') {
        renderTeacherDashboard(dashboardContent);
    } else {
        renderStudentDashboard(dashboardContent);
    }
}

function renderTeacherDashboard(container) {
    container.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; overflow-x: auto; white-space: nowrap;">
            <button class="nav-link active" id="tab-mark" onclick="switchTeacherTab('mark')">Mark Attendance</button>
            <button class="nav-link" id="tab-stats" onclick="switchTeacherTab('stats')">Batch Statistics</button>
            <button class="nav-link" id="tab-search" onclick="switchTeacherTab('search')">Student Search</button>
            <button class="nav-link" id="tab-daily" onclick="switchTeacherTab('daily')">Daily Reports</button>
        </div>

        <div id="teacher-mark-section">
            <div class="attendance-controls">
                <div class="form-group">
                    <label>Select Course</label>
                    <select id="course-select">
                        <option value="BCA">BCA</option>
                        <option value="BCom">BCom</option>
                        <option value="BA">BA</option>
                        <option value="BBA">BBA</option>
                        <option value="BSc">BSc</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="semester-select">
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Date</label>
                    <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <button class="btn-login" onclick="loadStudentList()" style="margin-top: 25px; width: auto;">Load Students</button>
            </div>
            <div id="student-list-container" class="attendance-table-container">
                <p style="text-align: center; color: #666;">Select course, semester and date to mark attendance.</p>
            </div>
            <div id="save-btn-container" style="display: none; margin-top: 2rem;">
                <button class="btn-login" onclick="saveAttendance()">Save Attendance</button>
            </div>
        </div>

        <div id="teacher-stats-section" style="display: none;">
            <div class="attendance-controls">
                <div class="form-group">
                    <label>Select Course</label>
                    <select id="stats-course-select">
                        <option value="BCA">BCA</option>
                        <option value="BCom">BCom</option>
                        <option value="BA">BA</option>
                        <option value="BBA">BBA</option>
                        <option value="BSc">BSc</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="stats-semester-select">
                        <option value="1">Semester 1</option>
                        <option value="2">Semester 2</option>
                        <option value="3">Semester 3</option>
                        <option value="4">Semester 4</option>
                        <option value="5">Semester 5</option>
                        <option value="6">Semester 6</option>
                    </select>
                </div>
                <button class="btn-login" onclick="loadBatchStats()" style="margin-top: 25px; width: auto;">View Statistics</button>
            </div>
            <div id="batch-stats-container" class="attendance-table-container">
                <p style="text-align: center; color: #666;">Select course and semester to view batch statistics.</p>
            </div>
        </div>

        <div id="teacher-search-section" style="display: none;">
            <div class="attendance-controls">
                <div class="form-group" style="flex: 1;">
                    <label>Search Student (Name or Roll No)</label>
                    <input type="text" id="student-search-input" placeholder="e.g. Amit or RSD-2023-001" onkeyup="searchStudentForTeacher()">
                </div>
            </div>
            <div id="search-results-container" class="attendance-table-container">
                <p style="text-align: center; color: #666;">Enter name or roll number to find a student.</p>
            </div>
        </div>

        <div id="teacher-daily-section" style="display: none;">
            <div class="attendance-controls">
                <div class="form-group">
                    <label>Select Date</label>
                    <input type="date" id="daily-report-date" value="${new Date().toISOString().split('T')[0]}" onchange="loadDailyReport()">
                </div>
                <div class="form-group">
                    <label>Course (Optional)</label>
                    <select id="daily-course-filter" onchange="loadDailyReport()">
                        <option value="all">All Courses</option>
                        <option value="BCA">BCA</option>
                        <option value="BCom">BCom</option>
                        <option value="BA">BA</option>
                        <option value="BBA">BBA</option>
                        <option value="BSc">BSc</option>
                    </select>
                </div>
            </div>
            <div id="daily-report-container">
                <!-- Daily report summary will be injected here -->
            </div>
        </div>
    `;
}

window.switchTeacherTab = function(tab) {
    const sections = {
        'mark': document.getElementById('teacher-mark-section'),
        'stats': document.getElementById('teacher-stats-section'),
        'search': document.getElementById('teacher-search-section'),
        'daily': document.getElementById('teacher-daily-section')
    };
    const tabs = {
        'mark': document.getElementById('tab-mark'),
        'stats': document.getElementById('tab-stats'),
        'search': document.getElementById('tab-search'),
        'daily': document.getElementById('tab-daily')
    };

    Object.keys(sections).forEach(key => {
        sections[key].style.display = (key === tab) ? 'block' : 'none';
        tabs[key].classList.toggle('active', key === tab);
    });

    if (tab === 'daily') loadDailyReport();
};

window.searchStudentForTeacher = function() {
    const query = document.getElementById('student-search-input').value.toLowerCase();
    const container = document.getElementById('search-results-container');
    
    if (query.length < 2) {
        container.innerHTML = '<p style="text-align: center; color: #666;">Enter at least 2 characters to search.</p>';
        return;
    }

    const results = INITIAL_STUDENTS.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.roll.toLowerCase().includes(query)
    );

    if (results.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No students found matching your search.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(s => `
                    <tr>
                        <td>${s.roll}</td>
                        <td>${s.name}</td>
                        <td>${s.course}</td>
                        <td>Sem ${s.semester}</td>
                        <td><button class="nav-link" style="color: var(--secondary-blue); font-weight: 600;" onclick="showStudentHistoryForTeacher(${s.id}, '${s.course}', ${s.semester})">View History</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    container.innerHTML = html;
};

window.loadDailyReport = function() {
    const date = document.getElementById('daily-report-date').value;
    const courseFilter = document.getElementById('daily-course-filter').value;
    const container = document.getElementById('daily-report-container');

    let filteredAttendance = attendanceData.filter(a => a.date === date);
    if (courseFilter !== 'all') {
        filteredAttendance = filteredAttendance.filter(a => a.course === courseFilter);
    }

    const totalMarked = filteredAttendance.length;
    const presentCount = filteredAttendance.filter(a => a.status === 'Present').length;
    const absentCount = totalMarked - presentCount;
    const percentage = totalMarked > 0 ? ((presentCount / totalMarked) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div class="attendance-summary" style="margin-top: 1.5rem;">
            <div class="stat-card">
                <h4>Total Records</h4>
                <div class="value">${totalMarked}</div>
            </div>
            <div class="stat-card">
                <h4>Present</h4>
                <div class="value" style="color: var(--success);">${presentCount}</div>
            </div>
            <div class="stat-card">
                <h4>Absent</h4>
                <div class="value" style="color: var(--danger);">${absentCount}</div>
            </div>
            <div class="stat-card">
                <h4>Attendance %</h4>
                <div class="value">${percentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        </div>

        <h3 style="margin: 2rem 0 1rem;">Detailed List for ${date}</h3>
        <div class="attendance-table-container">
            ${totalMarked > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Name</th>
                            <th>Course</th>
                            <th>Semester</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAttendance.map(a => {
                            const student = INITIAL_STUDENTS.find(s => s.id === a.studentId);
                            return `
                                <tr>
                                    <td>${student ? student.roll : 'N/A'}</td>
                                    <td>${student ? student.name : 'Unknown'}</td>
                                    <td>${a.course}</td>
                                    <td>Sem ${a.semester}</td>
                                    <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            ` : '<p style="text-align: center; padding: 20px;">No attendance records found for this date.</p>'}
        </div>
    `;
};

window.loadBatchStats = function() {
    const course = document.getElementById('stats-course-select').value;
    const semester = parseInt(document.getElementById('stats-semester-select').value);
    const container = document.getElementById('batch-stats-container');
    
    const students = INITIAL_STUDENTS.filter(s => s.course === course && s.semester === semester);
    
    if (students.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No students found for this batch.</p>';
        return;
    }

    // Calculate Aggregated Stats
    const batchAttendance = attendanceData.filter(a => a.course === course && a.semester === semester);
    const totalBatchClasses = [...new Set(batchAttendance.map(a => a.date))].length;
    const totalPossibleAttendances = students.length * totalBatchClasses;
    const totalPresentCount = batchAttendance.filter(a => a.status === 'Present').length;
    const batchPercentage = totalPossibleAttendances > 0 ? ((totalPresentCount / totalPossibleAttendances) * 100).toFixed(1) : 0;

    let html = `
        <div class="attendance-summary" style="margin-top: 1rem;">
            <div class="stat-card">
                <h4>Batch Total Classes</h4>
                <div class="value">${totalBatchClasses}</div>
            </div>
            <div class="stat-card">
                <h4>Total Present (All Students)</h4>
                <div class="value">${totalPresentCount}</div>
            </div>
            <div class="stat-card">
                <h4>Overall Batch Attendance</h4>
                <div class="value">${batchPercentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${batchPercentage}%"></div>
                </div>
            </div>
        </div>

        <h3 style="margin: 2rem 0 1rem;">Individual Student Breakdown</h3>
        <p style="font-size: 0.8rem; color: #666; margin-bottom: 1rem;">Click on a student row to view their detailed history.</p>
        <table>
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Total Classes</th>
                    <th>Present</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
    `;

    students.forEach(student => {
        const studentAttendance = attendanceData.filter(a => a.studentId === student.id && a.course === course && a.semester === semester);
        const total = studentAttendance.length;
        const present = studentAttendance.filter(a => a.status === 'Present').length;
        const percent = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        html += `
            <tr onclick="showStudentHistoryForTeacher(${student.id}, '${course}', ${semester})" style="cursor: pointer;">
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>${total}</td>
                <td>${present}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="progress-bar" style="width: 100px; margin-top: 0;">
                            <div class="progress-fill" style="width: ${percent}%"></div>
                        </div>
                        <span>${percent}%</span>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

window.showStudentHistoryForTeacher = function(studentId, course, semester) {
    const student = INITIAL_STUDENTS.find(s => s.id === studentId);
    const history = attendanceData.filter(a => a.studentId === studentId && a.course === course && a.semester === semester);
    
    const modal = document.getElementById('attendance-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
            <h4 style="color: var(--primary-blue);">${student.name} (${student.roll})</h4>
            <p style="font-size: 0.9rem; color: #666;">${course} - Semester ${semester}</p>
        </div>
        <div class="attendance-table-container" style="max-height: 300px; overflow-y: auto;">
            <table style="font-size: 0.9rem;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Marked By</th>
                    </tr>
                </thead>
                <tbody>
                    ${history.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
                        <tr>
                            <td>${a.date}</td>
                            <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                            <td>${a.markedBy || 'System'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    modal.style.display = 'flex';
};

window.loadStudentList = function() {
    const course = document.getElementById('course-select').value;
    const semester = parseInt(document.getElementById('semester-select').value);
    const container = document.getElementById('student-list-container');
    const saveBtn = document.getElementById('save-btn-container');
    
    const students = INITIAL_STUDENTS.filter(s => s.course === course && s.semester === semester);
    
    if (students.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No students found for this course and semester.</p>';
        saveBtn.style.display = 'none';
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    students.forEach(student => {
        html += `
            <tr>
                <td>${student.roll}</td>
                <td>${student.name}</td>
                <td>
                    <label style="margin-right: 15px;"><input type="radio" name="status_${student.id}" value="Present" checked> Present</label>
                    <label><input type="radio" name="status_${student.id}" value="Absent"> Absent</label>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    saveBtn.style.display = 'block';
};

window.saveAttendance = function() {
    const course = document.getElementById('course-select').value;
    const semester = parseInt(document.getElementById('semester-select').value);
    const date = document.getElementById('attendance-date').value;
    const students = INITIAL_STUDENTS.filter(s => s.course === course && s.semester === semester);
    
    students.forEach(student => {
        const status = document.querySelector(`input[name="status_${student.id}"]:checked`).value;
        
        // Check if record exists for this date/student/course/semester
        const existingIndex = attendanceData.findIndex(a => a.studentId === student.id && a.date === date && a.course === course && a.semester === semester);
        
        const record = {
            studentId: student.id,
            course: course,
            semester: semester,
            date: date,
            status: status,
            markedBy: currentUser.name // Store teacher's name
        };
        
        if (existingIndex > -1) {
            attendanceData[existingIndex] = record;
        } else {
            attendanceData.push(record);
        }
    });
    
    localStorage.setItem('rsd_attendance', JSON.stringify(attendanceData));
    alert('Attendance saved successfully!');
};

function renderStudentDashboard(container) {
    // Get unique courses and semesters for this student from their records
    const myFullAttendance = attendanceData.filter(a => a.studentId === currentUser.studentId);
    const courses = [...new Set(myFullAttendance.map(a => a.course))];
    const semesters = [...new Set(myFullAttendance.map(a => a.semester))].sort();

    container.innerHTML = `
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
            <button class="nav-link active" id="student-tab-history" onclick="switchStudentTab('history')">Attendance History</button>
            <button class="nav-link" id="student-tab-yearly" onclick="switchStudentTab('yearly')">Academic Year Overview</button>
        </div>

        <div id="student-history-section">
            <div class="attendance-controls" style="background: var(--accent-blue); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <div class="form-group" style="flex: 1; min-width: 150px; margin-bottom: 0;">
                    <label>Filter by Course</label>
                    <select id="student-course-filter" onchange="updateStudentView()">
                        <option value="all">All Courses</option>
                        ${courses.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="flex: 1; min-width: 150px; margin-bottom: 0;">
                    <label>Filter by Semester</label>
                    <select id="student-semester-filter" onchange="updateStudentView()">
                        <option value="all">All Semesters</option>
                        ${semesters.map(s => `<option value="${s}">Semester ${s}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group" style="flex: 1; min-width: 150px; margin-bottom: 0;">
                    <label>Filter by Date</label>
                    <input type="date" id="student-date-filter" onchange="updateStudentView()">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button class="nav-link" style="padding: 0.5rem; font-size: 0.8rem;" onclick="resetStudentFilters()">Reset Filters</button>
                </div>
            </div>

            <div id="student-stats-container">
                <!-- Stats will be injected here -->
            </div>
            
            <h3 style="margin-top: 2rem;">Attendance History</h3>
            <div id="student-history-container" class="attendance-table-container">
                <!-- History table will be injected here -->
            </div>
        </div>

        <div id="student-yearly-section" style="display: none;">
            <h3 style="margin-bottom: 1.5rem;">Performance by Academic Year</h3>
            <div id="yearly-overview-container">
                <!-- Yearly stats will be injected here -->
            </div>
        </div>
    `;

    // Initial render of stats and history
    updateStudentView();
}

window.switchStudentTab = function(tab) {
    const historySection = document.getElementById('student-history-section');
    const yearlySection = document.getElementById('student-yearly-section');
    const tabHistory = document.getElementById('student-tab-history');
    const tabYearly = document.getElementById('student-tab-yearly');

    if (tab === 'history') {
        historySection.style.display = 'block';
        yearlySection.style.display = 'none';
        tabHistory.classList.add('active');
        tabYearly.classList.remove('active');
        updateStudentView();
    } else {
        historySection.style.display = 'none';
        yearlySection.style.display = 'block';
        tabHistory.classList.remove('active');
        tabYearly.classList.add('active');
        renderYearlyOverview();
    }
};

function getAcademicYear(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    
    // Academic year starts in July (month 6)
    if (month >= 6) {
        return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
        return `${year - 1}-${year.toString().slice(-2)}`;
    }
}

window.renderYearlyOverview = function() {
    const container = document.getElementById('yearly-overview-container');
    const myAttendance = attendanceData.filter(a => a.studentId === currentUser.studentId);
    
    if (myAttendance.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">No attendance records found.</p>';
        return;
    }

    // Group by academic year
    const yearlyData = {};
    myAttendance.forEach(record => {
        const ay = getAcademicYear(record.date);
        if (!yearlyData[ay]) {
            yearlyData[ay] = { total: 0, present: 0, courses: new Set() };
        }
        yearlyData[ay].total++;
        if (record.status === 'Present') yearlyData[ay].present++;
        yearlyData[ay].courses.add(record.course);
    });

    const sortedYears = Object.keys(yearlyData).sort().reverse();

    let html = '';
    sortedYears.forEach(ay => {
        const data = yearlyData[ay];
        const percent = ((data.present / data.total) * 100).toFixed(1);
        
        html += `
            <div class="stat-card" style="text-align: left; margin-bottom: 1.5rem; display: block; border-left: 5px solid var(--secondary-blue);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="font-size: 1.2rem; color: var(--primary-blue); margin: 0;">Session ${ay}</h4>
                    <span class="status-badge ${percent >= 75 ? 'present' : 'absent'}" style="font-size: 1rem;">${percent}%</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <p style="font-size: 0.8rem; color: #666;">Total Working Days</p>
                        <p style="font-size: 1.5rem; font-weight: 700;">${data.total}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.8rem; color: #666;">Days Attended</p>
                        <p style="font-size: 1.5rem; font-weight: 700; color: var(--success);">${data.present}</p>
                    </div>
                    <div>
                        <p style="font-size: 0.8rem; color: #666;">Courses Covered</p>
                        <p style="font-size: 1rem; font-weight: 600;">${Array.from(data.courses).join(', ')}</p>
                    </div>
                </div>
                <div class="progress-bar" style="height: 12px; margin-top: 1.5rem;">
                    <div class="progress-fill" style="width: ${percent}%; background: ${percent >= 75 ? 'var(--success)' : 'var(--danger)'}"></div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

window.updateStudentView = function() {
    const courseFilter = document.getElementById('student-course-filter').value;
    const semesterFilter = document.getElementById('student-semester-filter').value;
    const dateFilter = document.getElementById('student-date-filter').value;
    const statsContainer = document.getElementById('student-stats-container');
    const historyContainer = document.getElementById('student-history-container');

    let filteredAttendance = attendanceData.filter(a => a.studentId === currentUser.studentId);

    if (courseFilter !== 'all') {
        filteredAttendance = filteredAttendance.filter(a => a.course === courseFilter);
    }
    if (semesterFilter !== 'all') {
        filteredAttendance = filteredAttendance.filter(a => a.semester === parseInt(semesterFilter));
    }
    if (dateFilter) {
        filteredAttendance = filteredAttendance.filter(a => a.date === dateFilter);
    }

    const totalWorkingDays = filteredAttendance.length;
    const daysAttended = filteredAttendance.filter(a => a.status === 'Present').length;
    const percentage = totalWorkingDays > 0 ? ((daysAttended / totalWorkingDays) * 100).toFixed(1) : 0;

    statsContainer.innerHTML = `
        <div class="attendance-summary">
            <div class="stat-card">
                <h4>College Working Days</h4>
                <div class="value">${totalWorkingDays}</div>
                <p style="font-size: 0.7rem; color: #888; margin-top: 5px;">(Based on selected filters)</p>
            </div>
            <div class="stat-card">
                <h4>Days Attended</h4>
                <div class="value">${daysAttended}</div>
            </div>
            <div class="stat-card">
                <h4>Attendance %</h4>
                <div class="value">${percentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        </div>
    `;

    historyContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Semester</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${filteredAttendance.length > 0 ? filteredAttendance.sort((a,b) => new Date(b.date) - new Date(a.date)).map((a, index) => `
                    <tr onclick="showAttendanceDetail('${a.date}', '${a.course}', ${a.semester})">
                        <td>${currentUser.name}</td>
                        <td>${a.date}</td>
                        <td>${a.course}</td>
                        <td>Sem ${a.semester}</td>
                        <td class="${a.status === 'Present' ? 'status-present' : 'status-absent'}">
                            <span class="status-badge ${a.status.toLowerCase()}">${a.status}</span>
                        </td>
                    </tr>
                `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 20px;">No records found for the selected filters.</td></tr>'}
            </tbody>
        </table>
    `;
};

window.resetStudentFilters = function() {
    document.getElementById('student-course-filter').value = 'all';
    document.getElementById('student-semester-filter').value = 'all';
    document.getElementById('student-date-filter').value = '';
    updateStudentView();
};

window.showAttendanceDetail = function(date, course, semester) {
    const record = attendanceData.find(a => 
        a.studentId === currentUser.studentId && 
        a.date === date && 
        a.course === course && 
        a.semester === semester
    );

    if (!record) return;

    const student = INITIAL_STUDENTS.find(s => s.id === record.studentId);
    const modal = document.getElementById('attendance-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="modal-detail-item">
            <span>Student Name:</span>
            <span>${student.name}</span>
        </div>
        <div class="modal-detail-item">
            <span>Roll No:</span>
            <span>${student.roll}</span>
        </div>
        <div class="modal-detail-item">
            <span>Date:</span>
            <span>${record.date}</span>
        </div>
        <div class="modal-detail-item">
            <span>Course:</span>
            <span>${record.course}</span>
        </div>
        <div class="modal-detail-item">
            <span>Semester:</span>
            <span>Semester ${record.semester}</span>
        </div>
        <div class="modal-detail-item">
            <span>Status:</span>
            <span class="${record.status === 'Present' ? 'status-present' : 'status-absent'}">${record.status}</span>
        </div>
        <div class="modal-detail-item">
            <span>Marked By:</span>
            <span>${record.markedBy || 'System Admin'}</span>
        </div>
    `;

    modal.style.display = 'flex';
};

window.closeModal = function() {
    document.getElementById('attendance-modal').style.display = 'none';
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('attendance-modal');
    if (event.target === modal) {
        closeModal();
    }
};

// Expose functions to window for inline event handlers
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
