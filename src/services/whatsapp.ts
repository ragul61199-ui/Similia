import { Bill, ClinicConfig, ClinicalVisit, Patient } from '../types';

/**
 * Normalizes phone numbers for wa.me links.
 * Strips non-digits; if 10 digits without country code, adds default Indian country code '91'
 * or retains user-specified international prefix.
 */
export function formatPhoneNumberForWhatsApp(rawPhone: string): string {
  if (!rawPhone) return '';
  const digitsOnly = rawPhone.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  return digitsOnly;
}

/**
 * Creates wa.me URL for Follow-Up Reminders
 */
export function createFollowUpReminderUrl(params: {
  patientName: string;
  patientPhone: string;
  clinicName: string;
  scheduledDate: string;
  doctorName: string;
}): string {
  const cleanPhone = formatPhoneNumberForWhatsApp(params.patientPhone);
  const formattedDate = new Date(params.scheduledDate).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message = `🌿 *Follow-Up Reminder*
Dear *${params.patientName}*,

This is a gentle reminder from *${params.clinicName}* regarding your scheduled homeopathic follow-up appointment on:
🗓 *${formattedDate}*

Regular follow-up is vital to evaluate your homeopathic remedy response and adjust potencies as needed.

Please reply to this message to confirm your visit or let us know if you need to reschedule.

Warm regards,
*${params.doctorName}*
${params.clinicName}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates wa.me URL for Patient Receipt & Payment Confirmation
 */
export function createReceiptWhatsAppUrl(bill: Bill, clinic: ClinicConfig): string {
  const cleanPhone = formatPhoneNumberForWhatsApp(bill.patientPhone);
  const formattedDate = new Date(bill.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message = `🧾 *RECEIPT / PAYMENT CONFIRMATION*
*${clinic.clinicName}*
${clinic.doctorName} (${clinic.qualifications})
Reg: ${clinic.registrationNumber}
───────────────────
*Receipt No:* ${bill.billNumber}
*Date:* ${formattedDate}
*Patient Name:* ${bill.patientName} (${bill.patientId})
───────────────────
*Charges Breakdown:*
• Consultation Fee: ${clinic.currencySymbol}${bill.consultationFee.toLocaleString()}
• Medicine Charges: ${clinic.currencySymbol}${bill.medicineCharges.toLocaleString()}${
    bill.courierOrOtherCharges > 0
      ? `\n• Courier / Misc Charges: ${clinic.currencySymbol}${bill.courierOrOtherCharges.toLocaleString()}`
      : ''
  }${
    bill.discount > 0
      ? `\n• Special Concession: -${clinic.currencySymbol}${bill.discount.toLocaleString()}`
      : ''
  }
───────────────────
*TOTAL PAID:* *${clinic.currencySymbol}${bill.totalAmount.toLocaleString()}*
*Payment Mode:* ${bill.paymentMode} (Received)
───────────────────
${clinic.thankYouNote || 'Wishing you vibrant health and speedy recovery!'}

*Contact:* ${clinic.phone} | ${clinic.address}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Creates wa.me URL for Homeopathic Prescription Sharing
 */
export function createPrescriptionWhatsAppUrl(
  patient: Patient,
  visit: ClinicalVisit,
  clinic: ClinicConfig
): string {
  const cleanPhone = formatPhoneNumberForWhatsApp(patient.phoneNumber);
  const formattedDate = new Date(visit.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const remediesText = visit.prescriptions
    .map(
      (p, i) =>
        `${i + 1}. *${p.remedyName}* (${p.potency})
   • Vehicle: ${p.dosageVehicle}
   • Frequency: ${p.frequency} | Duration: ${p.durationDays} Days
   • Instructions: ${p.instructions || 'Take on clean mouth, away from meals'}`
    )
    .join('\n\n');

  const followUpText = visit.nextFollowUpDate
    ? `\n🗓 *Next Follow-up:* ${new Date(visit.nextFollowUpDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`
    : '';

  const message = `🌿 *HOMEOPATHIC PRESCRIPTION*
*${clinic.clinicName}*
${clinic.doctorName} (${clinic.qualifications})
───────────────────
*Patient:* ${patient.fullName} (${patient.id})
*Age/Sex:* ${patient.age} / ${patient.gender}
*Date:* ${formattedDate}
───────────────────
*Prescribed Medicines:*

${remediesText}
${followUpText}
───────────────────
⚠️ *Important Homeopathic Rules:*
• Take remedies with a clean mouth (15-30 min gap before/after eating or drinking).
• Avoid strong aromatics like raw onion, garlic, menthol, camphor, or strong coffee immediately around doses.
• Dissolve pills/globules slowly on tongue.

Contact: ${clinic.phone}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
