/**
 * NovaCare Clinic - Core Application Logic
 * Audio Synthesizer, Theme Engine, Symptom Checker, Directory Filters & Insurance Tool
 */

// Web Audio API Acoustic Synthesizer
window.ClinicAudio = (function() {
  let audioCtx = null;
  let isMuted = false;

  function getContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playClick() {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  function playSuccess() {
    if (isMuted) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.06, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.3);
      });
    } catch (e) {}
  }

  function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
  }

  return {
    playClick,
    playSuccess,
    toggleMute,
    get isMuted() { return isMuted; }
  };
})();

// Application Main Controller
document.addEventListener("DOMContentLoaded", function() {
  initThemeEngine();
  initAudioToggle();
  initSymptomChecker();
  initDoctorFilters();
  initDoctorModals();
  initInsuranceChecker();
  initMobileNav();
  initClinicHoursTracker();
  initDoctorPhotoToggle();

  // Initialize Submodules
  if (window.ClinicBooking) ClinicBooking.init();
  if (window.ClinicPortal) ClinicPortal.init();
});

// Theme Management (Light / Dark)
function initThemeEngine() {
  const toggleBtn = document.getElementById("themeToggleBtn");
  const currentTheme = localStorage.getItem("novacare_theme") || "light";

  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeButtonText(toggleBtn, currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", active);
      localStorage.setItem("novacare_theme", active);
      updateThemeButtonText(toggleBtn, active);
      if (window.ClinicAudio) window.ClinicAudio.playClick();
    });
  }
}

function updateThemeButtonText(btn, theme) {
  if (!btn) return;
  btn.innerHTML = theme === "dark" 
    ? `<span>☀️</span><span>Light Mode</span>` 
    : `<span>🌙</span><span>Dark Mode</span>`;
}

// Audio Control
function initAudioToggle() {
  const btn = document.getElementById("audioToggleBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isMuted = window.ClinicAudio.toggleMute();
    btn.innerHTML = isMuted 
      ? `<span>🔇</span><span>Sound Off</span>` 
      : `<span>🔔</span><span>Sound On</span>`;
  });
}

// Interactive Symptom Checker
function initSymptomChecker() {
  const chipsContainer = document.getElementById("symptomChipsList");
  const resultPanel = document.getElementById("symptomResultPanel");
  if (!chipsContainer || !resultPanel) return;

  chipsContainer.innerHTML = "";
  CLINIC_DATA.symptomsDatabase.forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "symptom-chip";
    chip.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;

    chip.addEventListener("click", () => {
      document.querySelectorAll(".symptom-chip").forEach(c => c.classList.remove("selected"));
      chip.classList.add("selected");
      if (window.ClinicAudio) window.ClinicAudio.playClick();
      displaySymptomTriageResult(item);
    });

    chipsContainer.appendChild(chip);
  });
}

function displaySymptomTriageResult(item) {
  const resultPanel = document.getElementById("symptomResultPanel");
  if (!resultPanel) return;

  const doc = CLINIC_DATA.doctors.find(d => d.id === item.recommendedDoctorId) || CLINIC_DATA.doctors[0];
  const dept = CLINIC_DATA.departments.find(d => d.id === item.departmentId);

  const urgencyClass = item.urgency === "emergency" ? "urgency-emergency" : item.urgency === "priority" ? "urgency-priority" : "urgency-routine";

  resultPanel.innerHTML = `
    <div class="result-header">
      <div>
        <h4 style="font-size: 1.15rem; margin-bottom: 0.25rem;">Clinical Guidance: ${item.label}</h4>
        <p class="text-muted" style="font-size: 0.875rem;">Department: <strong>${dept ? dept.name : "Specialty Medicine"}</strong></p>
      </div>
      <span class="urgency-badge ${urgencyClass}">
        ${item.urgency === "emergency" ? "🚨" : item.urgency === "priority" ? "⚡" : "🩺"} ${item.urgencyText}
      </span>
    </div>
    
    <div style="background-color: var(--bg-card); padding: 1.15rem; border-radius: var(--radius-sm); border-left: 4px solid var(--medical-blue); margin-bottom: 1.25rem;">
      <p style="font-size: 0.925rem; line-height: 1.5;">${item.advice}</p>
    </div>

    <div class="matched-doctor-card">
      <img src="${doc.image}" alt="${doc.name}" class="matched-doctor-avatar">
      <div style="flex-grow: 1;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--medical-blue); text-transform: uppercase;">Recommended Specialist</span>
        <h4 style="font-size: 1.1rem; margin: 0.15rem 0;">${doc.name}</h4>
        <p class="text-muted" style="font-size: 0.825rem;">${doc.title} • ⭐ ${doc.rating}</p>
      </div>
      <button class="btn btn-sm btn-primary" onclick="ClinicBooking.openBookingModal('${doc.departmentId}', '${doc.id}')">
        Book with ${doc.name.split(" ")[1]}
      </button>
    </div>
  `;

  resultPanel.classList.add("active");
  resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Doctor Directory Filters
function initDoctorFilters() {
  const pills = document.querySelectorAll(".filter-pill");
  const doctorCards = document.querySelectorAll(".doctor-card");

  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const deptFilter = pill.dataset.filter;

      doctorCards.forEach(card => {
        const cardDept = card.dataset.department;
        if (deptFilter === "all" || cardDept === deptFilter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });

      if (window.ClinicAudio) window.ClinicAudio.playClick();
    });
  });
}

// Doctor Details Modal
function initDoctorModals() {
  const overlay = document.getElementById("doctorModalOverlay");
  const closeBtn = document.getElementById("closeDoctorModalBtn");

  if (!overlay) return;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  document.querySelectorAll("[data-view-doctor]").forEach(btn => {
    btn.addEventListener("click", () => {
      const docId = btn.dataset.doctorId;
      const doc = CLINIC_DATA.doctors.find(d => d.id === docId);
      if (!doc) return;

      document.getElementById("modalDoctorImg").src = doc.image;
      document.getElementById("modalDoctorName").textContent = doc.name;
      document.getElementById("modalDoctorTitle").textContent = doc.title;
      document.getElementById("modalDoctorCredentials").textContent = doc.credentials;
      document.getElementById("modalDoctorRating").textContent = `⭐ ${doc.rating} (${doc.reviewsCount} verified patient reviews)`;
      document.getElementById("modalDoctorBio").textContent = doc.bio;
      document.getElementById("modalDoctorLanguages").textContent = doc.languages.join(", ");
      document.getElementById("modalDoctorExperience").textContent = doc.experience;

      const eduList = document.getElementById("modalDoctorEducation");
      if (eduList) {
        eduList.innerHTML = doc.education.map(e => `<li>${e}</li>`).join("");
      }

      const bookDirectBtn = document.getElementById("modalDoctorBookBtn");
      if (bookDirectBtn) {
        bookDirectBtn.onclick = () => {
          overlay.classList.remove("active");
          document.body.style.overflow = "";
          ClinicBooking.openBookingModal(doc.departmentId, doc.id);
        };
      }

      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
      if (window.ClinicAudio) window.ClinicAudio.playClick();
    });
  });
}

// Insurance Eligibility Tool
function initInsuranceChecker() {
  const select = document.getElementById("insuranceCheckerSelect");
  const resultDisplay = document.getElementById("insuranceResultBox");
  if (!select || !resultDisplay) return;

  select.addEventListener("change", () => {
    const selectedVal = select.value;
    const provider = CLINIC_DATA.insuranceProviders.find(p => p.name === selectedVal);

    if (provider) {
      resultDisplay.innerHTML = `
        <div style="background-color: var(--medical-mint-light); border: 1.5px solid var(--medical-mint); padding: 1.25rem; border-radius: var(--radius-md); text-align: left; margin-top: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--text-main); font-size: 1.05rem;">${provider.name}</strong>
            <span class="status-badge status-optimal">Verified In-Network</span>
          </div>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Estimated Co-Pay Range: <strong style="color: var(--medical-blue);">${provider.coPay}</strong> • Coverage Tier: <strong>${provider.coverage}</strong>
          </p>
          <p style="font-size: 0.8rem; color: var(--text-muted);">
            Direct billing supported. Zero upfront out-of-pocket costs beyond your plan co-pay.
          </p>
        </div>
      `;
    } else {
      resultDisplay.innerHTML = "";
    }

    if (window.ClinicAudio) window.ClinicAudio.playClick();
  });
}

// Mobile Navigation Hamburger
function initMobileNav() {
  const toggle = document.getElementById("mobileNavToggle");
  const nav = document.getElementById("siteNavLinks");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.textContent = isOpen ? "✕" : "☰";
  });
}

// Live Clinic Wait Time & Operating Hours
function initClinicHoursTracker() {
  const waitElement = document.getElementById("liveWaitTimeDisplay");
  if (waitElement) {
    const waitTimes = ["11 mins", "14 mins", "8 mins", "12 mins", "15 mins"];
    let currentIdx = 0;
    setInterval(() => {
      currentIdx = (currentIdx + 1) % waitTimes.length;
      waitElement.textContent = waitTimes[currentIdx];
    }, 45000);
  }
}

// Interactive Photo Toggle for Dr. Ngary (Official Coat vs. Original Photo)
function initDoctorPhotoToggle() {
  const toggleBtn = document.getElementById("toggleDoctorPhotoBtn");
  const avatar = document.getElementById("doctorSpotlightAvatar");
  const founderImg = document.getElementById("founderBioPhoto");

  if (!toggleBtn) return;

  const proImage = "assets/images/dr_ngary_chief_portrait.jpg";
  const origImage = "assets/images/dr_ngary_original.jpg";
  let isPro = true;

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    isPro = !isPro;

    const newSrc = isPro ? proImage : origImage;
    if (avatar) avatar.src = newSrc;
    if (founderImg) founderImg.src = newSrc;

    toggleBtn.textContent = isPro ? "🔄 View Casual Scrub" : "🔄 View Official Coat";
    if (window.ClinicAudio) window.ClinicAudio.playClick();
  });
}
