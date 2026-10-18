/**
 * MAKINI MEDICAL CENTER - Interactive Multi-Step Appointment Booking System
 */

var ClinicBooking = window.ClinicBooking = (function() {
  // Booking state
  let currentStep = 1;
  const bookingData = {
    departmentId: "general-medicine",
    serviceName: "General Outpatient Consultation & Wellness Check",
    fee: "$35",
    doctorId: "doc-ngary",
    doctorName: "Dr. Ngary, MD",
    doctorTitle: "Chief Medical Officer & Founder",
    doctorImage: "assets/images/dr_ngary_chief_portrait.jpg",
    room: "Suite 101 - Primary Care Suite",
    date: "",
    dateFormatted: "",
    timeSlot: "",
    patientName: "Kwame Mensah",
    patientEmail: "kwame.m@example.com",
    patientPhone: "+254796384362",
    patientDob: "1988-05-14",
    visitReason: "Routine Family Medical Checkup",
    insurance: "National Health Insurance (NHIF / SHIF)",
    appointmentId: ""
  };

  // Predefined time slots for days
  const timeSlots = [
    { time: "08:30 AM", period: "Morning", available: true },
    { time: "09:15 AM", period: "Morning", available: true },
    { time: "10:00 AM", period: "Morning", available: false },
    { time: "11:00 AM", period: "Morning", available: true },
    { time: "11:45 AM", period: "Morning", available: true },
    { time: "01:30 PM", period: "Afternoon", available: true },
    { time: "02:15 PM", period: "Afternoon", available: true },
    { time: "03:00 PM", period: "Afternoon", available: true },
    { time: "03:45 PM", period: "Afternoon", available: false },
    { time: "04:30 PM", period: "Afternoon", available: true },
    { time: "05:15 PM", period: "Evening", available: true }
  ];

  let initialized = false;
  function init() {
    if (initialized) return;
    initialized = true;
    setupDates();
    renderTimeSlots();
    attachEventListeners();
  }

  function setupDates() {
    const dateContainer = document.getElementById("bookingDatePicker");
    if (!dateContainer) return;

    dateContainer.innerHTML = "";
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const isoDate = d.toISOString().split("T")[0];

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `date-select-btn ${i === 0 ? "selected" : ""}`;
      btn.dataset.date = isoDate;
      btn.dataset.formatted = `${dayName}, ${monthDay}`;
      btn.innerHTML = `
        <span class="day-label">${dayName}</span>
        <span class="date-label">${monthDay}</span>
      `;

      btn.addEventListener("click", () => {
        document.querySelectorAll(".date-select-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        bookingData.date = isoDate;
        bookingData.dateFormatted = `${dayName}, ${monthDay}`;
        if (window.ClinicAudio) window.ClinicAudio.playClick();
        renderTimeSlots();
      });

      dateContainer.appendChild(btn);

      if (i === 0) {
        bookingData.date = isoDate;
        bookingData.dateFormatted = `${dayName}, ${monthDay}`;
      }
    }
  }

  function renderTimeSlots() {
    const slotsContainer = document.getElementById("bookingSlotsGrid");
    if (!slotsContainer) return;

    slotsContainer.innerHTML = "";
    let autoSelected = false;

    timeSlots.forEach((slot, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      
      const isSelected = (!bookingData.timeSlot && slot.available && !autoSelected) || (bookingData.timeSlot === slot.time);
      if (isSelected && !bookingData.timeSlot) {
        bookingData.timeSlot = slot.time;
        autoSelected = true;
      }

      btn.className = `time-slot-btn ${!slot.available ? "disabled" : ""} ${isSelected ? "selected" : ""}`;
      btn.textContent = slot.time;
      btn.disabled = !slot.available;

      if (slot.available) {
        btn.addEventListener("click", () => {
          document.querySelectorAll(".time-slot-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          bookingData.timeSlot = slot.time;
          if (window.ClinicAudio) window.ClinicAudio.playClick();
          updateSummary();
        });
      }

      slotsContainer.appendChild(btn);
    });
  }

  function attachEventListeners() {
    // Modal Open & Close Triggers
    document.querySelectorAll("[data-open-booking]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const deptId = btn.dataset.departmentId;
        const doctorId = btn.dataset.doctorId;
        openBookingModal(deptId, doctorId);
      });
    });

    const closeBtn = document.getElementById("closeBookingModalBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeBookingModal);
    }

    const overlay = document.getElementById("bookingModalOverlay");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeBookingModal();
      });
    }

    // Step Navigations
    const nextToStep2 = document.getElementById("nextToStep2");
    if (nextToStep2) {
      nextToStep2.addEventListener("click", () => {
        const selectedDeptRadio = document.querySelector('input[name="bookingDept"]:checked');
        if (selectedDeptRadio) {
          bookingData.departmentId = selectedDeptRadio.value;
          const data = window.CLINIC_DATA || (typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : null);
          if (data && data.departments) {
            const dept = data.departments.find(d => d.id === bookingData.departmentId);
            if (dept) {
              bookingData.fee = dept.consultFee;
              bookingData.serviceName = `${dept.name} Consultation`;
            }
          }
        }
        renderDoctorOptions();
        goToStep(2);
      });
    }

    const backToStep1 = document.getElementById("backToStep1");
    if (backToStep1) backToStep1.addEventListener("click", () => goToStep(1));

    const nextToStep3 = document.getElementById("nextToStep3");
    if (nextToStep3) {
      nextToStep3.addEventListener("click", () => {
        const selectedDocRadio = document.querySelector('input[name="bookingDoctor"]:checked');
        if (selectedDocRadio) {
          const data = window.CLINIC_DATA || (typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : null);
          if (data && data.doctors) {
            const doc = data.doctors.find(d => d.id === selectedDocRadio.value);
            if (doc) {
              bookingData.doctorId = doc.id;
              bookingData.doctorName = doc.name;
              bookingData.doctorTitle = doc.title;
              bookingData.doctorImage = doc.image;
              bookingData.departmentName = doc.departmentName;
            }
          }
        }
        goToStep(3);
      });
    }

    const backToStep2 = document.getElementById("backToStep2");
    if (backToStep2) backToStep2.addEventListener("click", () => goToStep(2));

    const nextToStep4 = document.getElementById("nextToStep4");
    if (nextToStep4) {
      nextToStep4.addEventListener("click", () => {
        if (!bookingData.timeSlot) {
          const firstAvail = timeSlots.find(s => s.available);
          bookingData.timeSlot = firstAvail ? firstAvail.time : "09:15 AM";
        }
        updateSummary();
        goToStep(4);
      });
    }

    const backToStep3 = document.getElementById("backToStep3");
    if (backToStep3) backToStep3.addEventListener("click", () => goToStep(3));

    // Final Booking Submit
    const submitBookingForm = document.getElementById("bookingPatientForm");
    if (submitBookingForm) {
      submitBookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleBookingSubmission();
      });
      const submitBtn = submitBookingForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener("click", (e) => {
          if (submitBookingForm.checkValidity && !submitBookingForm.checkValidity()) {
            return;
          }
          e.preventDefault();
          handleBookingSubmission();
        });
      }
    }

    // Pass Actions
    const downloadIcsBtn = document.getElementById("downloadIcsBtn");
    if (downloadIcsBtn) {
      downloadIcsBtn.addEventListener("click", downloadCalendarInvite);
    }

    const printPassBtn = document.getElementById("printPassBtn");
    if (printPassBtn) {
      printPassBtn.addEventListener("click", () => window.print());
    }

    // Hero Quick Booking form integration
    const heroQuickForm = document.getElementById("heroQuickBookingForm");
    if (heroQuickForm) {
      heroQuickForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const deptSelect = document.getElementById("heroDeptSelect");
        const docSelect = document.getElementById("heroDoctorSelect");
        const deptId = deptSelect ? deptSelect.value : "general-medicine";
        const docId = docSelect ? docSelect.value : "";
        openBookingModal(deptId, docId);
      });
    }
  }

  function openBookingModal(deptId, doctorId) {
    if (!initialized) init();
    const overlay = document.getElementById("bookingModalOverlay");
    if (!overlay) return;

    const data = window.CLINIC_DATA || (typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : null);

    if (deptId) {
      bookingData.departmentId = deptId;
      const deptRadio = document.querySelector(`input[name="bookingDept"][value="${deptId}"]`);
      if (deptRadio) deptRadio.checked = true;
      if (data && data.departments) {
        const dept = data.departments.find(d => d.id === deptId);
        if (dept) {
          bookingData.fee = dept.consultFee;
          bookingData.serviceName = `${dept.name} Consultation`;
        }
      }
    }

    if (doctorId) {
      bookingData.doctorId = doctorId;
      if (data && data.doctors) {
        const doc = data.doctors.find(d => d.id === doctorId);
        if (doc) {
          bookingData.doctorName = doc.name;
          bookingData.doctorTitle = doc.title;
          bookingData.doctorImage = doc.image;
          bookingData.departmentId = doc.departmentId;
          const deptRadio = document.querySelector(`input[name="bookingDept"][value="${doc.departmentId}"]`);
          if (deptRadio) deptRadio.checked = true;
        }
      }
    }

    overlay.classList.add("active");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    if (window.ClinicAudio) window.ClinicAudio.playClick();

    renderDoctorOptions();
    updateSummary();

    if (doctorId) {
      goToStep(3); // Direct jump to date/time slot if doctor already picked
    } else {
      goToStep(1);
    }
  }

  function closeBookingModal() {
    const overlay = document.getElementById("bookingModalOverlay");
    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.display = "none";
    }
    document.body.style.overflow = "";
  }

  function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Update stepper pills
    document.querySelectorAll(".stepper-step").forEach((stepEl, idx) => {
      const stepIdx = idx + 1;
      stepEl.classList.remove("active", "completed");
      if (stepIdx === currentStep) {
        stepEl.classList.add("active");
      } else if (stepIdx < currentStep) {
        stepEl.classList.add("completed");
      }
    });

    // Update content steps
    document.querySelectorAll(".booking-step-content").forEach(content => {
      content.classList.remove("active");
      content.style.display = "none";
    });
    const currentContent = document.getElementById(`bookingStep${stepNumber}`);
    if (currentContent) {
      currentContent.classList.add("active");
      currentContent.style.display = "block";
    }

    const modalBody = document.querySelector(".booking-modal-body");
    if (modalBody) modalBody.scrollTop = 0;

    if (window.ClinicAudio && typeof window.ClinicAudio.playClick === "function") {
      try { window.ClinicAudio.playClick(); } catch(e) {}
    }
  }

  function renderDoctorOptions() {
    const container = document.getElementById("doctorSelectionList");
    if (!container) return;

    container.innerHTML = "";
    // Filter doctors by current department or show all safely
    const data = window.CLINIC_DATA || (typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : null);
    const fallbackDoctors = [
      {
        id: "doc-ngary",
        name: "Dr. Ngary, MD",
        title: "Chief Medical Officer & Founder",
        image: "assets/images/dr_ngary_chief_portrait.jpg",
        departmentName: "General & Family Medicine",
        departmentId: "general-medicine",
        rating: 4.98,
        reviewsCount: 312,
        nextAvailable: "Today"
      }
    ];
    const allDoctors = (data && Array.isArray(data.doctors) && data.doctors.length > 0) ? data.doctors : fallbackDoctors;
    const doctors = allDoctors.filter(d => !bookingData.departmentId || d.departmentId === bookingData.departmentId);
    const docListToRender = doctors.length > 0 ? doctors : allDoctors;

    docListToRender.forEach((doc, idx) => {
      const isChecked = bookingData.doctorId ? bookingData.doctorId === doc.id : idx === 0;
      if (isChecked) {
        bookingData.doctorId = doc.id;
        bookingData.doctorName = doc.name;
        bookingData.doctorTitle = doc.title;
        bookingData.doctorImage = doc.image;
        bookingData.departmentName = doc.departmentName;
      }

      const card = document.createElement("label");
      card.className = "doctor-radio-card";
      card.innerHTML = `
        <input type="radio" name="bookingDoctor" value="${doc.id}" ${isChecked ? "checked" : ""}>
        <div class="doctor-radio-content">
          <img src="${doc.image}" alt="${doc.name}" class="radio-doc-img">
          <div class="radio-doc-details">
            <h4>${doc.name}</h4>
            <p class="radio-doc-title">${doc.title}</p>
            <div class="radio-doc-meta">
              <span>⭐ ${doc.rating} (${doc.reviewsCount} reviews)</span>
              <span class="slot-badge">⚡ ${doc.nextAvailable}</span>
            </div>
          </div>
        </div>
      `;

      card.querySelector('input[type="radio"]').addEventListener("change", () => {
        bookingData.doctorId = doc.id;
        bookingData.doctorName = doc.name;
        bookingData.doctorTitle = doc.title;
        bookingData.doctorImage = doc.image;
        bookingData.departmentName = doc.departmentName;
        if (window.ClinicAudio) window.ClinicAudio.playClick();
      });

      container.appendChild(card);
    });
  }

  function updateSummary() {
    document.querySelectorAll(".summary-doc-name").forEach(el => el.textContent = bookingData.doctorName);
    document.querySelectorAll(".summary-doc-dept").forEach(el => el.textContent = bookingData.departmentName || "General Care");
    document.querySelectorAll(".summary-datetime").forEach(el => el.textContent = `${bookingData.dateFormatted || "Today"} at ${bookingData.timeSlot || "Select Time"}`);
    document.querySelectorAll(".summary-fee").forEach(el => el.textContent = bookingData.fee);
  }

  function handleBookingSubmission() {
    const nameEl = document.getElementById("patientFullName");
    const emailEl = document.getElementById("patientEmail");
    const phoneEl = document.getElementById("patientPhone");
    const dobEl = document.getElementById("patientDob");
    const insEl = document.getElementById("patientInsurance");
    const reasonEl = document.getElementById("patientReason");

    bookingData.patientName = nameEl ? nameEl.value.trim() : (bookingData.patientName || "Valued Patient");
    bookingData.patientEmail = emailEl ? emailEl.value.trim() : (bookingData.patientEmail || "patient@example.com");
    bookingData.patientPhone = phoneEl ? phoneEl.value.trim() : (bookingData.patientPhone || "+254796384362");
    bookingData.patientDob = dobEl ? dobEl.value : (bookingData.patientDob || "1990-01-01");
    bookingData.insurance = insEl ? insEl.value : (bookingData.insurance || "Self-Pay");
    bookingData.visitReason = reasonEl ? reasonEl.value.trim() : (bookingData.visitReason || "Medical Consultation");

    // Generate random Appointment Ref ID
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    bookingData.appointmentId = `NG-${randomNum}`;

    // Update Confirmation Pass Elements safely
    const setPass = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setPass("passAppointmentId", `#${bookingData.appointmentId}`);
    setPass("passPatientName", bookingData.patientName);
    setPass("passDoctorName", bookingData.doctorName);
    setPass("passSpecialty", bookingData.departmentName || "General Clinic");
    setPass("passDateTime", `${bookingData.dateFormatted || "Today"} • ${bookingData.timeSlot || "2:30 PM"}`);
    setPass("passInsurance", bookingData.insurance);
    setPass("passRoom", "Makini Medical Center - Suite 101");

    // Play pleasant success sound
    try {
      if (window.ClinicAudio && typeof window.ClinicAudio.playSuccess === "function") {
        window.ClinicAudio.playSuccess();
      }
    } catch (e) {}

    // Add to mock patient portal upcoming list
    try {
      if (window.CLINIC_DATA && window.CLINIC_DATA.mockPatientPortal && Array.isArray(window.CLINIC_DATA.mockPatientPortal.activeAppointments)) {
        window.CLINIC_DATA.mockPatientPortal.activeAppointments.unshift({
          id: bookingData.appointmentId,
          doctor: bookingData.doctorName,
          specialty: bookingData.departmentName || "General Care",
          date: `${bookingData.dateFormatted || "Today"}, ${bookingData.timeSlot || "2:30 PM"}`,
          room: "Suite 101",
          type: bookingData.serviceName || "Outpatient General Consultation",
          status: "Confirmed"
        });
      }
    } catch (e) {}

    goToStep(5);
    showNotification(`Appointment confirmed! Reference ID #${bookingData.appointmentId}`, "success");
  }

  function downloadCalendarInvite() {
    const title = `Makini Medical Center Appointment: ${bookingData.doctorName}`;
    const description = `Appointment with ${bookingData.doctorName} at Makini Medical Center. Reason: ${bookingData.visitReason || "Medical Consultation"}. Ref: ${bookingData.appointmentId}`;
    const data = window.CLINIC_DATA || (typeof CLINIC_DATA !== "undefined" ? CLINIC_DATA : null);
    const location = (data && data.clinicInfo && data.clinicInfo.address) ? data.clinicInfo.address : "Kerugoya, Kirinyaga County, Kenya";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Makini Medical Center//Appointment System//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Makini_Medical_Center_Appointment_${bookingData.appointmentId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Calendar invite (.ics) downloaded!", "info");
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
      <span>${type === "success" ? "✅" : type === "warning" ? "⚠️" : "ℹ️"}</span>
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
    openBookingModal,
    closeBookingModal,
    goToStep
  };
})();

// Explicitly attach to window object
if (typeof window !== "undefined") {
  window.ClinicBooking = ClinicBooking;
}

// Automatically initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() {
      if (window.ClinicBooking && typeof window.ClinicBooking.init === "function") {
        window.ClinicBooking.init();
      }
    });
  } else {
    if (window.ClinicBooking && typeof window.ClinicBooking.init === "function") {
      window.ClinicBooking.init();
    }
  }

  // Global bulletproof click delegation for any [data-open-booking] element anywhere on the page
  document.addEventListener("click", function(e) {
    const btn = e.target.closest("[data-open-booking]");
    if (btn) {
      e.preventDefault();
      const deptId = btn.getAttribute("data-department-id") || "";
      const doctorId = btn.getAttribute("data-doctor-id") || "";
      if (window.ClinicBooking && typeof window.ClinicBooking.openBookingModal === "function") {
        window.ClinicBooking.openBookingModal(deptId, doctorId);
      }
    }
  });

  // Escape key to close booking modal
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && window.ClinicBooking && typeof window.ClinicBooking.closeBookingModal === "function") {
      window.ClinicBooking.closeBookingModal();
    }
  });
}
