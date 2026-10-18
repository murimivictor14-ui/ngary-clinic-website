# 🏥 MAKINI MEDICAL CENTER
### *Compassionate, World-Class Primary Healthcare in Kerugoya, Kirinyaga County, Kenya*

**MAKINI MEDICAL CENTER** is a modern, responsive web application for a premier medical center and polyclinic in Kerugoya, Kirinyaga County, Kenya, led by Chief Medical Officer & Founder **Dr. Ngary, MD**. Built with modern vanilla HTML5, semantic CSS3, and JavaScript, it provides a frictionless "digital front door" for patient consultations, basic clinical services, rapid diagnostics, and transparent pricing.

---

## 🌟 Key Highlights & Design Implementation

### 1. 👨🏾‍⚕️ Dr. Ngary (Chief Medical Officer) & African Medical Team
- **Character as Main Face of the Clinic:** Features **Dr. Ngary, MD** prominently in the Hero Section and Medical Directory.
- **Interactive Dual Photo Toggle:** Visitors can toggle between Dr. Ngary's studio-grade official doctor's coat/stethoscope portrait and his casual clinic scrub photo with real-time feedback.
- **Authentic African Representation:** High-resolution architectural photography of our modern African clinic lobby, African doctors, pediatric care with mother and child, and clinical personnel.

### 2. 🩺 Comprehensive Basic Clinic Services
1. **General & Family Medicine** (Routine physicals, malaria/typhoid diagnostics, hypertension, diabetes care - Dr. Ngary, MD).
2. **Pediatrics & Child Wellness** (Childhood vaccinations, infant growth milestones, fever/asthma care - Dr. Amina Bello, MD).
3. **Dentistry & Oral Health** (Ultrasonic teeth scaling & polish, painless extractions, cavity fillings - Dr. Kofi Mensah, DDS).
4. **Maternity & Women's Health (OB-GYN)** (Antenatal programs, 2D/3D obstetric ultrasound, maternal care - Dr. Zainab Njoroge, MD).
5. **Diagnostic Laboratory & Rapid Blood Testing** (15-minute malaria/typhoid RDT, automated CBC, digital X-rays - Dr. Emmanuel Diallo, MD).
6. **24/7 Urgent Care & Minor Procedures** (Wound suturing, burns, IV rehydration fluids, asthma nebulizer - Sister Chidinma Eze, RN).
7. **On-Site Pharmacy & Certified Dispensary** (Verified medications & 1-click refill requests).

### 3. 📅 Interactive 4-Step Appointment Booking Engine
- **Step 1 (Service):** Select from all 6 core clinical departments with transparent consultation fees.
- **Step 2 (Doctor):** Choose your specialist with verified ratings, languages spoken, and next available slot.
- **Step 3 (Date & Time):** Interactive day selector (Today, Tomorrow, Upcoming) and morning/afternoon time chips.
- **Step 4 (Patient Details):** Legal name, birthdate, email, phone, and reason for visit.
- **Step 5 (Digital Admission Pass):** Generates an official digital clinic pass with unique Ref `#NG-XXXXX`, scannable SVG QR code, 1-click **Calendar (.ics) export**, and print view.

### 4. 🧠 Interactive Clinical Symptom Navigator
- Immediate symptom triage chips (Fever & Chills, Cough/Breathing, Child Sickness, Severe Toothache, Pregnancy Care, Minor Cuts/Trauma, Routine Wellness).
- Instant recommendation displaying the right department, attending physician, and 1-click booking shortcut.

### 5. 🛡️ Insurance & Financial Transparency
- **Insurance Checker:** Real-time eligibility calculator for national and private schemes (NHIF/SHIF, Jubilee, AXA Mansard, Sanlam, Old Mutual, Cigna, Bupa, Hygeia, Reliance, and Subsidized Self-Pay).
- **Fixed Outpatient Fee Schedule:** Transparent price breakdown ensuring zero billing surprises.

### 6. 📱 Simulated Patient Health Portal
- **Active Appointments:** View upcoming visits with Dr. Ngary.
- **Lab & Blood Reports:** Verified diagnostic results (Malaria RDT, Fasting Blood Sugar, CBC).
- **Medications & Dispensary:** Active prescriptions with 1-click 30-day refill requests.
- **Care Coordinator Chat:** Direct messaging simulation with clinic nursing staff.

---

## 🚀 Running Locally

The application runs using standard HTTP servers:
```powershell
# Run the local server
powershell -ExecutionPolicy Bypass -File .\server.ps1
```
Open your browser at: **`http://localhost:8080/`**
