import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  Plus,
  Trash2,
  Camera,
  Upload,
  Calendar,
  AlertCircle,
  FileText,
  CreditCard,
  ChevronDown,
} from 'lucide-react';
import { AttachmentItem, ClinicConfig, ClinicalVisit, Patient, PrescriptionItem } from '../../types';
import {
  COMMON_REMEDIES,
  COMMON_POTENCIES,
  COMMON_VEHICLES,
  COMMON_FREQUENCIES,
  COMMON_DURATIONS,
  QUICK_INSTRUCTIONS,
} from '../../data/homeopathyData';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  clinicConfig: ClinicConfig;
  initialVisit?: ClinicalVisit | null;
  onSaveVisit: (visit: ClinicalVisit, autoCreateBill: boolean, billData?: { consultationFee: number; medicineCharges: number; paymentMode: any }) => void;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  clinicConfig,
  initialVisit,
  onSaveVisit,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [modalities, setModalities] = useState('');
  const [generalsNotes, setGeneralsNotes] = useState('');
  const [homeopathicDiagnosis, setHomeopathicDiagnosis] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      remedyName: '',
      potency: '200C',
      dosageVehicle: 'Globules #30',
      frequency: 'BD',
      durationDays: 15,
      instructions: 'Take 4 globules on clean mouth, away from meals.',
    },
  ]);

  // Media attachments state
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attachmentCaption, setAttachmentCaption] = useState('');
  const [attachmentType, setAttachmentType] = useState<AttachmentItem['type']>('skin_photo');

  // Auto-Billing State
  const [createBillNow, setCreateBillNow] = useState(true);
  const [consultationFee, setConsultationFee] = useState(400);
  const [medicineCharges, setMedicineCharges] = useState(350);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  const [error, setError] = useState('');

  const isEditMode = !!initialVisit;

  React.useEffect(() => {
    if (initialVisit) {
      setDate(initialVisit.date);
      setChiefComplaints(initialVisit.chiefComplaints || '');
      setModalities(initialVisit.modalities || '');
      setGeneralsNotes(initialVisit.generalsNotes || '');
      setHomeopathicDiagnosis(initialVisit.homeopathicDiagnosis || '');
      setDoctorNotes(initialVisit.doctorNotes || '');
      setNextFollowUpDate(initialVisit.nextFollowUpDate || '');
      setPrescriptions(
        initialVisit.prescriptions && initialVisit.prescriptions.length > 0
          ? initialVisit.prescriptions
          : [
              {
                id: 'rx-1',
                remedyName: '',
                potency: '200C',
                dosageVehicle: 'Globules #30',
                frequency: 'BD',
                durationDays: 15,
                instructions: 'Take 4 globules on clean mouth.',
              },
            ]
      );
      setAttachments(initialVisit.attachments || []);
      setCreateBillNow(false);
    } else {
      setDate(todayStr);
      setChiefComplaints('');
      setModalities('');
      setGeneralsNotes('');
      setHomeopathicDiagnosis('');
      setDoctorNotes('');
      setNextFollowUpDate('');
      setPrescriptions([
        {
          id: 'rx-1',
          remedyName: '',
          potency: '200C',
          dosageVehicle: 'Globules #30',
          frequency: 'BD',
          durationDays: 15,
          instructions: 'Take 4 globules on clean mouth, away from meals.',
        },
      ]);
      setAttachments([]);
      setCreateBillNow(true);
    }
    setError('');
  }, [initialVisit, isOpen]);

  if (!isOpen) return null;

  // Add another remedy
  const handleAddRemedy = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: `rx-${Date.now()}`,
        remedyName: '',
        potency: '30C',
        dosageVehicle: 'Globules #30',
        frequency: 'TDS',
        durationDays: 15,
        instructions: 'Take 4 globules on clean tongue.',
      },
    ]);
  };

  const handleRemoveRemedy = (index: number) => {
    if (prescriptions.length === 1) return;
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: any) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptions(updated);
  };

  // Quick follow-up date chips (+7, +15, +30 days)
  const setQuickFollowUp = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setNextFollowUpDate(d.toISOString().split('T')[0]);
  };

  // Image Upload handler (Compressed to Data URL for LocalStorage)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newAttachment: AttachmentItem = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: attachmentType,
        dataUrl,
        date: todayStr,
        caption: attachmentCaption || `${attachmentType.replace('_', ' ')} - ${file.name}`,
      };
      setAttachments([...attachments, newAttachment]);
      setAttachmentCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaints.trim()) {
      setError('Chief Complaints are required');
      return;
    }

    // Filter valid prescriptions
    const validPrescriptions = prescriptions.filter((p) => p.remedyName.trim() !== '');
    if (validPrescriptions.length === 0) {
      setError('Please add at least one prescribed remedy with potency');
      return;
    }

    const visitId = initialVisit ? initialVisit.id : `VISIT-${Date.now()}`;
    const savedVisit: ClinicalVisit = {
      id: visitId,
      patientId: patient.id,
      date,
      chiefComplaints: chiefComplaints.trim(),
      modalities: modalities.trim() || undefined,
      generalsNotes: generalsNotes.trim() || undefined,
      homeopathicDiagnosis: homeopathicDiagnosis.trim() || undefined,
      doctorNotes: doctorNotes.trim() || undefined,
      prescriptions: validPrescriptions,
      attachments,
      nextFollowUpDate: nextFollowUpDate || undefined,
      billedAmount: createBillNow
        ? consultationFee + medicineCharges
        : initialVisit?.billedAmount || 0,
      billId: createBillNow
        ? (initialVisit?.billId || `INV-${Date.now().toString().slice(-6)}`)
        : initialVisit?.billId,
    };

    onSaveVisit(
      savedVisit,
      createBillNow,
      createBillNow
        ? {
            consultationFee: Number(consultationFee),
            medicineCharges: Number(medicineCharges),
            paymentMode,
          }
        : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="font-semibold text-base">
                {isEditMode ? 'Edit Clinical Consultation & Rx' : 'New Consultation & Prescription'}
              </h3>
              <p className="text-xs text-slate-300">
                {patient.fullName} ({patient.id}) · {patient.age}y / {patient.gender}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Consultation Date */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Consultation Date:</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-300 bg-white"
            />
          </div>

          {/* Section 1: Clinical Case Record */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              1. Case History & Symptoms (EMR)
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chief Complaints & Duration *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Bilateral knee stiffness for 6 months, worse in morning and damp rainy weather..."
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modalities (&lt; Aggravation / &gt; Amelioration)
                </label>
                <input
                  type="text"
                  placeholder="e.g. < Cold damp, < First motion, > Continuous walking"
                  value={modalities}
                  onChange={(e) => setModalities(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Physical & Mental Generals
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chilly patient, thirstless, craves warm drinks, hurried"
                  value={generalsNotes}
                  onChange={(e) => setGeneralsNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Constitutional Assessment / Miasmatic Diagnosis
              </label>
              <input
                type="text"
                placeholder="e.g. Sycotic dyscrasia - Rhus tox constitution"
                value={homeopathicDiagnosis}
                onChange={(e) => setHomeopathicDiagnosis(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Section 2: Homeopathic Prescription Details */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                2. Homeopathic Remedies Prescribed
              </h4>
              <button
                type="button"
                onClick={handleAddRemedy}
                className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Remedy
              </button>
            </div>

            {prescriptions.map((rx, idx) => (
              <div
                key={rx.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Remedy #{idx + 1}</span>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRemedy(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Remedy Name & Potency */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Remedy Name *
                    </label>
                    <input
                      type="text"
                      list={`remedies-list-${idx}`}
                      required
                      placeholder="e.g. Rhus Toxicodendron, Arnica"
                      value={rx.remedyName}
                      onChange={(e) => updatePrescription(idx, 'remedyName', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <datalist id={`remedies-list-${idx}`}>
                      {COMMON_REMEDIES.map((r) => (
                        <option key={r} value={r} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Potency *
                    </label>
                    <input
                      type="text"
                      list={`potency-list-${idx}`}
                      required
                      placeholder="200C"
                      value={rx.potency}
                      onChange={(e) => updatePrescription(idx, 'potency', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <datalist id={`potency-list-${idx}`}>
                      {COMMON_POTENCIES.map((pot) => (
                        <option key={pot} value={pot} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Potency quick chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Potency:</span>
                  {['30C', '200C', '1M', 'Q (Mother Tincture)', '6X', '0/1 LM'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updatePrescription(idx, 'potency', p)}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded border transition-colors ${
                        rx.potency === p
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Dosage Vehicle & Frequency & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Vehicle / Form
                    </label>
                    <select
                      value={rx.dosageVehicle}
                      onChange={(e) => updatePrescription(idx, 'dosageVehicle', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {COMMON_VEHICLES.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Dosage / Frequency *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BD, TDS, or Every 3 hrs in water"
                      value={rx.frequency}
                      onChange={(e) => updatePrescription(idx, 'frequency', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {['OD', 'BD', 'TDS', 'QID', 'SOS', 'Stat', 'Weekly', 'HS'].map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => updatePrescription(idx, 'frequency', freq)}
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded border transition-colors ${
                            rx.frequency === freq
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Duration (Days)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={rx.durationDays}
                        onChange={(e) =>
                          updatePrescription(idx, 'durationDays', parseInt(e.target.value, 10) || 1)
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Special taking instructions */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    value={rx.instructions}
                    onChange={(e) => updatePrescription(idx, 'instructions', e.target.value)}
                    placeholder="e.g. 4 pills on clean tongue, avoid raw onion/coffee"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {QUICK_INSTRUCTIONS.slice(0, 3).map((instr) => (
                      <button
                        key={instr}
                        type="button"
                        onClick={() => updatePrescription(idx, 'instructions', instr)}
                        className="text-[9px] text-teal-800 bg-teal-50 hover:bg-teal-100 px-1.5 py-0.5 rounded border border-teal-200"
                      >
                        + {instr.slice(0, 28)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: Media Attachments (Camera / Gallery Upload) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-teal-600" />
              3. Patient Media & Lab Attachments
            </h4>

            {/* Existing attachments list */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group"
                  >
                    <img
                      src={att.dataUrl}
                      alt={att.caption || 'Attachment'}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1.5 bg-white text-[10px]">
                      <p className="font-semibold truncate text-slate-800">{att.caption || att.name}</p>
                      <span className="text-slate-400 capitalize">{att.type.replace('_', ' ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Control */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <select
                    value={attachmentType}
                    onChange={(e) => setAttachmentType(e.target.value as any)}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="skin_photo">Skin / Lesion Photo (Before/After)</option>
                    <option value="lab_report">Lab Investigation Report</option>
                    <option value="xray">X-Ray / Scan Film</option>
                    <option value="prescription_scan">Prior Rx Document</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Caption / Notes (e.g. Day 1 eczema forearm lesion)"
                    value={attachmentCaption}
                    onChange={(e) => setAttachmentCaption(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Camera Trigger */}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors">
                  <Camera className="w-4 h-4 text-teal-700" />
                  <span>Take Photo with Camera</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {/* Gallery File Upload */}
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload File / Gallery</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Follow-Up Scheduling */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-200 pb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              4. Next Follow-Up Schedule
            </h4>

            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-teal-900">Schedule In:</span>
                {[
                  { label: '+7 Days', days: 7 },
                  { label: '+15 Days', days: 15 },
                  { label: '+21 Days', days: 21 },
                  { label: '+30 Days (1 Month)', days: 30 },
                ].map((btn) => (
                  <button
                    key={btn.days}
                    type="button"
                    onClick={() => setQuickFollowUp(btn.days)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white text-teal-800 rounded-lg border border-teal-200 hover:bg-teal-100 shadow-xs"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="text-xs font-medium text-slate-700">Scheduled Date:</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-900 rounded-lg border border-teal-300 bg-white"
                />
                {nextFollowUpDate && (
                  <button
                    type="button"
                    onClick={() => setNextFollowUpDate('')}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Auto-Billing / OPD Counter Integration */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                5. Billing & OPD Receipt
              </h4>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-teal-800">
                <input
                  type="checkbox"
                  checked={createBillNow}
                  onChange={(e) => setCreateBillNow(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Generate Bill for this Visit</span>
              </label>
            </div>

            {createBillNow && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Consultation Fee ({clinicConfig.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Medicine Charges ({clinicConfig.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={medicineCharges}
                      onChange={(e) => setMedicineCharges(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Payment Mode
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-2 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="UPI">UPI (GPay / PhonePe / QR)</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs font-semibold text-slate-800">
                  <span>Total Amount Payable:</span>
                  <span className="text-sm font-bold text-teal-700">
                    {clinicConfig.currencySymbol}
                    {(Number(consultationFee) + Number(medicineCharges)).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-lg transition-all shadow-sm shadow-teal-600/20"
          >
            {isEditMode ? 'Update Consultation & Rx' : 'Save Consultation & Prescribe'}
          </button>
        </div>
      </div>
    </div>
  );
};
