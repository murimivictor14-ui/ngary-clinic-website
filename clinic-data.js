/**
 * MAKINI MEDICAL CENTER - Data Models
 * Featuring Dr. Ngary (Chief Medical Officer & Founder) and African Medical Specialists
 */

const CLINIC_DATA = {
  clinicInfo: {
    name: "MAKINI MEDICAL CENTER",
    shortName: "Makini Medical Center",
    legalName: "Makini Medical Center Ltd",
    tagline: "Compassionate, World-Class Primary Healthcare in Kerugoya, Kirinyaga",
    chiefDoctor: "Dr. Ngary, MD",
    phone: "+254796384362",
    receptionPhone: "+254796384362",
    whatsapp: "+254796384362",
    whatsappUrl: "https://wa.me/254796384362?text=Hello%20Makini%20Medical%20Center,%20I%20would%20like%20to%20inquire%20about%20medical%20services",
    email: "care@makinimedical.com",
    address: "Kerugoya Town, Kirinyaga County, Kenya",
    location: "Kerugoya, Kirinyaga, Kenya",
    urgentCareHours: "24/7 Everyday (Always Open)",
    clinicHours: "Mon - Sat: 7:30 AM - 8:30 PM | Sun: 8:30 AM - 4:00 PM",
    accreditations: [
      "Certified Healthcare Facility - Ministry of Health Kenya",
      "ISO 9001:2015 Quality Management",
      "African Healthcare Excellence Award"
    ]
  },

  departments: [
    {
      id: "general-medicine",
      name: "General & Family Medicine",
      icon: "🩺",
      tagline: "Comprehensive routine checkups, acute illness care & chronic disease management",
      leadDoctor: "Dr. Ngary, MD (Medical Director)",
      consultFee: "$35",
      avgWait: "10 mins",
      features: [
        "Comprehensive Adult & Family Health Consultations",
        "Hypertension, Diabetes & Chronic Disease Care",
        "Malaria, Typhoid & Tropical Disease Diagnostics",
        "Preventive Health Screenings & Wellness Plans"
      ]
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Child Wellness",
      icon: "🧸",
      tagline: "Gentle, compassionate healthcare from newborn to adolescent",
      leadDoctor: "Dr. Amina Bello, MD, FAAP",
      consultFee: "$30",
      avgWait: "8 mins",
      features: [
        "Newborn & Infant Growth Milestone Checks",
        "Routine Childhood Immunization & Vaccinations",
        "Pediatric Fever, Asthma & Nutritional Care",
        "School & Sports Entry Physical Examinations"
      ]
    },
    {
      id: "dental",
      name: "Dentistry & Oral Health",
      icon: "🦷",
      tagline: "Preventive dental care, painless extractions & restorative hygiene",
      leadDoctor: "Dr. Kwame Mensah, DDS",
      consultFee: "$40",
      avgWait: "12 mins",
      features: [
        "Comprehensive Dental Exams & Digital X-Rays",
        "Ultrasonic Scaling, Polishing & Deep Cleaning",
        "Painless Tooth Extractions & Composite Fillings",
        "Emergency Toothache Relief & Abscess Care"
      ]
    },
    {
      id: "maternity",
      name: "Maternity & Women's Health (OB-GYN)",
      icon: "🌸",
      tagline: "Dedicated prenatal, antenatal, ultrasound & maternal wellness",
      leadDoctor: "Dr. Zainab Njoroge, MD, FWACS",
      consultFee: "$45",
      avgWait: "15 mins",
      features: [
        "Antenatal & Postnatal Care Programs",
        "High-Resolution 2D/3D Obstetric Ultrasound",
        "Family Planning & Reproductive Wellness",
        "Cervical Cancer Screening & Pap Smears"
      ]
    },
    {
      id: "diagnostics",
      name: "Diagnostic Laboratory & Imaging",
      icon: "🔬",
      tagline: "Rapid certified laboratory tests, digital X-ray & ultrasound",
      leadDoctor: "Dr. Emmanuel Diallo, MD, MSc",
      consultFee: "$25",
      avgWait: "15 mins",
      features: [
        "15-Minute Rapid Malaria, Typhoid & HIV Panels",
        "Automated Complete Blood Count (CBC) & Chemistries",
        "Low-Dose Digital Chest & Bone Radiography (X-Ray)",
        "Abdominal & Pelvic Ultrasound Sonography"
      ]
    },
    {
      id: "urgent-care",
      name: "24/7 Urgent Care & Minor Procedures",
      icon: "⚡",
      tagline: "Walk-in care for acute injuries, infections, cuts & dehydration",
      leadDoctor: "Officer Kwesi Mensah, RN & Triage Team",
      consultFee: "$35",
      avgWait: "5 mins",
      features: [
        "Immediate Wound Cleansing, Dressing & Suturing",
        "Intravenous (IV) Fluid Hydration Therapy",
        "Asthma Nebulizer Support & Oxygen Therapy",
        "Minor Burn Management & Splinting"
      ]
    }
  ],

  doctors: [
    {
      id: "doc-ngary",
      name: "Dr. Ngary, MD",
      isChief: true,
      title: "Chief Medical Officer & Founder",
      departmentId: "general-medicine",
      departmentName: "General & Family Medicine",
      credentials: "MD, Chief Physician • Specialist in Family Medicine",
      experience: "15+ Years Clinical Experience",
      rating: 4.99,
      reviewsCount: 840,
      image: "assets/images/dr_ngary_chief_portrait.jpg",
      originalImage: "assets/images/dr_ngary_original.jpg",
      languages: ["English", "French", "Wolof"],
      nextAvailable: "Today at 2:30 PM",
      bio: "Dr. Ngary is the founder and Medical Director of Makini Medical Center. Passionate about accessible, community-centered primary care, Dr. Ngary combines cutting-edge clinical protocols with empathetic, patient-first medicine to serve families with dignity and excellence.",
      education: [
        "Doctor of Medicine (MD) with Distinctions",
        "Post-Graduate Residency in Family & Community Medicine",
        "Fellow, African College of Primary Healthcare Physicians"
      ],
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-bello",
      name: "Dr. Amina Bello",
      isChief: false,
      title: "Head of Pediatrics & Child Health",
      departmentId: "pediatrics",
      departmentName: "Pediatrics",
      credentials: "MD, FAAP • Senior Pediatric Specialist",
      experience: "12 Years Experience",
      rating: 4.97,
      reviewsCount: 520,
      image: "assets/images/doctor_amina_bello.jpg",
      languages: ["English", "Swahili", "Hausa"],
      nextAvailable: "Today at 3:15 PM",
      bio: "Dr. Amina Bello brings gentle warmth and deep clinical expertise to pediatric medicine, ensuring infants and children feel safe, happy, and thoroughly cared for across all growth stages.",
      education: [
        "Bachelor of Medicine, Bachelor of Surgery (MBChB)",
        "Fellowship in Pediatric Infectious Disease & Child Wellness"
      ],
      availableDays: ["Mon", "Tue", "Wed", "Fri", "Sat"]
    },
    {
      id: "doc-njoroge",
      name: "Dr. Zainab Njoroge",
      isChief: false,
      title: "Head of Obstetrics & Women's Health",
      departmentId: "maternity",
      departmentName: "Women's Health (OB-GYN)",
      credentials: "MD, FWACS • Maternal-Fetal Care Specialist",
      experience: "16 Years Experience",
      rating: 4.98,
      reviewsCount: 610,
      image: "assets/images/doctor_zainab_njoroge.jpg",
      languages: ["English", "Igbo", "French"],
      nextAvailable: "Today at 4:00 PM",
      bio: "Dr. Zainab Njoroge provides empowering, compassionate care for mothers throughout all stages of pregnancy, antenatal scans, delivery planning, and gynecological health.",
      education: [
        "Doctor of Medicine (MD)",
        "Fellow of the West African College of Surgeons (FWACS)"
      ],
      availableDays: ["Mon", "Wed", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-mensah",
      name: "Dr. Kwame Mensah",
      isChief: false,
      title: "Director of Dental Surgery & Oral Health",
      departmentId: "dental",
      departmentName: "Dentistry",
      credentials: "DDS, MS • Specialist in Painless Oral Care",
      experience: "14 Years Experience",
      rating: 4.96,
      reviewsCount: 430,
      image: "assets/images/doctor_mensah_portrait.jpg",
      languages: ["English", "Twi", "Yoruba"],
      nextAvailable: "Tomorrow at 9:30 AM",
      bio: "Dr. Kwame Mensah is dedicated to pain-free, modern dental procedures, helping patients regain bright, healthy smiles through gentle cleanings, restorations, and preventive oral health.",
      education: [
        "Doctor of Dental Surgery (DDS) with Honours",
        "Advanced Certification in Esthetic & Restorative Dentistry"
      ],
      availableDays: ["Mon", "Tue", "Thu", "Fri", "Sat"]
    },
    {
      id: "doc-diallo",
      name: "Dr. Emmanuel Diallo",
      isChief: false,
      title: "Director of Pathology & Diagnostic Laboratory",
      departmentId: "diagnostics",
      departmentName: "Diagnostics & Lab",
      credentials: "MD, MSc • Senior Clinical Pathologist",
      experience: "18 Years Experience",
      rating: 4.95,
      reviewsCount: 380,
      image: "assets/images/doctor_emmanuel_diallo.jpg",
      languages: ["English", "French", "Fulani"],
      nextAvailable: "Today at 1:45 PM",
      bio: "Dr. Emmanuel Diallo leads our modern diagnostic facility, ensuring rapid, highly accurate bloodwork, microscopy, and imaging reports to support timely clinical decisions.",
      education: [
        "Doctor of Medicine (MD)",
        "Master of Science in Clinical Microbiology & Molecular Pathology"
      ],
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri"]
    },
    {
      id: "nurse-mensah",
      name: "Officer Kwesi Mensah",
      isChief: false,
      title: "Lead Clinical Nurse & Urgent Triage Director",
      departmentId: "urgent-care",
      departmentName: "Urgent Care & Triage",
      credentials: "RN, BSN • Certified Emergency & Primary Care Nurse",
      experience: "10 Years Experience",
      rating: 4.99,
      reviewsCount: 720,
      image: "assets/images/doctor_kofi_mensah.jpg",
      languages: ["English", "Twi", "Ga"],
      nextAvailable: "Immediate Walk-In Available",
      bio: "Officer Kwesi oversees our 24/7 urgent walk-in triage, wound care, and emergency stabilization, bringing unmatched compassion, clinical calmness, and attentive patient care.",
      education: [
        "Bachelor of Science in Nursing (BSN)",
        "Advanced Trauma & Pediatric Life Support Certification"
      ],
      availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    }
  ],

  symptomsDatabase: [
    {
      id: "sym-fever",
      icon: "🤒",
      label: "Fever, Body Aches & Chills",
      departmentId: "general-medicine",
      recommendedDoctorId: "doc-ngary",
      urgency: "priority",
      urgencyText: "Same-Day Clinical Care",
      advice: "Recommended for rapid malaria testing, typhoid screening, or viral influenza evaluation with Dr. Ngary. Our on-site diagnostic lab delivers results in under 20 minutes."
    },
    {
      id: "sym-cough",
      icon: "🫁",
      label: "Persistent Cough or Breathing Difficulty",
      departmentId: "general-medicine",
      recommendedDoctorId: "doc-ngary",
      urgency: "priority",
      urgencyText: "Evaluation Recommended",
      advice: "Important to rule out bronchitis, respiratory infections, or asthma exacerbation. Digital chest X-ray and immediate nebulizer support are on-site."
    },
    {
      id: "sym-child",
      icon: "👶",
      label: "Child Fever, Diarrhea or Rash",
      departmentId: "pediatrics",
      recommendedDoctorId: "doc-bello",
      urgency: "priority",
      urgencyText: "Pediatric Same-Day Care",
      advice: "Young children require immediate hydration assessment and temperature control. Dr. Amina Bello and our pediatric nurses provide gentle care."
    },
    {
      id: "sym-tooth",
      icon: "🦷",
      label: "Severe Toothache, Bleeding or Cavity",
      departmentId: "dental",
      recommendedDoctorId: "doc-mensah",
      urgency: "priority",
      urgencyText: "Dental Relief Available",
      advice: "Immediate toothache relief, gentle cavity cleaning, and abscess treatment with Dr. Kofi Mensah. Painless local anesthetic ensures maximum comfort."
    },
    {
      id: "sym-pregnancy",
      icon: "🤰",
      label: "Prenatal Checkup or Ultrasound Scan",
      departmentId: "maternity",
      recommendedDoctorId: "doc-njoroge",
      urgency: "routine",
      urgencyText: "Routine Maternal Care",
      advice: "Comprehensive antenatal visit with Dr. Zainab Njoroge, including 2D/3D ultrasound imaging, fetal heartbeat monitor, blood pressure, and maternal guidance."
    },
    {
      id: "sym-wound",
      icon: "🩹",
      label: "Minor Cut, Burn, Sprain or Trauma",
      departmentId: "urgent-care",
      recommendedDoctorId: "nurse-mensah",
      urgency: "emergency",
      urgencyText: "Immediate Walk-In",
      advice: "Walk in immediately with zero appointment required. Our 24/7 Urgent Care team provides sterile wound suturing, burn dressing, and tetanus protection."
    },
    {
      id: "sym-checkup",
      icon: "📋",
      label: "Annual Physical & Routine Bloodwork",
      departmentId: "general-medicine",
      recommendedDoctorId: "doc-ngary",
      urgency: "routine",
      urgencyText: "Preventive Health",
      advice: "Full physical checkup with Dr. Ngary, MD including blood pressure check, fasting blood sugar, cholesterol screen, and tailored lifestyle prescription."
    }
  ],

  insuranceProviders: [
    { name: "National Health Insurance (NHIF / SHIF)", coPay: "$0 Copay", coverage: "100% Basic Outpatient Services", tier: "National Scheme" },
    { name: "Jubilee Health Insurance", coPay: "$0 - $5 Copay", coverage: "Direct Billing Approved", tier: "Gold Network" },
    { name: "AXA Mansard Health", coPay: "Zero Out-of-Pocket", coverage: "Comprehensive Consult & Labs", tier: "Platinum Network" },
    { name: "Sanlam Healthcare", coPay: "$0 Copay", coverage: "Full Outpatient Primary Care", tier: "Gold Network" },
    { name: "Old Mutual Health", coPay: "Direct Billing", coverage: "Direct Reimbursement Accepted", tier: "Gold Network" },
    { name: "Cigna Global Health", coPay: "Zero Copay", coverage: "International Direct Billing", tier: "International" },
    { name: "Bupa Global / International", coPay: "Direct Billing", coverage: "Full Direct Reimbursement", tier: "International" },
    { name: "Hygeia HMO", coPay: "$5 Flat Copay", coverage: "Tier 1 Clinic Provider", tier: "Silver Network" },
    { name: "Reliance HMO", coPay: "$5 Flat Copay", coverage: "Direct Billing Approved", tier: "Silver Network" },
    { name: "Community Sliding Scale / Self-Pay", coPay: "Affordable Subsidized Fee", coverage: "Subsidized Clinic Care", tier: "Community Fund" }
  ],

  mockPatientPortal: {
    patient: {
      name: "Kwame Mensah",
      id: "NG-84920",
      dob: "14 May 1988",
      bloodType: "O+",
      primaryDoctor: "Dr. Ngary, MD",
      phone: "+254796384362",
      email: "kwame.m@example.com"
    },
    activeAppointments: [
      {
        id: "APT-8821",
        doctor: "Dr. Ngary, MD",
        specialty: "General & Family Medicine",
        room: "Consultation Suite 101",
        status: "Confirmed",
        date: "Today at 2:30 PM",
        type: "In-Person Consultation"
      }
    ],
    labResults: [
      {
        test: "Rapid Malaria RDT & Blood Smear",
        date: "Oct 16, 2026",
        value: "Negative (No Parasites)",
        reference: "Negative",
        status: "Normal"
      },
      {
        test: "Fasting Blood Glucose",
        date: "Oct 10, 2026",
        value: "92 mg/dL",
        reference: "70 - 99 mg/dL",
        status: "Optimal"
      },
      {
        test: "Complete Blood Count (CBC)",
        date: "Sep 28, 2026",
        value: "Hb 14.8 g/dL • WBC 6.2",
        reference: "Normal Parameters",
        status: "Normal"
      },
      {
        test: "Lipid Profile & Cholesterol",
        date: "Aug 15, 2026",
        value: "Total 172 mg/dL",
        reference: "< 200 mg/dL",
        status: "Optimal"
      }
    ],
    prescriptions: [
      {
        id: "RX-5541",
        medication: "Amoxicillin / Clavulanate 625mg",
        dosage: "1 tablet every 12 hours with meals",
        prescriber: "Dr. Ngary, MD",
        refillsRemaining: 1,
        status: "Active"
      },
      {
        id: "RX-5219",
        medication: "Multivitamin & Zinc Immune Complex",
        dosage: "1 capsule daily after breakfast",
        prescriber: "Dr. Ngary, MD",
        refillsRemaining: 3,
        status: "Active"
      }
    ]
  }
};

window.CLINIC_DATA = CLINIC_DATA;
