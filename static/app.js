
// =============================================================
// Supabase connection settings
// =============================================================

// Supabase → Settings → Data API → Project URL
const API_URL = "https://hkxfrkwkfafwzryzarsn.supabase.co";

// Supabase → Settings → API Keys → anon public key (safe for browser)
// Do NOT use the service_role key here.
const API_KEY = "sb_publishable_axfCOFFigv3wFJt4BLA4Yw_PR_e2tNE";

// Name of the table you created in Supabase
const APPOINTMENTS_TABLE = "appointments";

console.log("JavaScript loaded");
console.log("Using Supabase:", API_URL);

// =============================================================
// Helpers
// =============================================================

function toISOFromLocalDatetimeLocal(value) {
  // value is like "2025-12-10T14:30"
  // Interpret as local time and convert to an ISO string (UTC) for timestamptz.
  // If your DB column is TIMESTAMP WITHOUT TIME ZONE and you prefer local wall-clock,
  // you can return value + ":00" instead and skip the timezone conversion.

  if (!value) return null;
  const dt = new Date(value);
  // If browser can’t parse, fallback
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString(); // e.g., "2025-12-10T14:30:00.000Z"
}

function isValidEmail(email) {
  // simple sanity regex (not RFC-perfect but good for UI)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// =============================================================
// Run when the page has finished loading
// =============================================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("appointment-form");

  // When the form is submitted, stop the page reloading and add the appointment
  form.addEventListener("submit", async (event) => {
    event.preventDefault();      // stop the default form submit (page reload)
    await addAppointment();      // run our function to send data to Supabase
  });

  // Load existing appointments when the page opens
  loadAppointments();
});

// =============================================================
// Add a new appointment (CREATE)
// =============================================================

async function addAppointment() {
  // 1. Read values from the form
  const name = document.getElementById("patient_name").value.trim();
  const email = document.getElementById("patient_email").value.trim();
  const ageStr = document.getElementById("patient_age").value;
  const number = document.getElementById("patient_number").value.trim();
  const appointmentLocal = document.getElementById("appointment_at").value; // "YYYY-MM-DDTHH:mm"
  const reason = document.getElementById("reason_for_visit").value.trim();

  // 2. Basic validation
  const age = Number.parseInt(ageStr, 10);
  const appointmentISO = toISOFromLocalDatetimeLocal(appointmentLocal);

  const problems = [];
  if (!name) problems.push("Patient name is required.");
  if (!email || !isValidEmail(email)) problems.push("A valid email is required.");
  if (!Number.isFinite(age) || age < 0 || age > 130) problems.push("Age must be between 0 and 130.");
  if (!number) problems.push("Patient phone/number is required.");
  if (!appointmentISO) problems.push("A valid appointment date & time is required.");
  if (!reason) problems.push("Reason for visit is required.");

  if (problems.length) {
    alert(problems.join("\n"));
    return;
  }

  // 3. Build the object using Supabase column names
  // These property names MUST match your Supabase table columns
  const body = {
    patient_name: name,
    patient_email: email,
    patient_age: age,
    patient_number: number,
    appointment_at: appointmentISO,     // assumes column is TIMESTAMPTZ or TIMESTAMP
    reason_for_visit: reason
  };

  try {
    // 4. Send a POST request to Supabase
    const response = await fetch(`${API_URL}/rest/v1/${APPOINTMENTS_TABLE}`, {
      method: "POST",
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        // return=minimal is fine; use return=representation if you want the created row back
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Supabase add error:", err);
      alert("Could not add appointment. Check the console for details.");
      return;
    }

    alert("Appointment booked successfully.");

    // 5. Clear the form inputs
    document.getElementById("patient_name").value = "";
    document.getElementById("patient_email").value = "";
    document.getElementById("patient_age").value = "";
    document.getElementById("patient_number").value = "";
    document.getElementById("appointment_at").value = "";
    document.getElementById("reason_for_visit").value = "";

    // 6. Reload the list of appointments
    loadAppointments();

  } catch (error) {
    console.error(error);
    alert("Something went wrong while adding the appointment.");
  }
}

// =============================================================
// Load all appointments from Supabase (READ)
// =============================================================


async function loadAppointments() {
  const tbody = document.getElementById("appointments-table-body");
  const status = document.getElementById("appointments-status");

  // Show loading status
  if (status) status.textContent = "Loading appointments…";
  if (tbody) tbody.innerHTML = "";

  try {
    // Order by appointment_at ascending (optional)
    const query = `select=patient_name,patient_email,patient_age,patient_number,appointment_at,reason_for_visit&order=appointment_at.asc`;
    const response = await fetch(`${API_URL}/rest/v1/${APPOINTMENTS_TABLE}?${query}`, {
      headers: {
        "apikey": API_KEY,
        "Authorization": `Bearer ${API_KEY}`
      }
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Supabase load error:", err);
      if (status) status.textContent = "Could not load appointments.";
      return;
    }

    const appointments = await response.json();

    if (!appointments || appointments.length === 0) {
      if (status) status.textContent = "No appointments found.";
      return;
    }

    // Build table rows safely
    const rowsHtml = appointments.map(a => {
      const when = a.appointment_at
        ? new Date(a.appointment_at).toLocaleString()
        : "(no time)";
      return `
        <tr>
          <td><strong>${escapeHtml(a.patient_name)}</strong></td>
          <td>${escapeHtml(a.patient_email)}</td>
          <td>${Number.isFinite(a.patient_age) ? a.patient_age : ""}</td>
          <td>${escapeHtml(a.patient_number)}</td>
          <td>${escapeHtml(when)}</td>
          <td>${escapeHtml(a.reason_for_visit ?? "")}</td>
        </tr>
      `;
    }).join("");

    if (tbody) tbody.innerHTML = rowsHtml;
    if (status) status.textContent = `Loaded ${appointments.length} appointment(s).`;

  } catch (error) {
    console.error(error);
    if (status) status.textContent = "Error loading appointments.";
  }
}

/**
 * Minimal HTML escaping to avoid accidental HTML injection in UI.
 */
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");

}
