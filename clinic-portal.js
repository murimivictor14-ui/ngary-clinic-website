/**
 * MAKINI MEDICAL CENTER - Patient Portal Interactive Simulation
 */

const ClinicPortal = (function() {
  function init() {
    attachEventListeners();
    renderPortalData();
  }

  function attachEventListeners() {
    // Open portal button
    document.querySelectorAll("[data-open-portal]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openPortal();
      });
    });

    const closeBtn = document.getElementById("closePortalModalBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closePortal);
    }

    const overlay = document.getElementById("portalModalOverlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closePortal();
      });
    }

    // Portal Tab switching
    document.querySelectorAll(".portal-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        switchTab(targetTab);
      });
    });

    // Chat form submission
    const chatForm = document.getElementById("portalChatForm");
    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        sendPatientMessage();
      });
    }
  }

  function openPortal() {
    const overlay = document.getElementById("portalModalOverlay");
    if (!overlay) return;
    renderPortalData();
    overlay.classList.add("active");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    if (window.ClinicAudio) window.ClinicAudio.playClick();
  }

  function closePortal() {
    const overlay = document.getElementById("portalModalOverlay");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.display = "none";
    }
    document.body.style.overflow = "";
  }

  function switchTab(tabId) {
    document.querySelectorAll(".portal-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    document.querySelectorAll(".portal-tab-content").forEach(pane => {
      pane.style.display = pane.id === `tab-${tabId}` ? "block" : "none";
    });

    if (window.ClinicAudio) window.ClinicAudio.playClick();
  }

  function renderPortalData() {
    const data = CLINIC_DATA.mockPatientPortal;
    if (!data) return;

    // Render Appointments
    const aptContainer = document.getElementById("portalAppointmentsList");
    if (aptContainer) {
      aptContainer.innerHTML = "";
      if (data.activeAppointments.length === 0) {
        aptContainer.innerHTML = `<p class="empty-state">No upcoming appointments scheduled.</p>`;
      } else {
        data.activeAppointments.forEach(apt => {
          const item = document.createElement("div");
          item.className = "portal-card";
          item.innerHTML = `
            <div class="portal-card-header">
              <div>
                <h4>${apt.doctor}</h4>
                <p class="text-muted">${apt.specialty} • ${apt.room}</p>
              </div>
              <span class="status-badge status-optimal">${apt.status}</span>
            </div>
            <div class="portal-card-body">
              <p><strong>Date & Time:</strong> ${apt.date}</p>
              <p><strong>Appointment Type:</strong> ${apt.type}</p>
              <p><strong>Reference:</strong> <code>#${apt.id}</code></p>
            </div>
            <div class="portal-card-actions">
              <button class="btn btn-sm btn-subtle cancel-apt-btn" data-id="${apt.id}">Cancel</button>
              <button class="btn btn-sm btn-outline-primary" onclick="window.print()">Print Details</button>
            </div>
          `;

          item.querySelector(".cancel-apt-btn").addEventListener("click", () => {
            if (confirm("Are you sure you want to cancel this appointment?")) {
              const index = data.activeAppointments.findIndex(a => a.id === apt.id);
              if (index > -1) {
                data.activeAppointments.splice(index, 1);
                renderPortalData();
                showNotification("Appointment has been canceled", "info");
              }
            }
          });

          aptContainer.appendChild(item);
        });
      }
    }

    // Render Lab Results
    const labContainer = document.getElementById("portalLabList");
    if (labContainer) {
      labContainer.innerHTML = `
        <table class="lab-results-table">
          <thead>
            <tr>
              <th>Diagnostic Test</th>
              <th>Date</th>
              <th>Result</th>
              <th>Standard Range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.labResults.map(lab => `
              <tr>
                <td><strong>${lab.test}</strong></td>
                <td>${lab.date}</td>
                <td><strong>${lab.value}</strong></td>
                <td class="text-muted">${lab.reference}</td>
                <td><span class="status-badge status-optimal">${lab.status}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end;">
          <button class="btn btn-sm btn-outline-primary" id="downloadLabPdfBtn">
            📄 Download Official Verified PDF Report
          </button>
        </div>
      `;

      const downloadPdf = document.getElementById("downloadLabPdfBtn");
      if (downloadPdf) {
        downloadPdf.addEventListener("click", () => {
          showNotification("Generating encrypted diagnostic PDF report...", "info");
          setTimeout(() => {
            showNotification("Diagnostic Report #NC-LAB-2026 downloaded!", "success");
          }, 1200);
        });
      }
    }

    // Render Prescriptions
    const rxContainer = document.getElementById("portalPrescriptionsList");
    if (rxContainer) {
      rxContainer.innerHTML = "";
      data.prescriptions.forEach(rx => {
        const item = document.createElement("div");
        item.className = "portal-card";
        item.innerHTML = `
          <div class="portal-card-header">
            <div>
              <h4>${rx.medication}</h4>
              <p class="text-muted">${rx.dosage}</p>
            </div>
            <span class="status-badge status-optimal">${rx.status}</span>
          </div>
          <div class="portal-card-body">
            <p><strong>Prescribed By:</strong> ${rx.prescriber}</p>
            <p><strong>Refills Left:</strong> ${rx.refillsRemaining} remaining</p>
          </div>
          <div class="portal-card-actions">
            <button class="btn btn-sm btn-primary refill-btn" ${rx.refillsRemaining <= 0 ? "disabled" : ""}>
              💊 Request 30-Day Refill
            </button>
          </div>
        `;

        item.querySelector(".refill-btn").addEventListener("click", (e) => {
          const btn = e.target;
          btn.disabled = true;
          btn.textContent = "Processing Refill...";
          setTimeout(() => {
            rx.refillsRemaining = Math.max(0, rx.refillsRemaining - 1);
            btn.textContent = "✅ Sent to Makini On-Site Pharmacy";
            showNotification(`Refill request for ${rx.medication} submitted to Makini On-Site Pharmacy!`, "success");
            if (window.ClinicAudio) window.ClinicAudio.playSuccess();
          }, 1000);
        });

        rxContainer.appendChild(item);
      });
    }
  }

  function sendPatientMessage() {
    const input = document.getElementById("portalChatInput");
    const container = document.getElementById("portalChatMessages");
    if (!input || !container) return;

    const message = input.value.trim();
    if (!message) return;

    // Append patient bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble chat-bubble-user";
    userBubble.innerHTML = `<p>${escapeHTML(message)}</p><span class="chat-time">Just now</span>`;
    container.appendChild(userBubble);
    input.value = "";
    container.scrollTop = container.scrollHeight;

    if (window.ClinicAudio) window.ClinicAudio.playClick();

    // Simulated medical assistant response
    setTimeout(() => {
      const replyBubble = document.createElement("div");
      replyBubble.className = "chat-bubble chat-bubble-clinic";
      replyBubble.innerHTML = `
        <p>Hello Kwame, thank you for reaching out to Makini Medical Center Care Coordination. Dr. Ngary and our clinical care team have received your message regarding your care plan. A physician or registered nurse will review your inquiry shortly.</p>
        <span class="chat-time">Care Coordinator • Just now</span>
      `;
      container.appendChild(replyBubble);
      container.scrollTop = container.scrollHeight;
      if (window.ClinicAudio) window.ClinicAudio.playClick();
    }, 1100);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  function showNotification(message, type = "info") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === "success" ? "✅" : "ℹ️"}</span>
      <div>${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  return {
    init,
    openPortal,
    closePortal
  };
})();

// Attach to window object explicitly
window.ClinicPortal = ClinicPortal;

// Automatically initialize on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ClinicPortal.init());
} else {
  ClinicPortal.init();
}

// Global bulletproof click delegation for any [data-open-portal] element
document.addEventListener("click", function(e) {
  const btn = e.target.closest("[data-open-portal]");
  if (btn) {
    e.preventDefault();
    ClinicPortal.openPortal();
  }
});
