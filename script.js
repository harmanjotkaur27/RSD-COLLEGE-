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
let attendanceData = [];
let currentStudents = [];
let studentAttendance = [];
let lastSavedReportContext = null;

// Sample student list for fallback/demo use only
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

    // Call PHP login endpoint
    fetch('http://localhost:8000/php/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: pass,
            role: role
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            currentUser = {
                id: data.user.id,
                username: data.user.username,
                role: data.user.role,
                name: data.user.name,
                course: data.user.course || null,
                studentId: data.user.studentId || null
            };
            localStorage.setItem('rsd_user', JSON.stringify(currentUser));
            updateAuthUI();
        } else {
            // Show generic error
            userError.textContent = 'Invalid username or password.';
            usernameInput.style.borderColor = 'var(--danger)';
            passError.textContent = 'Please check your credentials.';
            passwordInput.style.borderColor = 'var(--danger)';
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        userError.textContent = 'Connection error. Please try again.';
        usernameInput.style.borderColor = 'var(--danger)';
    });
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
        <div style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 0; overflow-x: auto; white-space: nowrap;">
            <button class="btn-tab active" id="tab-mark" onclick="switchTeacherTab('mark')">Mark Attendance</button>
            <button class="btn-tab" id="tab-import" onclick="switchTeacherTab('import')">Import Attendance</button>
            <button class="btn-tab" id="tab-stats" onclick="switchTeacherTab('stats')">Batch Statistics</button>
            <button class="btn-tab" id="tab-search" onclick="switchTeacherTab('search')">Student Search</button>
            <button class="btn-tab" id="tab-daily" onclick="switchTeacherTab('daily')">Daily Reports</button>
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
            <div id="report-buttons-container" style="display: none; margin-top: 1rem;"></div>
        </div>

        <div id="teacher-import-section" style="display: none;">
            <div class="attendance-controls">
                <div class="form-group">
                    <label>Select Course</label>
                    <select id="import-course-select">
                        <option value="BCA">BCA</option>
                        <option value="BCom">BCom</option>
                        <option value="BA">BA</option>
                        <option value="BBA">BBA</option>
                        <option value="BSc">BSc</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Semester</label>
                    <select id="import-semester-select">
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
                    <input type="date" id="import-attendance-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div class="attendance-controls" style="margin-top: 1rem;">
                <div class="form-group" style="flex: 1;">
                    <label>Upload CSV or PDF File</label>
                    <input type="file" id="import-file" accept=".csv,.pdf" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <button class="btn-login" onclick="importAttendance()" style="margin-top: 25px; width: auto;">Import Attendance</button>
            </div>
            <div id="import-result-container" class="attendance-table-container" style="margin-top: 2rem;">
                <p style="text-align: center; color: #666;">Upload a CSV or PDF file to import attendance records.</p>
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
        'import': document.getElementById('teacher-import-section'),
        'stats': document.getElementById('teacher-stats-section'),
        'search': document.getElementById('teacher-search-section'),
        'daily': document.getElementById('teacher-daily-section')
    };
    const tabs = {
        'mark': document.getElementById('tab-mark'),
        'import': document.getElementById('tab-import'),
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

    container.innerHTML = '<p style="text-align: center; padding: 20px;">Loading report...</p>';

    let url = `http://localhost:8000/php/get_attendance_batch.php?date=${encodeURIComponent(date)}`;
    if (courseFilter !== 'all') {
        url += `&course=${encodeURIComponent(courseFilter)}`;
    }

    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const filteredAttendance = data.records;
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
                                ${filteredAttendance.map(a => `
                                    <tr>
                                        <td>${a.roll_no || 'N/A'}</td>
                                        <td>${a.studentName || 'Unknown'}</td>
                                        <td>${a.course}</td>
                                        <td>Sem ${a.semester}</td>
                                        <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<p style="text-align: center; padding: 20px;">No attendance records found for this date.</p>'}
                </div>
            `;
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading report.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading daily report:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Connection error.</p>';
    });
};

window.loadBatchStats = function() {
    const course = document.getElementById('stats-course-select').value;
    const semester = parseInt(document.getElementById('stats-semester-select').value);
    const container = document.getElementById('batch-stats-container');

    container.innerHTML = '<p style="text-align: center; padding: 20px;">Loading batch stats...</p>';
    
    const url = `http://localhost:8000/php/get_attendance_batch.php?course=${encodeURIComponent(course)}&semester=${encodeURIComponent(semester)}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const batchAttendance = data.records;
            const studentMap = {};
            batchAttendance.forEach(record => {
                const id = record.student_id;
                if (!studentMap[id]) {
                    studentMap[id] = {
                        roll_no: record.roll_no,
                        studentName: record.studentName,
                        total: 0,
                        present: 0
                    };
                }
                studentMap[id].total++;
                if (record.status === 'Present') studentMap[id].present++;
            });

            const students = Object.values(studentMap);
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
                const percent = student.total > 0 ? ((student.present / student.total) * 100).toFixed(1) : 0;
                html += `
                    <tr style="cursor: pointer;">
                        <td>${student.roll_no}</td>
                        <td>${student.studentName}</td>
                        <td>${student.total}</td>
                        <td>${student.present}</td>
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
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading batch stats.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading batch stats:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Connection error.</p>';
    });
};

window.showStudentHistoryForTeacher = function(studentId, course, semester) {
    const modal = document.getElementById('attendance-modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = '<p style="padding: 20px; text-align: center;">Loading student history...</p>';
    modal.style.display = 'flex';

    fetch(`http://localhost:8000/php/get_attendance.php?student_id=${encodeURIComponent(studentId)}`)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const studentRecord = INITIAL_STUDENTS.find(s => s.id === studentId) || { name: 'Student', roll: 'N/A' };
            const filteredHistory = data.history.filter(a => a.course === course && parseInt(a.semester) === semester);

            modalBody.innerHTML = `
                <div style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #eee;">
                    <h4 style="color: var(--primary-blue);">${studentRecord.name} (${studentRecord.roll})</h4>
                    <p style="font-size: 0.9rem; color: #666;">${course} - Semester ${semester}</p>
                </div>
                <div class="attendance-table-container" style="max-height: 300px; overflow-y: auto;">
                    <table style="font-size: 0.9rem; width: 100%;">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Marked By</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredHistory.length > 0 ? filteredHistory.sort((a,b) => new Date(b.date) - new Date(a.date)).map(a => `
                                <tr>
                                    <td>${a.date}</td>
                                    <td><span class="status-badge ${a.status.toLowerCase()}">${a.status}</span></td>
                                    <td>${a.markedBy || 'System'}</td>
                                </tr>
                            `).join('') : `<tr><td colspan="3" style="text-align:center; padding: 20px;">No records found.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            modalBody.innerHTML = '<p style="padding: 20px; text-align: center;">Unable to load student history.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading student history:', error);
        modalBody.innerHTML = '<p style="padding: 20px; text-align: center;">Connection error.</p>';
    });
};

window.loadStudentList = function() {
    const course = document.getElementById('course-select').value;
    const semester = parseInt(document.getElementById('semester-select').value);
    const date = document.getElementById('attendance-date').value;
    const container = document.getElementById('student-list-container');
    const saveBtn = document.getElementById('save-btn-container');
    
    container.innerHTML = '<p style="text-align: center; padding: 20px;">Loading students...</p>';
    saveBtn.style.display = 'none';
    document.getElementById('report-buttons-container').style.display = 'none';
    document.getElementById('report-buttons-container').innerHTML = '';
    
    const url = `http://localhost:8000/php/get_students.php?course=${encodeURIComponent(course)}&semester=${encodeURIComponent(semester)}&date=${encodeURIComponent(date)}`;
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const students = data.students;
            currentStudents = students; // Store for saving
            
            if (students.length === 0) {
                container.innerHTML = '<p style="text-align: center; padding: 20px;">No students found for this course and semester.</p>';
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
                const presentChecked = student.attendance_status !== 'Absent' ? 'checked' : '';
                const absentChecked = student.attendance_status === 'Absent' ? 'checked' : '';
                html += `
                    <tr>
                        <td>${student.roll_no}</td>
                        <td>${student.full_name}</td>
                        <td>
                            <label style="margin-right: 15px;"><input type="radio" name="status_${student.student_id}" value="Present" ${presentChecked}> Present</label>
                            <label><input type="radio" name="status_${student.student_id}" value="Absent" ${absentChecked}> Absent</label>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
            container.innerHTML = html;
            saveBtn.style.display = 'block';
        } else {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Error loading students.</p>';
        }
    })
    .catch(error => {
        console.error('Error loading students:', error);
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Connection error.</p>';
    });
};

window.saveAttendance = function() {
    const course = document.getElementById('course-select').value;
    const semester = parseInt(document.getElementById('semester-select').value);
    const date = document.getElementById('attendance-date').value;
    
    const attendance = currentStudents.map(student => ({
        studentId: student.student_id,
        roll_no: student.roll_no,
        full_name: student.full_name,
        status: document.querySelector(`input[name="status_${student.student_id}"]:checked`).value
    }));
    
    fetch('http://localhost:8000/php/save_attendance.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            attendance: attendance,
            date: date,
            course_code: course,
            teacher_id: currentUser.id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            lastSavedReportContext = {
                attendance,
                date,
                course_code: course,
                semester,
                teacher_id: currentUser.id
            };
            renderReportButtons();
            alert('Attendance saved successfully! You can now download the report.');
        } else {
            alert('Error saving attendance: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving attendance:', error);
        alert('Connection error while saving attendance.');
    });
};

function renderReportButtons() {
    const container = document.getElementById('report-buttons-container');
    if (!lastSavedReportContext) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
            <span style="font-weight: 600; margin-right: 0.5rem;">Download report:</span>
            <button class="btn-login" onclick="downloadAttendanceReport('csv')" style="width: auto;">CSV</button>
            <button class="btn-login" onclick="downloadAttendanceReport('pdf')" style="width: auto;">PDF</button>
        </div>
    `;
    container.style.display = 'block';
}

window.downloadAttendanceReport = async function(format) {
    if (!lastSavedReportContext) {
        alert('No saved attendance available for download.');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/php/report.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...lastSavedReportContext, format })
        });

        const contentType = response.headers.get('content-type') || '';
        if (!response.ok) {
            if (contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Report generation failed.');
            }
            throw new Error('Report generation failed.');
        }

        if (contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Report generation failed.');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const fileName = `attendance-report-${lastSavedReportContext.date}-${lastSavedReportContext.course_code}.${format}`;

        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading report:', error);
        alert(error.message || 'Could not download the report.');
    }
};

// Store parsed attendance for saving
let parsedImportData = null;

window.importAttendance = async function() {
    const fileInput = document.getElementById('import-file');
    const container = document.getElementById('import-result-container');

    if (!fileInput.files[0]) {
        alert('Please select a file to import.');
        return;
    }

    const file = fileInput.files[0];
    const allowedTypes = ['text/csv', 'application/pdf'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.pdf')) {
        alert('Please select a CSV or PDF file.');
        return;
    }

    container.innerHTML = '<p style="text-align: center; padding: 20px;">Parsing file...</p>';

    try {
        // Get form values - these will be overridden if CSV has metadata
        const course = document.getElementById('import-course-select').value;
        const semester = document.getElementById('import-semester-select').value;
        const date = document.getElementById('import-attendance-date').value;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('course_code', course);
        formData.append('semester', semester);
        formData.append('date', date);
        formData.append('teacher_id', currentUser.id);

        const response = await fetch('http://localhost:8000/php/import.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (result.status === 'success') {
            // Store parsed data for later saving
            parsedImportData = result;
            const records = result.attendance || [];
            
            // Autofill form fields with metadata from file
            if (result.metadata) {
                document.getElementById('import-course-select').value = result.metadata.course_code;
                document.getElementById('import-semester-select').value = result.metadata.semester;
                document.getElementById('import-attendance-date').value = result.metadata.date;
            }
            
            // Display preview table
            const previewHTML = `
                <div style="padding: 20px;">
                    <h3 style="color: var(--success); margin-bottom: 15px;">File Parsed Successfully!</h3>
                    <p style="margin-bottom: 15px;"><strong>Records Found: ${records.length}</strong></p>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                            <thead>
                                <tr style="background: var(--accent-blue); color: white;">
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Roll No</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Student Name</th>
                                    <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${records.map(r => `
                                    <tr>
                                        <td style="padding: 10px; border: 1px solid #ddd;">${r.roll_no || '-'}</td>
                                        <td style="padding: 10px; border: 1px solid #ddd;">${r.full_name || '-'}</td>
                                        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: ${r.status === 'Present' ? 'green' : 'red'};">${r.status}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="btn-group">
                        <button class="btn-login" onclick="saveImportedAttendance()">Save to Database</button>
                        <button class="btn-secondary" onclick="clearImportPreview()">Cancel</button>
                    </div>
                </div>
            `;
            container.innerHTML = previewHTML;
        } else {
            container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 20px;">Parse failed: ${result.message}</p>`;
            parsedImportData = null;
        }
    } catch (error) {
        console.error('Error importing attendance:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 20px;">Connection error during import.</p>';
        parsedImportData = null;
    }
};

window.saveImportedAttendance = async function() {
    if (!parsedImportData) {
        alert('No parsed data to save.');
        return;
    }

    const course = document.getElementById('import-course-select').value;
    const semester = parseInt(document.getElementById('import-semester-select').value);
    const date = document.getElementById('import-attendance-date').value;
    const container = document.getElementById('import-result-container');
    
    container.innerHTML = '<p style="text-align: center; padding: 20px;">Saving to database...</p>';

    try {
        // Convert parsed format to attendance format expected by save endpoint
        const attendance = parsedImportData.attendance.map(rec => ({
            studentId: -1,  // Will be looked up by roll_no in PHP
            roll_no: rec.roll_no,
            status: rec.status
        }));

        const response = await fetch('http://localhost:8000/php/save_attendance.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                attendance: attendance,
                date: date,
                course_code: course,
                semester: semester,
                teacher_id: currentUser.id
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: var(--success);">Saved Successfully!</h3>
                    <p>${result.saved_count || parsedImportData.count} attendance records saved to database.</p>
                </div>
            `;
            parsedImportData = null;
        } else {
            container.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 20px;">Save failed: ${result.message}</p>`;
        }
    } catch (error) {
        console.error('Error saving attendance:', error);
        container.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 20px;">Connection error during save.</p>';
    }
};

window.clearImportPreview = function() {
    parsedImportData = null;
    document.getElementById('import-file').value = '';
    document.getElementById('import-result-container').innerHTML = '<p style="text-align: center; color: #666;">Upload a CSV or PDF file to import attendance records.</p>';
};

function renderStudentDashboard(container) {
    // Use student's course and standard semesters
    const courses = [currentUser.course];
    const semesters = [1, 2, 3, 4, 5, 6];

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
    const myAttendance = studentAttendance.slice();
    
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

    if (studentAttendance.length === 0) {
        fetch(`http://localhost:8000/php/get_attendance.php?student_id=${currentUser.studentId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                studentAttendance = data.history.map(h => ({
                    studentId: currentUser.studentId,
                    date: h.date,
                    course: h.course,
                    semester: parseInt(h.semester),
                    status: h.status,
                    markedBy: h.markedBy
                }));
                updateStudentView(); // Retry after loading
            } else {
                statsContainer.innerHTML = '<p>Error loading attendance data.</p>';
                historyContainer.innerHTML = '<p>Error loading attendance data.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading attendance:', error);
            statsContainer.innerHTML = '<p>Connection error.</p>';
            historyContainer.innerHTML = '<p>Connection error.</p>';
        });
        return;
    }

    let filteredAttendance = studentAttendance.filter(a => true); // Start with all

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
    const record = studentAttendance.find(a => 
        a.studentId === currentUser.studentId && 
        a.date === date && 
        a.course === course && 
        a.semester === semester
    );

    if (!record) return;

    const student = { name: currentUser.name, roll: currentUser.roll_no || 'N/A' };
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
