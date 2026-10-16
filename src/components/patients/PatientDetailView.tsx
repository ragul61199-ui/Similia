import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Plus,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  Image as ImageIcon,
  Receipt,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  CreditCard,
  Edit,
  Trash2,
  User,
  ShieldAlert,
} from 'lucide-react';
import { AttachmentItem, ClinicConfig, ClinicalVisit, Patient } from '../../types';
import { createPrescriptionWhatsAppUrl } from '../../services/whatsapp';

interface PatientDetailViewProps {
  patient: Patient;
  clinicConfig: ClinicConfig;
  onBack: () => void;
  onOpenAddVisit: () => void;
  onOpenCreateBill: (patient: Patient, visit?: ClinicalVisit) => void;
  onViewBillById?: (billId: string) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onOpenIdCard: (patient: Patient) => void;
  onEditVisit: (visit: ClinicalVisit) => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  clinicConfig,
  onBack,
  onOpenAddVisit,
  onOpenCreateBill,
  onViewBillById,
  onEditPatient,
  onDeletePatient,
  onOpenIdCard,
  onEditVisit,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<AttachmentItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cleanPhone = patient.phoneNumber.replace(/\D/g, '');
  const directWhatsAppUrl = `https://wa.me/${cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone}`;

  const handleDelete = () => {
    onDeletePatient(patient.id);
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation & Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Patients</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-md border border-teal-200 dark:border-teal-800">
              {patient.id}
            </span>
          </div>
        </div>

        {/* Patient Hero Info */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Patient Avatar Photograph */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
              {patient.photoUrl ? (
                <img
                  src={patient.photoUrl}
                  alt={patient.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl sm:text-2xl font-bold text-teal-700 dark:text-teal-300">
                  {patient.fullName.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {patient.fullName}
                </h2>
                {patient.bloodGroup && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
                    {patient.bloodGroup}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{patient.age} Years</span>
                <span aria-hidden="true">·</span>
                <span>{patient.gender}</span>
                {patient.occupation && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{patient.occupation}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>Reg: {new Date(patient.registrationDate).toLocaleDateString()}</span>
              </div>

              {patient.address && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{patient.address}</p>
              )}

              {patient.allergies && (
                <div className="mt-2 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 inline-block">
                  <span className="font-semibold">Allergies/Sensitivities:</span> {patient.allergies}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Bar - Dedicated full-width row below profile */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
            {/* Add Visit Primary CTA */}
            <button
              type="button"
              onClick={onOpenAddVisit}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-white active:scale-[0.98] transition-all shadow-sm min-h-[38px] shrink-0"
              style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Add Visit</span>
            </button>

            {/* Digital ID Card */}
            <button
              type="button"
              onClick={() => onOpenIdCard(patient)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors shadow-2xs min-h-[38px] shrink-0"
            >
              <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Digital ID</span>
            </button>

            {/* WhatsApp */}
            <a
              href={directWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs min-h-[38px] shrink-0"
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span>WhatsApp</span>
            </a>

            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => onEditPatient(patient)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[38px] shrink-0"
              title="Edit Profile"
            >
              <Edit className="w-4 h-4 shrink-0" />
              <span>Edit</span>
            </button>

            {/* Delete Patient Record */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0 ml-auto"
              title="Delete Patient Record"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Case Timeline Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Clinical Consultations & History ({patient.visits.length})
          </h3>
          <button
            type="button"
            onClick={onOpenAddVisit}
            className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Visit</span>
          </button>
        </div>

        {patient.visits.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Consultation Records Yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Record chief complaints, homeopathic constitutional assessment, potencies, vehicles, and photos.
            </p>
            <button
              type="button"
              onClick={onOpenAddVisit}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700"
            >
              Record First Consultation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {patient.visits.map((visit, vIdx) => {
              const whatsappRxUrl = createPrescriptionWhatsAppUrl(patient, visit, clinicConfig);

              return (
                <div
                  key={visit.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors"
                >
                  {/* Visit Top Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                        #{patient.visits.length - vIdx}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          Consultation on{' '}
                          {new Date(visit.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        {visit.homeopathicDiagnosis && (
                          <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium truncate">
                            {visit.homeopathicDiagnosis}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                      {/* Edit Consultation Button */}
                      <button
                        type="button"
                        onClick={() => onEditVisit(visit)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                        title="Edit consultation history"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit Rx</span>
                      </button>

                      {/* WhatsApp Prescription Button */}
                      <a
                        href={whatsappRxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Share Rx</span>
                      </a>

                      {/* Billing Action */}
                      {visit.billId ? (
                        <button
                          type="button"
                          onClick={() => onViewBillById?.(visit.billId!)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 rounded-lg border border-teal-200 dark:border-teal-800"
                        >
                          <Receipt className="w-3.5 h-3.5 text-teal-600" />
                          <span>Bill ({clinicConfig.currencySymbol}{visit.billedAmount})</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onOpenCreateBill(patient, visit)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 rounded-lg"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Bill Visit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Complaints & Modalities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Chief Complaints:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200">{visit.chiefComplaints}</p>
                    </div>

                    {visit.modalities && (
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Modalities (&lt; Agg / &gt; Amel):
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">{visit.modalities}</p>
                      </div>
                    )}

                    {visit.generalsNotes && (
                      <div className="col-span-full">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Generals & Thermal State:
                        </span>
                        <p className="text-slate-800 dark:text-slate-200">{visit.generalsNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Homeopathic Prescriptions List */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Prescribed Remedies
                    </h5>
                    <div className="space-y-2">
                      {visit.prescriptions.map((rx, idx) => (
                        <div
                          key={rx.id || idx}
                          className="p-2.5 rounded-lg border border-teal-100 dark:border-teal-900/40 bg-teal-50/30 dark:bg-teal-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-teal-950 dark:text-teal-200 text-sm">
                                {rx.remedyName}
                              </span>
                              <span className="font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-1.5 py-0.5 rounded text-[11px]">
                                {rx.potency}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                              {rx.dosageVehicle} · {rx.frequency} for {rx.durationDays} Days
                            </p>
                          </div>

                          {rx.instructions && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 italic sm:text-right">
                              "{rx.instructions}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attachments Section */}
                  {visit.attachments && visit.attachments.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-teal-600" />
                        Media Attachments ({visit.attachments.length})
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {visit.attachments.map((att) => (
                          <div
                            key={att.id}
                            onClick={() => setSelectedPhoto(att)}
                            className="group relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-teal-500 transition-all shadow-2xs"
                          >
                            <img
                              src={att.dataUrl}
                              alt={att.caption || att.name}
                              className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-1.5 bg-white dark:bg-slate-800 text-[10px]">
                              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {att.caption || att.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Note */}
                  {visit.nextFollowUpDate && (
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold">Scheduled Next Follow-Up:</span>
                        <span>
                          {new Date(visit.nextFollowUpDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Patient Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Permanently Delete Patient?
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900 dark:text-slate-100">{patient.fullName}</strong> ({patient.id})?
              This will remove all consultation histories, prescriptions, attached lab reports, invoices, and scheduled follow-ups.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                Yes, Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3 flex items-center justify-between text-white border-b border-slate-800">
              <span className="text-xs font-semibold truncate">{selectedPhoto.caption || selectedPhoto.name}</span>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.caption || 'Case Attachment'}
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
            <div className="p-3 text-xs text-slate-300 bg-slate-900 flex items-center justify-between">
              <span>Date: {selectedPhoto.date}</span>
              <span className="capitalize">{selectedPhoto.type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
