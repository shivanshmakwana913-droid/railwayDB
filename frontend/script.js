const API = "http://localhost:5000/api/bookings";

// DOM Elements
const form = document.getElementById("bookingForm");
const nameInput = document.getElementById("name");
const ageInput = document.getElementById("age");
const sourceInput = document.getElementById("source");
const destInput = document.getElementById("destination");
const dateInput = document.getElementById("date");
const trainSelect = document.getElementById("train");
const bookingsDiv = document.getElementById("bookings");

// Interactive Elements
const btnSwap = document.getElementById("btnSwapStations");
const statTotal = document.getElementById("statTotal");
const statStatus = document.getElementById("statStatus");

// Filtering & Search
const filterSource = document.getElementById("filterSource");
const filterDestination = document.getElementById("filterDestination");
const btnSearchFilter = document.getElementById("btnSearchFilter");
const btnClearFilter = document.getElementById("btnClearFilter");

// Pagination
const btnPagePrev = document.getElementById("btnPagePrev");
const btnPageNext = document.getElementById("btnPageNext");
const pageIndicator = document.getElementById("pageIndicator");
const paginationWrapper = document.getElementById("paginationWrapper");
const liveCounterLabel = document.getElementById("liveCounterLabel");

// Cancel Modal elements
const confirmModalOverlay = document.getElementById("confirmModalOverlay");
const btnCancelDismiss = document.getElementById("btnCancelDismiss");
const btnCancelConfirm = document.getElementById("btnCancelConfirm");

// Core State
let currentPage = 1;
const ITEMS_PER_PAGE = 5;
let activeCancelId = null;

// Initialize Form Constraints: Block past dates to prevent database validation errors (must be in future)
function initDateConstraints() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // setting to tomorrow
  const yyyy = tomorrow.getFullYear();
  const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd = String(tomorrow.getDate()).padStart(2, '0');
  const minDateStr = `${yyyy}-${mm}-${dd}`;

  dateInput.min = minDateStr;
  dateInput.value = minDateStr; // Pre-select tomorrow for convenience
}

// Custom Interactive Swapping of Stations with visual spin rotation trigger
btnSwap.addEventListener("click", () => {
  const temp = sourceInput.value;
  sourceInput.value = destInput.value;
  destInput.value = temp;

  // Visual spin
  const icon = btnSwap.querySelector("i");
  icon.style.transform = "rotate(180deg)";
  setTimeout(() => {
    icon.style.transform = "";
  }, 300);

  showToast("Stations Swapped", "Route direction has been inverted.", "warning");
});

// Toast Manager
function showToast(title, message, type = "success") {
  const toastContainer = document.getElementById("toastContainer");

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  let iconClass = "fa-solid fa-circle-check";
  if (type === "warning") iconClass = "fa-solid fa-circle-exclamation";
  if (type === "error") iconClass = "fa-solid fa-circle-xmark";

  toast.innerHTML = `
    <i class="${iconClass}"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
  `;

  toastContainer.appendChild(toast);

  // Close trigger
  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => {
    toast.style.animation = "toastSlideIn 0.2s reverse forwards";
    setTimeout(() => toast.remove(), 200);
  });

  // Auto remove toast after 4.5s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = "toastSlideIn 0.2s reverse forwards";
      setTimeout(() => toast.remove(), 200);
    }
  }, 4500);
}

// Load Booking Live Statistics Overview
async function loadStats() {
  try {
    const res = await fetch(`${API}/stats/overview`);
    if (!res.ok) throw new Error("Stats lookup failed");
    const data = await res.json();
    statTotal.textContent = data.totalBookings;
  } catch (err) {
    console.error("Error loading stats overview:", err);
    statTotal.textContent = "Offline";
    statStatus.textContent = "LAGGING";
    statStatus.style.color = "var(--accent-orange)";
  }
}

// Load Bookings Core
async function loadBookings() {
  try {
    // Show skeletal / loading states
    bookingsDiv.innerHTML = `
      <div class="skeleton-loader" style="height: 120px; margin-bottom: 1rem;"></div>
      <div class="skeleton-loader" style="height: 120px;"></div>
    `;

    // Build URL query constraints
    const srcQuery = filterSource.value.trim();
    const destQuery = filterDestination.value.trim();
    let queryUrl = `${API}?page=${currentPage}`;

    if (srcQuery) queryUrl += `&source=${encodeURIComponent(srcQuery)}`;
    // The backend uses a small typo "desitination" in the req.query destructuring (line 18 in bookingRoutes)
    if (destQuery) queryUrl += `&desitination=${encodeURIComponent(destQuery)}`;

    const res = await fetch(queryUrl);
    if (!res.ok) throw new Error("Failed to pull departures.");
    const bookings = await res.json();

    bookingsDiv.innerHTML = "";

    if (bookings.length === 0) {
      bookingsDiv.innerHTML = `
        <div class="empty-bookings-placeholder">
          <i class="fa-solid fa-train-subway"></i>
          <h4>No Departures Boarded</h4>
          <p>Complete the form panel to register a pass, or adjust your source/destination filters.</p>
        </div>
      `;
      paginationWrapper.style.display = "none";
      liveCounterLabel.textContent = `Empty Log`;
      return;
    }

    // Render cards
    bookings.forEach((b, index) => {
      const isAlt = index % 2 === 1;
      const formattedDate = new Date(b.journeyDate).toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
      const pnr = b._id ? b._id.substring(b._id.length - 8).toUpperCase() : "N/A";

      // Render custom Passenger boarding pass Card
      bookingsDiv.innerHTML += `
        <div class="boarding-pass-card ${isAlt ? 'alt' : ''}">
          <!-- Pass core routing -->
          <div class="ticket-main-body">
            <div class="trip-station">
              <span class="station-code">${getStationAbbrev(b.source)}</span>
              <span class="station-name">${b.source}</span>
            </div>
            
            <div class="trip-connector">
              <div class="train-track-graphic">
                <i class="fa-solid fa-train train-track-icon"></i>
              </div>
              <span class="train-tag-label">${b.trainNumber ? b.trainNumber.split(' - ')[0] : 'EXPRESS'}</span>
            </div>

            <div class="trip-station dest">
              <span class="station-code">${getStationAbbrev(b.destination)}</span>
              <span class="station-name">${b.destination}</span>
            </div>
          </div>

          <!-- Perforation cutouts -->
          <div class="ticket-cutout-divider"></div>

          <!-- Ticket passenger details -->
          <div class="ticket-details-body">
            <div class="meta-field">
              <span class="meta-label">PASSENGER NAME</span>
              <span class="meta-value">${b.passengerName} <span style="opacity: 0.6; font-size: 0.8rem;">(${b.age} Yrs)</span></span>
            </div>
            
            <div class="meta-field">
              <span class="meta-label">DEPARTURE</span>
              <span class="meta-value highlight">${formattedDate}</span>
            </div>

            <div class="meta-field">
              <span class="meta-label">SERVICE CLASS</span>
              <span class="meta-value">Executive AC</span>
            </div>
          </div>

          <!-- Barcode, meta tags, cancel actions button -->
          <div class="ticket-footer-action">
            <div class="barcode-wrapper">
              <div class="barcode-strip"></div>
              <span class="ticket-pnr-numeric">PNR ${pnr}</span>
            </div>
            
            <button class="btn-cancel-ticket" onclick="triggerCancelBooking('${b._id}')">
              <i class="fa-solid fa-ticket-simple"></i>
              <span>Cancel Pass</span>
            </button>
          </div>
        </div>
      `;
    });

    // Pagination controls rendering state logic
    // If we loaded exactly items = LIMIT, there could potentially be a next page
    if (bookings.length < ITEMS_PER_PAGE && currentPage === 1) {
      paginationWrapper.style.display = "none";
    } else {
      paginationWrapper.style.display = "flex";
      btnPagePrev.disabled = currentPage === 1;
      btnPageNext.disabled = bookings.length < ITEMS_PER_PAGE;
      pageIndicator.textContent = `Page ${currentPage}`;
      liveCounterLabel.textContent = `PAGE ${currentPage}`;
    }

  } catch (err) {
    console.error("Booking retrieval error:", err);
    bookingsDiv.innerHTML = `
      <div class="empty-bookings-placeholder" style="border-color: rgba(239, 68, 68, 0.2);">
        <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i>
        <h4 style="color: #ef4444;">Service Core Offline</h4>
        <p>Could not fetch departures list from database client. Check server console.</p>
      </div>
    `;
    paginationWrapper.style.display = "none";
  }
}

// Simple Station abstraction helper for cool airport-like 3-character display
function getStationAbbrev(stationName) {
  if (!stationName) return "STN";
  // Regex to extract parenthesis contents if user enters "Delhi (DLI)"
  const parenMatch = stationName.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    return parenMatch[1].trim().toUpperCase().substring(0, 4);
  }
  // Fallback to capitalizing first 3 letters
  return stationName.trim().replace(/\s+/g, '').substring(0, 3).toUpperCase();
}

// FORM SUBMISSION: Perform POST requests to save bookings
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    passengerName: nameInput.value.trim(),
    age: parseInt(ageInput.value, 10),
    source: sourceInput.value.trim(),
    destination: destInput.value.trim(),
    journeyDate: dateInput.value,
    trainNumber: trainSelect.value
  };

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      // Backend error check (e.g. Mongoose validation errors)
      throw new Error(result.message || "Failed booking validator.");
    }

    showToast("Booking Success!", `Ticket registered for ${data.passengerName} successfully.`, "success");

    // Reset Form Input controls
    form.reset();
    initDateConstraints();

    // Refresh GUI states
    currentPage = 1;
    await loadBookings();
    await loadStats();

  } catch (err) {
    console.error("Booking failed:", err);
    showToast("Booking Rejected", err.message || "Could not complete authorization.", "error");
  }
});

// CANCELLATION DIALOG SYSTEM CONFIGURATION
window.triggerCancelBooking = function (bookingId) {
  activeCancelId = bookingId;
  confirmModalOverlay.classList.add("active");
};

btnCancelDismiss.addEventListener("click", () => {
  activeCancelId = null;
  confirmModalOverlay.classList.remove("active");
});

// Click outside modal clears it
confirmModalOverlay.addEventListener("click", (e) => {
  if (e.target === confirmModalOverlay) {
    activeCancelId = null;
    confirmModalOverlay.classList.remove("active");
  }
});

btnCancelConfirm.addEventListener("click", async () => {
  if (!activeCancelId) return;

  try {
    const res = await fetch(`${API}/${activeCancelId}`, {
      method: "DELETE"
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to cancel ticket booking.");
    }

    showToast("Ticket Canceled", "Your refund and cancellation has been initiated.", "success");

    // Close Modal View
    confirmModalOverlay.classList.remove("active");
    activeCancelId = null;

    // Refresh GUI Lists
    await loadBookings();
    await loadStats();

  } catch (err) {
    console.error("Cancellation issue:", err);
    showToast("Cancellation Failed", err.message || "Network issue contacting host.", "error");
    confirmModalOverlay.classList.remove("active");
    activeCancelId = null;
  }
});

// FILTER INTERACTIVE TRIGGER ACTION
btnSearchFilter.addEventListener("click", () => {
  const src = filterSource.value.trim();
  const dest = filterDestination.value.trim();

  if (src || dest) {
    btnClearFilter.style.display = "inline-block";
  } else {
    btnClearFilter.style.display = "none";
  }

  currentPage = 1;
  loadBookings();
});

btnClearFilter.addEventListener("click", () => {
  filterSource.value = "";
  filterDestination.value = "";
  btnClearFilter.style.display = "none";
  currentPage = 1;
  loadBookings();
});

// PAGINATION BUTTON CONTROLS
btnPagePrev.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    loadBookings();
  }
});

btnPageNext.addEventListener("click", () => {
  currentPage++;
  loadBookings();
});

// PAGE BOOTSTRAP INITIALIZATION
function bootstrap() {
  initDateConstraints();
  loadBookings();
  loadStats();

  // Set systems status online
  statStatus.textContent = "ONLINE (OK)";
  statStatus.style.color = "var(--accent-green)";

  // Auto-refresh stats occasionally code
  setInterval(loadStats, 10000);
}

bootstrap();
