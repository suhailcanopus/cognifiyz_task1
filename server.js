const express = require('express');
const path = require('path');

// Step 2: Set up a simple Node.js server using Express
const app = express();
const PORT = process.env.PORT || 3000;

// Step 4: Configure Server-Side Rendering engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing URL-encoded bodies from HTML Form Submissions (Step 3)
app.use(express.urlencoded({ extended: true }));
// Middleware for parsing JSON bodies (if needed)
app.use(express.json());
// Serve static assets (CSS, images, client scripts)
app.use(express.static(path.join(__dirname, 'public')));
// Also serve existing js and css directories from workspace if needed
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// ==========================================
// In-Memory Data Store (Simulated Database)
// ==========================================
let students = [
  {
    id: 1,
    rollNo: '10A-01',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    grade: 'Grade 10-A',
    gender: 'Male',
    contactNumber: '+91 98765 43210',
    attendanceRate: 94,
    status: 'Active',
    enrolledAt: new Date('2026-08-15').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  },
  {
    id: 2,
    rollNo: '10A-02',
    fullName: 'Ananya Verma',
    email: 'ananya.v@example.com',
    grade: 'Grade 10-A',
    gender: 'Female',
    contactNumber: '+91 98765 43211',
    attendanceRate: 88,
    status: 'Active',
    enrolledAt: new Date('2026-08-16').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  },
  {
    id: 3,
    rollNo: '9B-05',
    fullName: 'Rohan Gupta',
    email: 'rohan.g@example.com',
    grade: 'Grade 9-B',
    gender: 'Male',
    contactNumber: '+91 98765 43212',
    attendanceRate: 72,
    status: 'Defaulter Risk',
    enrolledAt: new Date('2026-08-20').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }
];

let leaveRequests = [
  {
    id: 1,
    studentName: 'Aarav Sharma',
    rollNo: '10A-01',
    category: 'Medical',
    startDate: '2026-10-05',
    daysCount: 2,
    reason: 'Viral fever symptoms, doctor recommended rest.',
    status: 'Approved',
    submittedAt: 'Oct 1, 2026 09:30 AM'
  },
  {
    id: 2,
    studentName: 'Ananya Verma',
    rollNo: '10A-02',
    category: 'Competition',
    startDate: '2026-10-10',
    daysCount: 3,
    reason: 'Representing school at Inter-District Science Olympiad.',
    status: 'Pending',
    submittedAt: 'Oct 1, 2026 04:15 PM'
  }
];

// Helper to calculate summary statistics for dynamic rendering
function getStats() {
  const total = students.length;
  const avgAttendance = total > 0 
    ? Math.round(students.reduce((acc, s) => acc + (s.attendanceRate || 0), 0) / total) 
    : 0;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending').length;
  return { totalStudents: total, avgAttendance, pendingLeaves, totalLeaves: leaveRequests.length };
}

// ==========================================
// ROUTES & ENDPOINTS (Steps 1, 3 & 4)
// ==========================================

/**
 * 1. Home Route: Server-Side Renders HTML page with User Input Forms
 */
app.get('/', (req, res) => {
  const stats = getStats();
  res.render('index', {
    pageTitle: 'Home | Server-Side Forms & SSR Demo',
    currentRoute: '/',
    stats,
    recentStudents: students.slice(-3).reverse(),
    recentLeaves: leaveRequests.slice(-3).reverse(),
    feedbackMessage: req.query.msg || null,
    feedbackType: req.query.type || 'info'
  });
});

/**
 * 2. Form Submission Endpoint: Handle Student Enrollment (POST Form Submission)
 */
app.post('/submit-student', (req, res) => {
  const { rollNo, fullName, email, grade, gender, contactNumber, initialRate } = req.body;

  // Basic server-side validation
  if (!fullName || !rollNo || !email || !grade) {
    return res.status(400).render('confirmation', {
      pageTitle: 'Form Error | Submission Rejected',
      currentRoute: '/',
      success: false,
      title: 'Missing Required Fields',
      message: 'Please complete all required fields (Full Name, Roll Number, Email, and Grade).',
      submittedData: req.body,
      returnUrl: '/'
    });
  }

  // Create new record
  const newStudent = {
    id: Date.now(),
    rollNo: rollNo.trim().toUpperCase(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    grade: grade.trim(),
    gender: gender || 'Not Specified',
    contactNumber: contactNumber ? contactNumber.trim() : 'N/A',
    attendanceRate: initialRate ? parseInt(initialRate, 10) : 100,
    status: (initialRate && parseInt(initialRate, 10) < 75) ? 'Defaulter Risk' : 'Active',
    enrolledAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  };

  students.push(newStudent);

  // Dynamically render a Server-Side HTML confirmation view with the submitted payload
  res.render('confirmation', {
    pageTitle: 'Student Registered Successfully',
    currentRoute: '/students',
    success: true,
    title: 'Student Successfully Enrolled via Server POST!',
    message: `Enrollment record for "${newStudent.fullName}" (${newStudent.rollNo}) has been parsed and stored server-side.`,
    submittedData: newStudent,
    returnUrl: '/students'
  });
});

/**
 * 3. Form Submission Endpoint: Handle Leave Application (POST Form Submission)
 */
app.post('/submit-leave', (req, res) => {
  const { studentName, rollNo, category, startDate, daysCount, reason } = req.body;

  if (!studentName || !rollNo || !startDate || !daysCount || !reason) {
    return res.status(400).render('confirmation', {
      pageTitle: 'Form Error | Incomplete Leave Application',
      currentRoute: '/',
      success: false,
      title: 'Validation Error',
      message: 'All fields are mandatory to process a formal leave request.',
      submittedData: req.body,
      returnUrl: '/'
    });
  }

  const newLeave = {
    id: Date.now(),
    studentName: studentName.trim(),
    rollNo: rollNo.trim().toUpperCase(),
    category: category || 'General',
    startDate: startDate,
    daysCount: parseInt(daysCount, 10) || 1,
    reason: reason.trim(),
    status: 'Pending',
    submittedAt: new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  };

  leaveRequests.push(newLeave);

  res.render('confirmation', {
    pageTitle: 'Leave Application Received',
    currentRoute: '/leave-requests',
    success: true,
    title: 'Leave Application Filed Successfully!',
    message: `Your request for ${newLeave.daysCount} day(s) starting on ${newLeave.startDate} has been queued for administrative review.`,
    submittedData: newLeave,
    returnUrl: '/leave-requests'
  });
});

/**
 * 4. GET Endpoint with Form Search/Filter (GET Form Submission handling via req.query)
 */
app.get('/students', (req, res) => {
  const searchQuery = (req.query.q || '').trim().toLowerCase();
  const gradeFilter = req.query.grade || '';

  let filtered = students;

  if (searchQuery) {
    filtered = filtered.filter(s =>
      s.fullName.toLowerCase().includes(searchQuery) ||
      s.rollNo.toLowerCase().includes(searchQuery) ||
      s.email.toLowerCase().includes(searchQuery)
    );
  }

  if (gradeFilter) {
    filtered = filtered.filter(s => s.grade === gradeFilter);
  }

  res.render('students', {
    pageTitle: 'Enrolled Students | Dynamic SSR View',
    currentRoute: '/students',
    students: filtered,
    totalCount: students.length,
    searchQuery: req.query.q || '',
    selectedGrade: gradeFilter,
    stats: getStats()
  });
});

/**
 * 5. GET Endpoint: Display all Leave Applications
 */
app.get('/leave-requests', (req, res) => {
  const filterStatus = req.query.status || 'All';
  let filtered = leaveRequests;

  if (filterStatus !== 'All') {
    filtered = filtered.filter(l => l.status === filterStatus);
  }

  res.render('leave-requests', {
    pageTitle: 'Leave Requests | Server-Side Rendering',
    currentRoute: '/leave-requests',
    leaveRequests: filtered,
    filterStatus,
    stats: getStats()
  });
});

/**
 * 6. Action Endpoint: Approve or Reject a Leave Request via POST
 */
app.post('/leave-requests/:id/action', (req, res) => {
  const requestId = parseInt(req.params.id, 10);
  const { action } = req.body;

  const item = leaveRequests.find(l => l.id === requestId);
  if (item && (action === 'Approved' || action === 'Rejected')) {
    item.status = action;
  }

  res.redirect('/leave-requests');
});

/**
 * 7. Action Endpoint: Delete a Student via POST form submission
 */
app.post('/students/delete/:id', (req, res) => {
  const studentId = parseInt(req.params.id, 10);
  students = students.filter(s => s.id !== studentId);
  res.redirect('/students');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Express Server running at: http://localhost:${PORT}`);
  console.log(`📋 Server-Side Rendering (EJS) & Form Handlers Active`);
  console.log(`===================================================`);
});
