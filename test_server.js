const http = require('http');
const querystring = require('querystring');
const { spawn } = require('child_process');

console.log('=== Starting Automated Verification for Task 1 ===');

// Start Express server process
const serverProcess = spawn(process.execPath, ['server.js'], {
  cwd: __dirname,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe']
});

serverProcess.stdout.on('data', (d) => process.stdout.write('[Server STDOUT] ' + d.toString()));
serverProcess.stderr.on('data', (d) => process.stderr.write('[Server STDERR] ' + d.toString()));

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  // Wait 1.5 seconds for server to boot
  await new Promise((r) => setTimeout(r, 1500));

  try {
    // Test 1: GET / (Main Dashboard & Forms)
    console.log('\n--- Test 1: GET / (HTML Structure & Forms Check) ---');
    const resHome = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    console.log(`Status Code: ${resHome.statusCode}`);
    if (resHome.statusCode !== 200) throw new Error('Expected 200 OK');
    if (!resHome.body.includes('action="/submit-student"') || !resHome.body.includes('method="POST"')) {
      throw new Error('Student enrollment form not found in rendered HTML');
    }
    if (!resHome.body.includes('action="/submit-leave"') || !resHome.body.includes('method="POST"')) {
      throw new Error('Leave application form not found in rendered HTML');
    }
    if (!resHome.body.includes('Server-Side Rendering (SSR)')) {
      throw new Error('SSR content missing');
    }
    console.log('✅ Test 1 Passed: HTML Forms & SSR Dashboard successfully rendered by Express + EJS');

    // Test 2: POST /submit-student (Form submission endpoint)
    console.log('\n--- Test 2: POST /submit-student (Form Submission Handling) ---');
    const studentFormData = querystring.stringify({
      fullName: 'Vikramaditya Rao',
      rollNo: '11S-09',
      email: 'vikram.rao@example.com',
      grade: 'Grade 11-Science',
      gender: 'Male',
      contactNumber: '+91 99887 76655',
      initialRate: '98'
    });

    const resPostStudent = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/submit-student',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(studentFormData)
      }
    }, studentFormData);

    console.log(`Status Code: ${resPostStudent.statusCode}`);
    if (resPostStudent.statusCode !== 200) throw new Error('Expected 200 OK on student form submission');
    if (!resPostStudent.body.includes('Vikramaditya Rao') || !resPostStudent.body.includes('11S-09')) {
      throw new Error('Submitted data was not dynamically rendered into the confirmation page');
    }
    console.log('✅ Test 2 Passed: Express parsed urlencoded form body and EJS dynamically rendered confirmation view');

    // Test 3: POST /submit-leave (Leave Request Form submission)
    console.log('\n--- Test 3: POST /submit-leave (Leave Request Form Handling) ---');
    const leaveFormData = querystring.stringify({
      studentName: 'Vikramaditya Rao',
      rollNo: '11S-09',
      category: 'Competition',
      startDate: '2026-10-12',
      daysCount: '4',
      reason: 'National Robotics Championship finals'
    });

    const resPostLeave = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/submit-leave',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(leaveFormData)
      }
    }, leaveFormData);

    console.log(`Status Code: ${resPostLeave.statusCode}`);
    if (resPostLeave.statusCode !== 200) throw new Error('Expected 200 OK on leave form submission');
    if (!resPostLeave.body.includes('National Robotics Championship')) {
      throw new Error('Submitted leave data was not rendered in response');
    }
    console.log('✅ Test 3 Passed: Leave request form submitted, parsed, and rendered dynamically');

    // Test 4: GET /students (Verify new student appears in SSR roster)
    console.log('\n--- Test 4: GET /students (SSR Roster Verification) ---');
    const resStudents = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/students',
      method: 'GET'
    });

    console.log(`Status Code: ${resStudents.statusCode}`);
    if (!resStudents.body.includes('Vikramaditya Rao') || !resStudents.body.includes('11S-09')) {
      throw new Error('Newly enrolled student not found in roster SSR view');
    }
    console.log('✅ Test 4 Passed: Server-side rendered student directory reflects newly submitted form data');

    // Test 5: GET /students?q=Vikram (GET Form Search Filter)
    console.log('\n--- Test 5: GET /students?q=Vikram (GET Query Form Filter) ---');
    const resFilter = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/students?q=Vikram',
      method: 'GET'
    });

    if (!resFilter.body.includes('Vikramaditya Rao') || resFilter.body.includes('Aarav Sharma')) {
      throw new Error('Search query filter did not properly filter results');
    }
    console.log('✅ Test 5 Passed: GET query parameters parsed and filtered view rendered correctly');

    console.log('\n🎉 ALL 5 TESTS PASSED SUCCESSFULLY! Task 1 requirements fully verified.');
  } catch (err) {
    console.error('❌ Test Failure:', err);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
  }
}

runTests();
