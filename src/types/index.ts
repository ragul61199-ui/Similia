export type Gender = 'Male' | 'Female' | 'Other' | 'Child';

export interface AttachmentItem {
  id: string;
  name: string;
  type: 'skin_photo' | 'lab_report' | 'xray' | 'prescription_scan' | 'other';
  dataUrl: string;
  date: string;
  caption?: string;
}

export interface PrescriptionItem {
  id: string;
  remedyName: string;
  potency: string; // e.g. 30C, 200C, 1M, 10M, Q, 6X, 12X, 0/1 LM
  dosageVehicle: string; // e.g. Globules #30, Globules #40, Aqua Dist. Dilution, Sac Lac
  frequency: string; // e.g. TDS, BD, OD, SOS, Weekly single dose
  durationDays: number;
  instructions: string; // e.g. "Take 4 pills on clean tongue, avoid raw onion/coffee"
}

export interface ClinicalVisit {
  id: string;
  patientId: string;
  date: string; // YYYY-MM-DD
  chiefComplaints: string;
  modalities?: string; // Aggravation & Amelioration
  generalsNotes?: string; // Thermal state (chilly/hot), thirst, cravings
  pastAndFamilyHistory?: string;
  homeopathicDiagnosis?: string; // e.g. "Constitutional prescribing: Lycopodium clavatum"
  prescriptions: PrescriptionItem[];
  attachments: AttachmentItem[];
  nextFollowUpDate?: string; // YYYY-MM-DD
  doctorNotes?: string;
  billedAmount?: number;
  billId?: string;
}

export interface Patient {
  id: string; // Auto-generated e.g. "HOM-2026-0042"
  fullName: string;
  age: number;
  gender: Gender;
  phoneNumber: string; // WhatsApp enabled phone with country code e.g. +91 98765 43210
  address: string;
  registrationDate: string; // YYYY-MM-DD
  occupation?: string;
  bloodGroup?: string;
  allergies?: string;
  photoUrl?: string; // Base64 or image URL
  visits: ClinicalVisit[];
}

export type MedicineCategory = 
  | 'Dilution'
  | 'Mother Tincture'
  | 'Biochemic'
  | 'Trituration'
  | 'Patent / Special formulation'
  | 'Sundries (Globules, Bottles, Sac Lac)';

export type MedicineUnit = 'ml' | 'grams';

export interface Medicine {
  id: string;
  name: string; // e.g. Arnica Montana
  category: MedicineCategory;
  potency: string; // e.g. 30C, 200C, Q, 6X
  packSize: string; // e.g. 30ml, 100ml, 450ml, 100g, 450g
  currentQuantity: number; // in ml or grams
  unit?: MedicineUnit; // 'ml' | 'grams'
  minThreshold: number; // e.g. 11 (triggers low-stock alert)
  shelfRack: string; // e.g. "Rack B, Shelf 3"
  pricePerUnit: number;
  batchNumber?: string;
  expiryDate?: string;
  updatedAt: string;
}

/**
 * Returns the correct measurement unit ('ml' or 'grams') for a medicine.
 * Rules:
 * - Biochemic & Trituration -> grams
 * - Cane Sugar Globules No. 30 (or any globules) -> grams
 * - Sugar of Milk (Lactose Sac Lac) -> grams
 * - Otherwise defaults to 'ml' (for dilutions, mother tinctures, etc.)
 */
export function getMedicineUnit(med: { category?: string; name?: string; unit?: string }): MedicineUnit {
  if (med.unit === 'grams' || med.unit === 'ml') {
    return med.unit;
  }
  const category = (med.category || '').toLowerCase();
  const name = (med.name || '').toLowerCase();

  // Biochemic remedies and triturations are measured in grams
  if (category.includes('biochemic') || category.includes('trituration')) {
    return 'grams';
  }

  // Cane Sugar Globules No. 30 or globules must be in grams
  if (name.includes('cane sugar globules') || name.includes('globules')) {
    return 'grams';
  }

  // Sugar of Milk (Lactose Sac Lac) must be in grams
  if (name.includes('sugar of milk') || name.includes('sac lac') || name.includes('lactose')) {
    return 'grams';
  }

  return 'ml';
}

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer';

export interface BillItem {
  description: string;
  amount: number;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. "INV-2026-0108"
  patientId: string;
  patientName: string;
  patientPhone: string;
  visitId?: string;
  date: string; // YYYY-MM-DD
  consultationFee: number;
  medicineCharges: number;
  courierOrOtherCharges: number;
  discount: number;
  totalAmount: number;
  paymentMode: PaymentMode;
  notes?: string;
  clinicDetails: ClinicConfig;
}

export interface FollowUpItem {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  visitId: string;
  scheduledDate: string; // YYYY-MM-DD
  chiefComplaint: string;
  lastRemedy: string;
  status: 'upcoming' | 'today' | 'missed' | 'completed';
  notes?: string;
}

export interface ClinicConfig {
  clinicName: string;
  doctorName: string;
  qualifications: string; // e.g. "B.H.M.S., M.D. (Hom.)"
  registrationNumber: string; // e.g. "REG-HOM-48192"
  phone: string;
  email: string;
  address: string;
  upiId: string;
  currencySymbol: string;
  thankYouNote: string;
  clinicLogo?: string; // Base64 data URL
  physicianSignature?: string; // Base64 data URL
  themeMode?: 'light' | 'dark';
  accentColor?: 'teal' | 'emerald' | 'blue' | 'indigo' | 'purple' | 'rose';
}
