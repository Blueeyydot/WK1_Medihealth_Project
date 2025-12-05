# MediHealth Appointment Booking System

## Overview
MediHealth Appointment Booking System is a lightweight web application designed to streamline patient appointment scheduling. Built as part of a T Level Digital Production, Design and Development exercise, this project demonstrates modern web development practices using HTML, CSS, JavaScript, and Supabase.

---

## Features
- **Appointment Form**: Collects patient details including name, email, age, phone number, appointment date/time, and reason for visit.
- **Supabase Integration**: Securely stores appointment data in a PostgreSQL database via Supabase REST API.
- **Dynamic Display**: Fetches and displays all booked appointments in a structured table.
- **Form Validation**: Ensures required fields are completed and data integrity is maintained.

---

## Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6)
- **Backend**: Supabase (PostgreSQL)
- **Tools**: Visual Studio Code, Live Server, ESLint, Prettier

---

## Usage
1. Launch the app:
   - Right-click `index.html` → **Open with Live Server**.
2. Fill in the appointment form and click **Book Appointment**.
3. Confirm data insertion in your Supabase dashboard.

---

## Configuration
Update the following constants in `static/app.js` with your Supabase credentials:
```javascript
const API_URL = "YOUR_SUPABASE_PROJECT_URL";
const API_KEY = "YOUR_SUPABASE_ANON_KEY";
const APPOINTMENTS_TABLE = "appointments";
```

---

## Security Best Practices
- **Never expose service_role keys** in client-side code.
- Keep your repository **private** if it contains real API keys.
- Use environment variables or a secure backend for production deployments.


## Roadmap
- [ ] Implement Edit and Delete functionality (full CRUD)
- [ ] Add responsive NHS-style UI
- [ ] Integrate authentication for staff-only access
- [ ] Add search and filtering for appointments

---
