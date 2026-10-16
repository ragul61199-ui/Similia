import { Bill, ClinicConfig, ClinicalVisit, FollowUpItem, Medicine, Patient, getMedicineUnit } from '../types';

export const DEFAULT_CLINIC_CONFIG: ClinicConfig = {
  clinicName: 'Similia Homeopathic Healing Clinic',
  doctorName: 'Dr. Vignesh',
  qualifications: 'B.H.M.S., M.D. (Hom.)',
  registrationNumber: 'BHMS-TN-2018-8421',
  phone: '+91 98401 23456',
  email: 'vignesh.bhms13@gmail.com',
  address: '14/2 Green Park Avenue, Near Central Bus Stand, Coimbatore, TN - 641001',
  upiId: 'vignesh.bhms@okhdfcbank',
  currencySymbol: '₹',
  thankYouNote: 'Restoring health gently and permanently through Classical Homeopathy.',
  clinicLogo: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='46' fill='%230d9488'/><circle cx='50' cy='50' r='42' fill='%23ffffff'/><path d='M50 22 L50 78 M22 50 L78 50' stroke='%230d9488' stroke-width='8' stroke-linecap='round'/><path d='M50 28 C60 20 72 26 70 38 C68 48 56 52 50 64' fill='none' stroke='%23059669' stroke-width='3.5' stroke-linecap='round'/><circle cx='50' cy='22' r='3.5' fill='%230d9488'/></svg>",
  physicianSignature: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 80'><path d='M20 50 C35 20 45 15 50 45 C55 65 60 25 75 45 C90 65 110 30 130 40 C145 48 160 35 185 45 C200 52 215 38 230 42 M40 65 L210 55' fill='none' stroke='%230f172a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/><text x='50' y='72' font-family='cursive, sans-serif' font-size='12' fill='%23334155'>Dr. Vignesh, B.H.M.S.</text></svg>",
  themeMode: 'light',
  accentColor: 'teal',
};

// Seed sample patients with realistic clinical cases
const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'HOM-2026-001',
    fullName: 'Ananya Sharma',
    age: 29,
    gender: 'Female',
    phoneNumber: '+91 98412 34567',
    address: 'Flat 402, Lotus Towers, R.S. Puram, Coimbatore',
    registrationDate: '2026-09-15',
    bloodGroup: 'B+',
    occupation: 'Software Engineer',
    allergies: 'Dust mites, synthetic fragrances',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    visits: [
      {
        id: 'VISIT-001',
        patientId: 'HOM-2026-001',
        date: '2026-10-10',
        chiefComplaints: 'Chronic itchy erythematous eczema on bilateral antecubital fossa and neck for 8 months. Aggravation at night, warmth of bed, water contact. Intense burning after scratching.',
        modalities: '< Night, < Warmth of bed, < Washing with soap, > Cold application (temporary)',
        generalsNotes: 'Chilly patient, craves sweets and ice cream. Thirstless despite dry lips. Sleep restless due to pruritus.',
        pastAndFamilyHistory: 'Childhood recurrent tonsillitis; Mother had bronchial asthma.',
        homeopathicDiagnosis: 'Chronic Atopic Eczema - Psoric background. Constitutional prescription.',
        prescriptions: [
          {
            id: 'RX-001',
            remedyName: 'Sulphur',
            potency: '200C',
            dosageVehicle: 'Sugar Globules #30',
            frequency: 'Single Dose',
            durationDays: 1,
            instructions: 'Take 4 pills early morning on empty clean tongue.',
          },
          {
            id: 'RX-002',
            remedyName: 'Berberis Aquifolium',
            potency: 'Q (Mother Tincture)',
            dosageVehicle: 'Aqua Dist. (Dilution)',
            frequency: 'TDS (3 times/day)',
            durationDays: 15,
            instructions: '10 drops in half cup of lukewarm water after food.',
          },
          {
            id: 'RX-003',
            remedyName: 'Sac Lac (Placebo)',
            potency: 'Unmedicated',
            dosageVehicle: 'Globules #40',
            frequency: 'BD (Twice daily)',
            durationDays: 15,
            instructions: '4 globules morning and evening.',
          },
        ],
        attachments: [
          {
            id: 'ATT-001',
            name: 'Eczema Neck & Forearm Initial Lesion',
            type: 'skin_photo',
            date: '2026-10-10',
            caption: 'Erythematous papules with lichenification and scratching marks on flexor surface.',
            dataUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
          },
        ],
        nextFollowUpDate: '2026-10-25',
        doctorNotes: 'Monitor first week for any primary aggravation. If itch increases mildly, advised Sac Lac and cold chamomile compress.',
        billedAmount: 850,
        billId: 'INV-2026-001',
      },
    ],
  },
  {
    id: 'HOM-2026-002',
    fullName: 'Rajesh Subramaniam',
    age: 44,
    gender: 'Male',
    phoneNumber: '+91 97890 12345',
    address: '88, Alagesan Road, Saibaba Colony, Coimbatore',
    registrationDate: '2026-10-02',
    bloodGroup: 'O+',
    occupation: 'Bank Branch Manager',
    allergies: 'No known drug allergies',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    visits: [
      {
        id: 'VISIT-002',
        patientId: 'HOM-2026-002',
        date: '2026-10-16', // Today!
        chiefComplaints: 'Severe right-sided throbbing hemicrania (Migraine) starting in occiput extending to right eye. Nausea and photophobia. High stress and sedentary workload with irregular meal timings.',
        modalities: '< Sun exposure, < Mental strain, < Noise, > Firm pressure, > Resting in dark quiet room',
        generalsNotes: 'Hot patient, craves salty spicy food. Irritable when questioned, hurry in movements. Mild constipation.',
        pastAndFamilyHistory: 'Grade 1 Fatty liver, borderline cholesterol.',
        homeopathicDiagnosis: 'Vascular Cephalea (Migraine) - Nux Vomica constitution.',
        prescriptions: [
          {
            id: 'RX-004',
            remedyName: 'Nux Vomica',
            potency: '200C',
            dosageVehicle: 'Globules #30',
            frequency: 'Nightly (HS)',
            durationDays: 7,
            instructions: '4 pills before sleep, avoid coffee/alcohol.',
          },
          {
            id: 'RX-005',
            remedyName: 'Sanguinaria Canadensis',
            potency: '30C',
            dosageVehicle: 'Globules #30',
            frequency: 'SOS (At onset of pain)',
            durationDays: 14,
            instructions: '4 pills every 3 hours during acute episode.',
          },
        ],
        attachments: [],
        nextFollowUpDate: '2026-10-16', // Scheduled for today to showcase "Today's Follow-up"
        doctorNotes: 'Advised lifestyle modification: fixed sleep timing and brisk 30 min evening walk.',
        billedAmount: 600,
        billId: 'INV-2026-002',
      },
    ],
  },
  {
    id: 'HOM-2026-003',
    fullName: 'Meenakshi Sundaram',
    age: 58,
    gender: 'Female',
    phoneNumber: '+91 94433 87654',
    address: '22 Ramanathapuram Main Road, Coimbatore',
    registrationDate: '2026-09-01',
    bloodGroup: 'A+',
    occupation: 'Homemaker',
    allergies: 'Sulfa drugs',
    photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=200&auto=format&fit=crop&q=80',
    visits: [
      {
        id: 'VISIT-003',
        patientId: 'HOM-2026-003',
        date: '2026-09-28',
        chiefComplaints: 'Bilateral knee osteoarthritis, stiffness on first moving which eases after continued walking. Crepitus and swelling on damp rainy days.',
        modalities: '< Damp cold weather, < First motion, > Continuous gentle movement, > Warm fomentation',
        generalsNotes: 'Chilly, restlessness of limbs at night, craves warm milk.',
        pastAndFamilyHistory: 'Hypertension on Telmisartan 40mg.',
        homeopathicDiagnosis: 'Degenerative Osteoarthritis - Rhus Toxicodendron syndrome.',
        prescriptions: [
          {
            id: 'RX-006',
            remedyName: 'Rhus Toxicodendron',
            potency: '200C',
            dosageVehicle: 'Globules #30',
            frequency: 'BD (Morning & Night)',
            durationDays: 15,
            instructions: '4 pills on clean tongue.',
          },
          {
            id: 'RX-007',
            remedyName: 'Calcarea Fluorica',
            potency: '6X (Biochemic)',
            dosageVehicle: 'Biochemic Tablets',
            frequency: 'TDS (3 times/day)',
            durationDays: 30,
            instructions: '4 tablets dissolved in 1 sip of warm water.',
          },
        ],
        attachments: [
          {
            id: 'ATT-002',
            name: 'Knee Joint AP & Lateral X-Ray',
            type: 'xray',
            date: '2026-09-28',
            caption: 'Narrowed medial joint space with mild osteophyte formation.',
            dataUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
          },
        ],
        nextFollowUpDate: '2026-10-12', // Past date to showcase "Missed Follow-up"
        doctorNotes: 'Follow-up overdue by 4 days. Send gentle WhatsApp reminder.',
        billedAmount: 950,
        billId: 'INV-2026-003',
      },
    ],
  },
];

// Seed realistic medicine stock inventory across Homeopathic categories
// Seed realistic medicine stock inventory in milliliters (ml)
const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'MED-001',
    name: 'Arnica Montana',
    category: 'Dilution',
    potency: '200C',
    packSize: '100ml',
    currentQuantity: 8, // 8 ml -> Low stock alert (< 11 ml)!
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 1',
    pricePerUnit: 140,
    batchNumber: 'SBL-2026-44',
    expiryDate: '2030-05',
    updatedAt: '2026-10-14',
  },
  {
    id: 'MED-002',
    name: 'Arnica Montana',
    category: 'Dilution',
    potency: '1M',
    packSize: '30ml',
    currentQuantity: 24, // 24 ml
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 1',
    pricePerUnit: 95,
    batchNumber: 'SCH-26-90',
    expiryDate: '2031-01',
    updatedAt: '2026-10-10',
  },
  {
    id: 'MED-003',
    name: 'Berberis Aquifolium',
    category: 'Mother Tincture',
    potency: 'Q',
    packSize: '100ml',
    currentQuantity: 5, // 5 ml -> Critical low stock alert (< 11 ml)!
    minThreshold: 11,
    shelfRack: 'Rack B, Shelf 2 (MT Section)',
    pricePerUnit: 220,
    batchNumber: 'WSI-25-102',
    expiryDate: '2029-11',
    updatedAt: '2026-10-15',
  },
  {
    id: 'MED-004',
    name: 'Crataegus Oxyacantha',
    category: 'Mother Tincture',
    potency: 'Q',
    packSize: '100ml',
    currentQuantity: 65, // 65 ml
    minThreshold: 11,
    shelfRack: 'Rack B, Shelf 2 (MT Section)',
    pricePerUnit: 240,
    batchNumber: 'SBL-26-311',
    expiryDate: '2030-03',
    updatedAt: '2026-10-08',
  },
  {
    id: 'MED-005',
    name: 'Nux Vomica',
    category: 'Dilution',
    potency: '30C',
    packSize: '30ml',
    currentQuantity: 22, // 22 ml
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 3',
    pricePerUnit: 80,
    batchNumber: 'BNS-26-19',
    expiryDate: '2031-04',
    updatedAt: '2026-10-12',
  },
  {
    id: 'MED-006',
    name: 'Nux Vomica',
    category: 'Dilution',
    potency: '200C',
    packSize: '100ml',
    currentQuantity: 9, // 9 ml -> Low stock alert (< 11 ml)!
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 3',
    pricePerUnit: 145,
    batchNumber: 'SBL-26-88',
    expiryDate: '2030-08',
    updatedAt: '2026-10-11',
  },
  {
    id: 'MED-007',
    name: 'Sulphur',
    category: 'Dilution',
    potency: '200C',
    packSize: '30ml',
    currentQuantity: 18, // 18 ml
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 4',
    pricePerUnit: 85,
    batchNumber: 'SCH-26-401',
    expiryDate: '2031-06',
    updatedAt: '2026-10-09',
  },
  {
    id: 'MED-008',
    name: 'Rhus Toxicodendron',
    category: 'Dilution',
    potency: '200C',
    packSize: '100ml',
    currentQuantity: 42, // 42 ml
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 2',
    pricePerUnit: 140,
    batchNumber: 'WSI-26-77',
    expiryDate: '2030-10',
    updatedAt: '2026-10-12',
  },
  {
    id: 'MED-009',
    name: 'Calcarea Fluorica',
    category: 'Biochemic',
    potency: '6X',
    packSize: '100g',
    currentQuantity: 7, // 7 grams -> Low stock alert (< 11 grams)!
    unit: 'grams',
    minThreshold: 11,
    shelfRack: 'Rack C, Shelf 1 (Biochemic)',
    pricePerUnit: 480,
    batchNumber: 'SBL-BC-2601',
    expiryDate: '2030-12',
    updatedAt: '2026-10-05',
  },
  {
    id: 'MED-010',
    name: 'Magnesia Phosphorica',
    category: 'Biochemic',
    potency: '6X',
    packSize: '100g',
    currentQuantity: 55, // 55 grams
    unit: 'grams',
    minThreshold: 11,
    shelfRack: 'Rack C, Shelf 1 (Biochemic)',
    pricePerUnit: 480,
    batchNumber: 'SBL-BC-2608',
    expiryDate: '2031-02',
    updatedAt: '2026-10-12',
  },
  {
    id: 'MED-011',
    name: 'Ferrum Phosphoricum',
    category: 'Biochemic',
    potency: '6X',
    packSize: '100g',
    currentQuantity: 9, // 9 grams -> Low stock alert (< 11 grams)!
    unit: 'grams',
    minThreshold: 11,
    shelfRack: 'Rack C, Shelf 2 (Biochemic)',
    pricePerUnit: 480,
    batchNumber: 'SBL-BC-2615',
    expiryDate: '2031-05',
    updatedAt: '2026-10-14',
  },
  {
    id: 'MED-012',
    name: 'Pulsatilla Nigricans',
    category: 'Dilution',
    potency: '30C',
    packSize: '30ml',
    currentQuantity: 28, // 28 ml
    unit: 'ml',
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 2',
    pricePerUnit: 85,
    batchNumber: 'SCH-26-12',
    expiryDate: '2031-07',
    updatedAt: '2026-10-14',
  },
  {
    id: 'MED-013',
    name: 'Thuja Occidentalis',
    category: 'Dilution',
    potency: '1M',
    packSize: '30ml',
    currentQuantity: 10, // 10 ml -> Low stock alert (< 11 ml)!
    unit: 'ml',
    minThreshold: 11,
    shelfRack: 'Rack A, Shelf 4',
    pricePerUnit: 95,
    batchNumber: 'SBL-26-44',
    expiryDate: '2031-08',
    updatedAt: '2026-10-15',
  },
  {
    id: 'MED-014',
    name: 'Cane Sugar Globules No. 30',
    category: 'Sundries (Globules, Bottles, Sac Lac)',
    potency: 'Size 30',
    packSize: '450g Container',
    currentQuantity: 180, // in grams
    unit: 'grams',
    minThreshold: 50,
    shelfRack: 'Sundries Bay 1',
    pricePerUnit: 220,
    batchNumber: 'GLO-30-26A',
    expiryDate: '2030-01',
    updatedAt: '2026-10-15',
  },
  {
    id: 'MED-015',
    name: 'Sugar of Milk (Lactose Sac Lac)',
    category: 'Sundries (Globules, Bottles, Sac Lac)',
    potency: 'Pure Grade',
    packSize: '450g / 1kg',
    currentQuantity: 8, // 8 grams -> Low stock alert!
    unit: 'grams',
    minThreshold: 15,
    shelfRack: 'Sundries Bay 2',
    pricePerUnit: 450,
    batchNumber: 'LAC-26-8',
    expiryDate: '2028-09',
    updatedAt: '2026-10-13',
  },
];

// Seed initial bills
const INITIAL_BILLS: Bill[] = [
  {
    id: 'INV-2026-001',
    billNumber: 'REC-2026-001',
    patientId: 'HOM-2026-001',
    patientName: 'Ananya Sharma',
    patientPhone: '+91 98412 34567',
    visitId: 'VISIT-001',
    date: '2026-10-10',
    consultationFee: 400,
    medicineCharges: 450,
    courierOrOtherCharges: 0,
    discount: 0,
    totalAmount: 850,
    paymentMode: 'UPI',
    notes: 'Received via Google Pay / UPI',
    clinicDetails: DEFAULT_CLINIC_CONFIG,
  },
  {
    id: 'INV-2026-002',
    billNumber: 'REC-2026-002',
    patientId: 'HOM-2026-002',
    patientName: 'Rajesh Subramaniam',
    patientPhone: '+91 97890 12345',
    visitId: 'VISIT-002',
    date: '2026-10-16',
    consultationFee: 350,
    medicineCharges: 250,
    courierOrOtherCharges: 0,
    discount: 0,
    totalAmount: 600,
    paymentMode: 'Cash',
    notes: 'Cash received at clinic OPD counter',
    clinicDetails: DEFAULT_CLINIC_CONFIG,
  },
  {
    id: 'INV-2026-003',
    billNumber: 'REC-2026-003',
    patientId: 'HOM-2026-003',
    patientName: 'Meenakshi Sundaram',
    patientPhone: '+91 94433 87654',
    visitId: 'VISIT-003',
    date: '2026-09-28',
    consultationFee: 400,
    medicineCharges: 550,
    courierOrOtherCharges: 0,
    discount: 0,
    totalAmount: 950,
    paymentMode: 'UPI',
    notes: 'PhonePe UPI confirmation ref 4892019',
    clinicDetails: DEFAULT_CLINIC_CONFIG,
  },
];

const STORAGE_KEYS = {
  PATIENTS: 'similia_patients_v1',
  MEDICINES: 'similia_medicines_v1',
  BILLS: 'similia_bills_v1',
  CONFIG: 'similia_config_v1',
};

export const StorageService = {
  getClinicConfig(): ClinicConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? JSON.parse(data) : DEFAULT_CLINIC_CONFIG;
    } catch {
      return DEFAULT_CLINIC_CONFIG;
    }
  },

  saveClinicConfig(config: ClinicConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  },

  savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  updatePatient(updatedPatient: Patient): void {
    const list = this.getPatients().map((p) => (p.id === updatedPatient.id ? updatedPatient : p));
    this.savePatients(list);
  },

  deletePatient(patientId: string): void {
    // 1. Remove patient
    const list = this.getPatients().filter((p) => p.id !== patientId);
    this.savePatients(list);

    // 2. Remove associated bills
    const remainingBills = this.getBills().filter((b) => b.patientId !== patientId);
    this.saveBills(remainingBills);
  },

  updateVisit(patientId: string, updatedVisit: ClinicalVisit): void {
    const list = this.getPatients().map((p) => {
      if (p.id === patientId) {
        const updatedVisits = p.visits.map((v) => (v.id === updatedVisit.id ? updatedVisit : v));
        return { ...p, visits: updatedVisits };
      }
      return p;
    });
    this.savePatients(list);
  },

  getMedicines(): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (!data) return INITIAL_MEDICINES;
      const parsed: Medicine[] = JSON.parse(data);
      
      const normalized: Medicine[] = parsed.map((m) => ({
        ...m,
        unit: getMedicineUnit(m),
        minThreshold: m.minThreshold ?? 11,
      }));

      // Ensure Cane Sugar Globules No. 30 is included in stock
      const hasGlobules = normalized.some((m) => m.name.toLowerCase().includes('cane sugar globules'));
      if (!hasGlobules) {
        const globuleSeed = INITIAL_MEDICINES.find((m) => m.name.includes('Cane Sugar Globules'));
        if (globuleSeed) {
          normalized.push({
            ...globuleSeed,
            unit: getMedicineUnit(globuleSeed),
          });
        }
      }

      return normalized;
    } catch {
      return INITIAL_MEDICINES;
    }
  },

  saveMedicines(medicines: Medicine[]): void {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  },

  getBills(): Bill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BILLS);
      return data ? JSON.parse(data) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  },

  saveBills(bills: Bill[]): void {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  // Derive follow-ups dynamically from patient clinical visit history
  getFollowUps(): FollowUpItem[] {
    const patients = this.getPatients();
    const todayStr = new Date().toISOString().split('T')[0];
    const followUps: FollowUpItem[] = [];

    patients.forEach((p) => {
      p.visits.forEach((v) => {
        if (v.nextFollowUpDate) {
          const scheduled = v.nextFollowUpDate;
          let status: FollowUpItem['status'] = 'upcoming';

          if (scheduled === todayStr) {
            status = 'today';
          } else if (scheduled < todayStr) {
            status = 'missed';
          } else {
            status = 'upcoming';
          }

          const lastRemedy = v.prescriptions[0]
            ? `${v.prescriptions[0].remedyName} ${v.prescriptions[0].potency}`
            : 'Constitutional';

          followUps.push({
            id: `FU-${p.id}-${v.id}`,
            patientId: p.id,
            patientName: p.fullName,
            patientPhone: p.phoneNumber,
            visitId: v.id,
            scheduledDate: scheduled,
            chiefComplaint: v.chiefComplaints.slice(0, 80) + '...',
            lastRemedy,
            status,
            notes: v.doctorNotes,
          });
        }
      });
    });

    // Sort by scheduled date
    return followUps.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  },

  resetToDemo(): void {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.MEDICINES);
    localStorage.removeItem(STORAGE_KEYS.BILLS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  },

  exportBackupJson(): string {
    const data = {
      patients: this.getPatients(),
      medicines: this.getMedicines(),
      bills: this.getBills(),
      config: this.getClinicConfig(),
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importBackupJson(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.patients && Array.isArray(data.patients)) {
        this.savePatients(data.patients);
      }
      if (data.medicines && Array.isArray(data.medicines)) {
        this.saveMedicines(data.medicines);
      }
      if (data.bills && Array.isArray(data.bills)) {
        this.saveBills(data.bills);
      }
      if (data.config) {
        this.saveClinicConfig(data.config);
      }
      return true;
    } catch {
      return false;
    }
  },
};
