import React, { useState, useEffect } from 'react';
import { X, ReceiptText, AlertCircle } from 'lucide-react';
import { Bill, ClinicConfig, ClinicalVisit, Patient, PaymentMode } from '../../types';

interface CreateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  selectedPatient?: Patient | null;
  selectedVisit?: ClinicalVisit | null;
  clinicConfig: ClinicConfig;
  onSaveBill: (bill: Bill) => void;
  existingBillsCount: number;
}

export const CreateBillModal: React.FC<CreateBillModalProps> = ({
  isOpen,
  onClose,
  patients,
  selectedPatient,
  selectedVisit,
  clinicConfig,
  onSaveBill,
  existingBillsCount,
}) => {
  const currentYear = new Date().getFullYear();
  const nextBillNo = `REC-${currentYear}-${String(existingBillsCount + 1).padStart(3, '0')}`;

  const [patientId, setPatientId] = useState(selectedPatient?.id || (patients[0]?.id || ''));
  const [consultationFee, setConsultationFee] = useState(400);
  const [medicineCharges, setMedicineCharges] = useState(300);
  const [courierOrOtherCharges, setCourierOrOtherCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedPatient) {
      setPatientId(selectedPatient.id);
    }
  }, [selectedPatient]);

  if (!isOpen) return null;

  const activePatient = patients.find((p) => p.id === patientId);
  const totalAmount = Math.max(
    0,
    Number(consultationFee) + Number(medicineCharges) + Number(courierOrOtherCharges) - Number(discount)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) {
      setError('Please select a valid patient');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const newBill: Bill = {
      id: `INV-${Date.now()}`,
      billNumber: nextBillNo,
      patientId: activePatient.id,
      patientName: activePatient.fullName,
      patientPhone: activePatient.phoneNumber,
      visitId: selectedVisit?.id,
      date: todayStr,
      consultationFee: Number(consultationFee),
      medicineCharges: Number(medicineCharges),
      courierOrOtherCharges: Number(courierOrOtherCharges),
      discount: Number(discount),
      totalAmount,
      paymentMode,
      notes: notes.trim() || undefined,
      clinicDetails: clinicConfig,
    };

    onSaveBill(newBill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="px-5 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-teal-300" />
            <h3 className="font-semibold text-lg">Generate Billing Receipt</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Receipt Number Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900 text-xs text-teal-900 dark:text-teal-200">
            <span className="font-medium">Receipt Voucher No:</span>
            <span className="font-mono font-bold">{nextBillNo}</span>
          </div>

          {/* Patient Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Patient *
            </label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.id}) · {p.phoneNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Charges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Consultation Fee ({clinicConfig.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Medicine Charges ({clinicConfig.currencySymbol}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={medicineCharges}
                onChange={(e) => setMedicineCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Courier / Extra ({clinicConfig.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={courierOrOtherCharges}
                onChange={(e) => setCourierOrOtherCharges(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount / Concession ({clinicConfig.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Mode *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Card'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    paymentMode === mode
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Note / Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Note / Transaction Reference (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via Google Pay UPI / Ref 9840291"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Total Summary */}
          <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              Total Amount:
            </span>
            <span className="text-xl font-black text-teal-800 dark:text-teal-400">
              {clinicConfig.currencySymbol}
              {totalAmount.toLocaleString()}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.98] rounded-lg shadow-sm"
            >
              Generate & Save Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
