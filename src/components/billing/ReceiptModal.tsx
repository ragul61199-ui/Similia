import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  MessageSquare,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Bill, ClinicConfig } from '../../types';
import { createReceiptWhatsAppUrl } from '../../services/whatsapp';
import { downloadElementAsJpeg, shareOrDownloadJpeg } from '../../services/imageGenerator';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  clinicConfig: ClinicConfig;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  bill,
  clinicConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !bill) return null;

  const whatsappUrl = createReceiptWhatsAppUrl(bill, clinicConfig);
  const filename = `PaymentReceipt_${bill.billNumber}_${bill.patientName.replace(/\s+/g, '_')}.jpg`;

  const handleDownloadJpeg = async () => {
    if (!receiptRef.current) return;
    setIsProcessing(true);
    try {
      await downloadElementAsJpeg(receiptRef.current, filename, { scale: 2 });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating receipt image:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShareOnWhatsApp = async () => {
    if (!receiptRef.current) return;
    setIsProcessing(true);

    const message = `🧾 *OFFICIAL PAYMENT RECEIPT*
*${clinicConfig.clinicName}*
Doctor: ${clinicConfig.doctorName} (${clinicConfig.qualifications})
──────────────────────
• *Receipt No:* ${bill.billNumber}
• *Date:* ${new Date(bill.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
• *Patient Name:* ${bill.patientName} (${bill.patientId})
• *Consultation Fee:* ${clinicConfig.currencySymbol}${bill.consultationFee}
• *Medicine Charges:* ${clinicConfig.currencySymbol}${bill.medicineCharges}
${bill.courierOrOtherCharges ? `• *Other Charges:* ${clinicConfig.currencySymbol}${bill.courierOrOtherCharges}\n` : ''}${bill.discount ? `• *Discount Applied:* -${clinicConfig.currencySymbol}${bill.discount}\n` : ''}• *Total Paid:* *${clinicConfig.currencySymbol}${bill.totalAmount}* (${bill.paymentMode})
──────────────────────
Thank you for consulting with us!
*${clinicConfig.clinicName}*
${clinicConfig.phone} | ${clinicConfig.address}`;

    const waUrl = `https://wa.me/${bill.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    try {
      await shareOrDownloadJpeg(receiptRef.current, filename, {
        title: `Payment Receipt - ${bill.billNumber}`,
        text: message,
        waUrlFallback: waUrl,
      });
    } catch (err) {
      console.error('Error sharing receipt:', err);
      window.open(waUrl, '_blank');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = () => {
    const textReceipt = `RECEIPT - ${clinicConfig.clinicName}
Receipt No: ${bill.billNumber}
Date: ${new Date(bill.date).toLocaleDateString()}
Patient: ${bill.patientName} (${bill.patientId})
Consultation Fee: ${clinicConfig.currencySymbol}${bill.consultationFee}
Medicine Charges: ${clinicConfig.currencySymbol}${bill.medicineCharges}
Total Paid: ${clinicConfig.currencySymbol}${bill.totalAmount} (${bill.paymentMode})
Doctor: ${clinicConfig.doctorName} (${clinicConfig.qualifications})`;

    navigator.clipboard.writeText(textReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="no-print px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-base">Payment Receipt & Invoice (JPEG)</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button Bar */}
        <div className="no-print p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* JPEG Download Button */}
          <button
            type="button"
            onClick={handleDownloadJpeg}
            disabled={isProcessing}
            className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors shadow-xs disabled:opacity-60 min-h-[40px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>JPEG Saved!</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                <span>Download Bill (JPEG)</span>
              </>
            )}
          </button>

          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleShareOnWhatsApp}
            disabled={isProcessing}
            className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-60 min-h-[40px]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share JPEG on WhatsApp</span>
          </button>

          {/* Copy Text */}
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors min-h-[40px]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Printable & Image-Capture Receipt Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white text-slate-900 print-card">
          <div
            ref={receiptRef}
            className="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white relative text-slate-900 shadow-2xs"
            style={{ minHeight: '480px' }}
          >
            {/* Clinic Logo & Header Lockup */}
            <div className="text-center border-b border-slate-200 pb-4">
              {clinicConfig.clinicLogo && (
                <div className="flex justify-center mb-2">
                  <img
                    src={clinicConfig.clinicLogo}
                    alt={clinicConfig.clinicName}
                    className="h-14 w-14 object-contain rounded-full shadow-2xs border border-slate-100 p-0.5"
                  />
                </div>
              )}

              <h2 className="text-xl font-bold text-teal-900 tracking-tight leading-tight">
                {clinicConfig.clinicName}
              </h2>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                {clinicConfig.doctorName} · {clinicConfig.qualifications}
              </p>
              {clinicConfig.registrationNumber && (
                <p className="text-[10px] text-slate-500 font-mono">
                  Reg No: {clinicConfig.registrationNumber}
                </p>
              )}
              <p className="text-[11px] text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                {clinicConfig.address} · Phone: {clinicConfig.phone}
              </p>
            </div>

            {/* Receipt Meta Bar */}
            <div className="py-3 border-b border-slate-200 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">RECEIPT NO</span>
                <span className="font-mono font-bold text-slate-900">{bill.billNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">DATE</span>
                <span className="font-semibold text-slate-900">
                  {new Date(bill.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Patient Details */}
            <div className="py-3 border-b border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase mb-1">
                BILLED TO PATIENT
              </span>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{bill.patientName}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {bill.patientId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-600 block">{bill.patientPhone}</span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                    Mode: {bill.paymentMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Itemized Line Items */}
            <div className="py-4 border-b border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[10px] uppercase">
                    <th className="text-left pb-2">Description</th>
                    <th className="text-right pb-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 text-slate-800">
                      Homeopathic Consultation & Clinical Evaluation
                    </td>
                    <td className="py-2 text-right font-medium text-slate-900">
                      {clinicConfig.currencySymbol}
                      {bill.consultationFee.toFixed(2)}
                    </td>
                  </tr>

                  {bill.medicineCharges > 0 && (
                    <tr>
                      <td className="py-2 text-slate-800">
                        Homeopathic Remedies & Dispensed Formulations
                      </td>
                      <td className="py-2 text-right font-medium text-slate-900">
                        {clinicConfig.currencySymbol}
                        {bill.medicineCharges.toFixed(2)}
                      </td>
                    </tr>
                  )}

                  {bill.courierOrOtherCharges ? (
                    <tr>
                      <td className="py-2 text-slate-800">Courier / Ancillary Charges</td>
                      <td className="py-2 text-right font-medium text-slate-900">
                        {clinicConfig.currencySymbol}
                        {bill.courierOrOtherCharges.toFixed(2)}
                      </td>
                    </tr>
                  ) : null}

                  {bill.discount ? (
                    <tr>
                      <td className="py-2 text-emerald-700">Concession / Discount</td>
                      <td className="py-2 text-right font-medium text-emerald-700">
                        -{clinicConfig.currencySymbol}
                        {bill.discount.toFixed(2)}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Total Section */}
            <div className="py-3 flex justify-between items-center">
              <span className="font-bold text-sm text-slate-800">Total Paid:</span>
              <span className="text-xl font-black text-teal-800">
                {clinicConfig.currencySymbol}
                {bill.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Footer with Physician Signature */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-500">
              <div>
                <p className="italic">Similia Similibus Curentur</p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Computer generated payment receipt & invoice
                </p>
              </div>

              <div className="text-right">
                {clinicConfig.physicianSignature ? (
                  <img
                    src={clinicConfig.physicianSignature}
                    alt="Signature"
                    className="h-8 object-contain ml-auto mb-0.5"
                  />
                ) : (
                  <p className="italic font-serif text-slate-700 text-xs">
                    {clinicConfig.doctorName}
                  </p>
                )}
                <span className="block text-[9px] text-slate-400 border-t border-slate-300 pt-0.5">
                  Authorized Signature
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
