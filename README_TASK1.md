# 🚀 Task 1: HTML Structure and Basic Server Interaction

## 🎯 Objective
Introduce the concept of **Server-Side Rendering (SSR)** and **HTML Form Submissions** using **Node.js**, **Express**, and the **EJS template engine**.

---

## 🏗️ Architecture & Concepts Overview

### 1. Client-Side vs Server-Side Rendering (SSR)
- **Client-Side Rendering (CSR / SPA)**: The browser downloads a minimal HTML shell and large JavaScript bundles. The JavaScript runs in the browser, fetches JSON data via `fetch()` or `XMLHttpRequest`, and constructs DOM elements on the user's machine.
- **Server-Side Rendering (SSR)**: When the user requests a page or submits a form, the **Node.js server executes template logic (EJS)**, merges application data directly into the HTML document, and sends back a fully-formed, ready-to-display HTML string to the browser.
  - **Benefits**: Faster First Contentful Paint (FCP), enhanced SEO, zero client-side hydration delays, and security (database credentials & business logic never leave the server).

### 2. Anatomy of an HTML Form Submission
When an HTML `<form>` is submitted:
```html
<form action="/submit-student" method="POST">
  <input type="text" name="fullName" required>
  <input type="text" name="rollNo" required>
  <button type="submit">Submit</button>
</form>
```
1. The browser collects all input elements having a `name` attribute.
2. It encodes them as `application/x-www-form-urlencoded` key-value pairs (e.g. `fullName=Aarav+Sharma&rollNo=10A-01`).
3. An HTTP `POST` request is sent to the URL specified in `action`.
4. In Express, the middleware `express.urlencoded({ extended: true })` decodes this payload into a JavaScript object accessible at `req.body`.
5. The server updates its state/database and renders a response (e.g., `res.render('confirmation', { ... })`).

---

## 📂 Project Structure for Task 1

```
cognifiyz task1
├── package.json               # Express and EJS dependencies & scripts
├── server.js                  # Express application setup, routes, & form handlers
├── views/                     # Server-Side Rendered (EJS) Templates
│   ├── partials/
│   │   ├── header.ejs         # Global navigation bar with dynamic route highlighting
│   │   └── footer.ejs         # Common page footer with architecture notes
│   ├── index.ejs              # Dashboard with HTML Forms & dynamic summary metrics
│   ├── students.ejs           # SSR table of enrolled students with GET search/filter & POST delete
│   ├── leave-requests.ejs     # SSR list of leave requests with POST Approve/Reject actions
│   └── confirmation.ejs       # Visual confirmation page inspecting req.body & SSR lifecycle
└── README_TASK1.md            # This documentation
```

---

## 📋 Steps Implemented

### Step 1: Create an HTML Structure with Forms for User Input
Located in [`views/index.ejs`](file:///c:/Users/SE/OneDrive/Desktop/zenx/cognifiyztask1/views/index.ejs):
1. **Student Enrollment Form** (`POST /submit-student`):
   - Text inputs for `fullName` and `rollNo`
   - Email input with format validation for `email`
   - Select dropdown for `grade`
   - Radio buttons for `gender`
   - Telephone input for `contactNumber`
   - Numeric input with `min="0"` and `max="100"` for `initialRate`
2. **Leave Application Form** (`POST /submit-leave`):
   - Text inputs for student identity
   - Category selector (`Medical`, `Competition`, `Personal`, etc.)
   - Date picker for `startDate`
   - Numeric input for `daysCount`
   - Multi-line `<textarea>` for detailed absence reasons
3. **Filter/Search Form** (`GET /students`):
   - Demonstrates GET method where form inputs become query parameters (`?q=...&grade=...`) accessible via `req.query`.

### Step 2: Set Up a Simple Node.js Server Using Express
Located in [`server.js`](file:///c:/Users/SE/OneDrive/Desktop/zenx/cognifiyztask1/server.js):
```javascript
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing HTML form URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
```

### Step 3: Create Server-Side Endpoints to Handle Form Submissions
Endpoints defined in [`server.js`](file:///c:/Users/SE/OneDrive/Desktop/zenx/cognifiyztask1/server.js):
- **`GET /`**: Renders the main dashboard with statistics and forms.
- **`POST /submit-student`**: Handles student enrollment form submissions:
  ```javascript
  app.post('/submit-student', (req, res) => {
    const { fullName, rollNo, email, grade, gender, contactNumber, initialRate } = req.body;
    // Server-side validation
    if (!fullName || !rollNo || !email || !grade) {
      return res.status(400).render('confirmation', { success: false, ... });
    }
    // Store in data store
    students.push({ ... });
    // Dynamic SSR confirmation
    res.render('confirmation', { success: true, submittedData: newStudent, ... });
  });
  ```
- **`POST /submit-leave`**: Handles leave application submissions and validates required fields.
- **`GET /students`**: Handles search and filtering via `req.query.q` and `req.query.grade`.
- **`POST /leave-requests/:id/action`**: Mutates approval status (`Approved` / `Rejected`) from form submissions.
- **`POST /students/delete/:id`**: Removes a record via a form submission.

### Step 4: Use Server-Side Rendering (EJS) to Dynamically Generate HTML
Configured in [`server.js`](file:///c:/Users/SE/OneDrive/Desktop/zenx/cognifiyztask1/server.js):
```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```
Key EJS features showcased:
- **Interpolation / Escaping (`<%= variable %>`)**: Safely renders values preventing XSS attacks.
- **Unescaped HTML (`<%- include(...) %>`)**: Embeds modular partial components (`header.ejs`, `footer.ejs`).
- **Conditionals (`<% if (condition) { %> ... <% } %>`)**: Dynamically toggles active classes, warning badges, and empty states.
- **Loops (`<% array.forEach(item => { %> ... <% }) %>`)**: Iterates through server data arrays to dynamically generate table rows and cards.

---

## 🏃‍♂️ How to Run

1. Open a terminal in this directory:
   ```bash
   cd c:\Users\SE\OneDrive\Desktop\zenx\cognifiyztask1
   ```
2. Start the server:
   ```bash
   npm start
   ```
   *(Or for live reload on file edits: `npm run dev`)*

3. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```

4. Try out the features:
   - Fill out the **Student Enrollment Form** and click **Enroll Student (POST)**. Notice the dynamic confirmation page showing the parsed `req.body`.
   - Fill out the **Leave Application Form** and submit.
   - Click on **Students Roster** to test the GET search filter form.
   - Click on **Leave Applications** to review and test the Approve/Reject form actions.
