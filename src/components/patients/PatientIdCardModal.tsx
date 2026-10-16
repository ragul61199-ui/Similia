import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  MessageSquare,
  ShieldCheck,
  User,
  Calendar,
  Phone,
  Droplet,
  Loader2,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { ClinicConfig, Patient } from '../../types';
import { formatPhoneNumberForWhatsApp } from '../../services/whatsapp';
import { downloadElementAsJpeg, shareOrDownloadJpeg } from '../../services/imageGenerator';

interface PatientIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  clinicConfig: ClinicConfig;
}

export const PatientIdCardModal: React.FC<PatientIdCardModalProps> = ({
  isOpen,
  onClose,
  patient,
  clinicConfig,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const cleanPhone = formatPhoneNumberForWhatsApp(patient.phoneNumber);
  const regDateFormatted = new Date(patient.registrationDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const filename = `PatientID_${patient.id}_${patient.fullName.replace(/\s+/g, '_')}.jpg`;

  const handleDownloadJpeg = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);
    try {
      await downloadElementAsJpeg(cardRef.current, filename, { scale: 2 });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating ID card image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareOnWhatsApp = async () => {
    if (!cardRef.current) return;
    setIsProcessing(true);

    const message = `🪪 *DIGITAL PATIENT ID CARD*
*${clinicConfig.clinicName}*
Physician: ${clinicConfig.doctorName} (${clinicConfig.qualifications})
──────────────────────
Dear *${patient.fullName}*,
Your official Homeopathic Patient ID Card image is attached:

• *Patient ID:* *${patient.id}*
• *Age / Gender:* ${patient.age} Y / ${patient.gender}
• *Blood Group:* ${patient.bloodGroup || 'Not Specified'}
• *Registration Date:* ${regDateFormatted}
• *Contact:* ${patient.phoneNumber}

Please quote your *Patient ID (${patient.id})* on every clinic visit and consultation.

Warm regards,
*${clinicConfig.doctorName}*
${clinicConfig.phone} | ${clinicConfig.address}`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    try {
      await shareOrDownloadJpeg(cardRef.current, filename, {
        title: `Patient ID Card - ${patient.fullName}`,
        text: message,
        waUrlFallback: waUrl,
      });
    } catch (err) {
      console.error('Error sharing ID card:', err);
      window.open(waUrl, '_blank');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-base">Digital Patient ID Card (JPEG)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadJpeg}
            disabled={isProcessing}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs disabled:opacity-60 min-h-[40px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Image...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>JPEG Saved!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Download Card (JPEG)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            disabled={isProcessing}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs disabled:opacity-60 min-h-[40px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share JPEG on WhatsApp</span>
          </button>
        </div>

        {/* Card Display Area */}
        <div className="p-4 sm:p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950 overflow-y-auto flex-1">
          {/* Credit Card styled ISO format container - NO QR Code */}
          <div
            ref={cardRef}
            className="w-full max-w-[430px] rounded-2xl shadow-xl border border-slate-200 bg-white text-slate-900 p-4 sm:p-5 relative"
            style={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
              borderColor: '#e2e8f0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
              overflow: 'visible',
            }}
          >
            {/* Top Card Band: Clinic Logo & Name & ID */}
            <div
              className="flex items-center justify-between gap-2 pb-3"
              style={{ borderBottom: '1px solid #ccfbf1', overflow: 'visible' }}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {clinicConfig.clinicLogo ? (
                  <img
                    src={clinicConfig.clinicLogo}
                    alt="Logo"
                    className="w-10 h-10 object-contain rounded-full shadow-2xs p-0.5 shrink-0"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #99f6e4', display: 'inline-block' }}
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full font-bold flex items-center justify-center shrink-0 text-sm shadow-xs"
                    style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
                  >
                    S
                  </div>
                )}
                <div className="min-w-0">
                  <h4
                    className="text-xs sm:text-sm font-bold tracking-tight"
                    style={{ color: '#042f2e', lineHeight: '1.4', overflow: 'visible' }}
                  >
                    {clinicConfig.clinicName}
                  </h4>
                  <p
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: '#115e59', lineHeight: '1.4', overflow: 'visible' }}
                  >
                    {clinicConfig.doctorName} · {clinicConfig.qualifications}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md inline-block"
                  style={{ backgroundColor: '#ccfbf1', color: '#115e59', lineHeight: '1.4' }}
                >
                  PATIENT ID
                </span>
                <p
                  className="font-mono text-xs sm:text-sm font-black mt-0.5 tracking-tight"
                  style={{ color: '#0f172a', lineHeight: '1.4' }}
                >
                  {patient.id}
                </p>
              </div>
            </div>

            {/* Middle Section: Photo & Demographics */}
            <div className="flex items-start gap-3.5 py-3.5" style={{ overflow: 'visible' }}>
              {/* Patient Photo */}
              <div
                className="w-20 h-24 sm:w-22 sm:h-26 rounded-xl overflow-hidden shrink-0 shadow-2xs flex items-center justify-center"
                style={{
                  backgroundColor: '#f1f5f9',
                  border: '2px solid rgba(13, 148, 136, 0.3)',
                }}
              >
                {patient.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient.fullName}
                    className="w-full h-full object-cover"
                    style={{ display: 'inline-block' }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#ccfbf1', color: '#115e59' }}
                  >
                    <User className="w-8 h-8 mb-0.5" style={{ color: '#0d9488' }} />
                    <span className="text-[8px] font-bold">PATIENT</span>
                  </div>
                )}
              </div>

              {/* Patient Details */}
              <div className="flex-1 min-w-0 space-y-1.5" style={{ overflow: 'visible' }}>
                <div>
                  <h3
                    className="text-sm sm:text-base font-bold"
                    style={{ color: '#0f172a', lineHeight: '1.4', overflow: 'visible' }}
                  >
                    {patient.fullName}
                  </h3>
                  <div
                    className="flex items-center gap-2 text-[10px] font-medium"
                    style={{ color: '#64748b', lineHeight: '1.4' }}
                  >
                    <span>Reg Date: {regDateFormatted}</span>
                  </div>
                </div>

                <div
                  className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] p-2 rounded-lg"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#334155',
                    lineHeight: '1.4',
                    overflow: 'visible',
                  }}
                >
                  <div>
                    <span
                      className="block text-[8px] uppercase tracking-wider font-semibold"
                      style={{ color: '#94a3b8', lineHeight: '1.3' }}
                    >
                      AGE / GENDER
                    </span>
                    <span className="font-bold block" style={{ color: '#1e293b', lineHeight: '1.4' }}>
                      {patient.age} Y · {patient.gender}
                    </span>
                  </div>

                  <div>
                    <span
                      className="block text-[8px] uppercase tracking-wider font-semibold"
                      style={{ color: '#94a3b8', lineHeight: '1.3' }}
                    >
                      BLOOD GROUP
                    </span>
                    <span className="font-bold block" style={{ color: '#be123c', lineHeight: '1.4' }}>
                      {patient.bloodGroup || 'Not Specified'}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span
                      className="block text-[8px] uppercase tracking-wider font-semibold"
                      style={{ color: '#94a3b8', lineHeight: '1.3' }}
                    >
                      PHONE NUMBER
                    </span>
                    <span
                      className="font-semibold font-mono block"
                      style={{ color: '#1e293b', lineHeight: '1.4' }}
                    >
                      {patient.phoneNumber}
                    </span>
                  </div>

                  {patient.address && (
                    <div className="col-span-2 border-t border-slate-100 pt-1 mt-0.5">
                      <span
                        className="block text-[8px] uppercase tracking-wider font-semibold"
                        style={{ color: '#94a3b8', lineHeight: '1.3' }}
                      >
                        ADDRESS
                      </span>
                      <span className="text-[9px] block text-slate-600" style={{ lineHeight: '1.35' }}>
                        {patient.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card Footer: Signature & Clinic Contact */}
            <div
              className="mt-3 pt-2.5 flex items-center justify-between text-[9px] gap-2"
              style={{ borderTop: '1px solid #e2e8f0', color: '#64748b', overflow: 'visible' }}
            >
              <div className="flex-1 min-w-0" style={{ overflow: 'visible' }}>
                <span className="font-medium block" style={{ color: '#475569', lineHeight: '1.4' }}>
                  {clinicConfig.address}
                </span>
                <span className="block text-[8px]" style={{ color: '#94a3b8', lineHeight: '1.4' }}>
                  Tel: {clinicConfig.phone}
                </span>
              </div>

              <div className="text-right shrink-0">
                {clinicConfig.physicianSignature ? (
                  <img
                    src={clinicConfig.physicianSignature}
                    alt="Signature"
                    className="h-6 object-contain ml-auto"
                    style={{ display: 'inline-block' }}
                  />
                ) : (
                  <span
                    className="italic font-serif text-[11px] font-semibold block"
                    style={{ color: '#0f766e', lineHeight: '1.4' }}
                  >
                    {clinicConfig.doctorName}
                  </span>
                )}
                <span className="text-[8px] block" style={{ color: '#94a3b8', lineHeight: '1.4' }}>
                  Physician Signature
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
