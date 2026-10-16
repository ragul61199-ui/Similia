import React, { useState } from 'react';
import {
  Search,
  Plus,
  Receipt,
  MessageSquare,
  TrendingUp,
  CreditCard,
  Calendar,
  Eye,
  IndianRupee,
  X,
} from 'lucide-react';
import { Bill, ClinicConfig, Patient } from '../../types';
import { createReceiptWhatsAppUrl } from '../../services/whatsapp';
import { CreateBillModal } from './CreateBillModal';
import { ReceiptModal } from './ReceiptModal';

interface BillingManagerProps {
  bills: Bill[];
  patients: Patient[];
  clinicConfig: ClinicConfig;
  onSaveBill: (bill: Bill) => void;
  activeBillIdToOpen?: string | null;
  onClearActiveBillId?: () => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({
  bills,
  patients,
  clinicConfig,
  onSaveBill,
  activeBillIdToOpen,
  onClearActiveBillId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Bill | null>(null);

  // Auto-open receipt if triggered externally (e.g. from patient view)
  React.useEffect(() => {
    if (activeBillIdToOpen) {
      const match = bills.find((b) => b.id === activeBillIdToOpen || b.billNumber === activeBillIdToOpen);
      if (match) {
        setSelectedReceipt(match);
      }
      onClearActiveBillId?.();
    }
  }, [activeBillIdToOpen, bills, onClearActiveBillId]);

  const todayStr = new Date().toISOString().split('T')[0];

  // Revenue metrics calculations
  const todayRevenue = bills
    .filter((b) => b.date === todayStr)
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalRevenue = bills.reduce((acc, curr) => acc + curr.totalAmount, 0);

  const upiTotal = bills
    .filter((b) => b.paymentMode === 'UPI')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const cashTotal = bills
    .filter((b) => b.paymentMode === 'Cash')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Filtered bills
  const filteredBills = bills.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.patientName.toLowerCase().includes(q) ||
      b.billNumber.toLowerCase().includes(q) ||
      b.patientPhone.includes(q) ||
      b.patientId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Revenue KPI Cards: 2x2 grid on mobile/tablet, 4 columns on wide screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors min-w-0 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            Today's OPD
          </span>
          <div className="text-lg sm:text-xl font-black text-teal-800 dark:text-teal-400 mt-1 truncate">
            {clinicConfig.currencySymbol}
            {todayRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
            {bills.filter((b) => b.date === todayStr).length} Bills Settled
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors min-w-0 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            Total Revenue
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-1 truncate">
            {clinicConfig.currencySymbol}
            {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
            {bills.length} Invoices
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors min-w-0 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            UPI / Online
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1 truncate">
            {clinicConfig.currencySymbol}
            {upiTotal.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
            GPay · PhonePe · QR
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors min-w-0 flex flex-col justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            Cash at Counter
          </span>
          <div className="text-lg sm:text-xl font-black text-amber-700 dark:text-amber-400 mt-1 truncate">
            {clinicConfig.currencySymbol}
            {cashTotal.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 block truncate">
            Cash in register
          </span>
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">Billing & Receipts</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              History of patient OPD bills & payment vouchers
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white active:scale-[0.98] rounded-xl transition-all shadow-sm min-h-[40px] shrink-0 whitespace-nowrap"
            style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
          >
            <Plus className="w-4 h-4" />
            <span>New Bill</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search patient, phone, or receipt #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Invoices List */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Bills Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchQuery ? `No results for "${searchQuery}".` : 'Create your first billing invoice.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredBills.map((bill) => {
            const whatsappUrl = createReceiptWhatsAppUrl(bill, clinicConfig);

            return (
              <div
                key={bill.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-700 transition-all space-y-2.5 shadow-2xs"
              >
                {/* Header: Bill #, Name & Payment Mode */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 shrink-0">
                      {bill.billNumber}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {bill.patientName}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      bill.paymentMode === 'UPI'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : bill.paymentMode === 'Cash'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                    }`}
                  >
                    {bill.paymentMode}
                  </span>
                </div>

                {/* Subtitle details */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {new Date(bill.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span>ID: {bill.patientId}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span>Consult: {clinicConfig.currencySymbol}{bill.consultationFee}</span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                  <span>Meds: {clinicConfig.currencySymbol}{bill.medicineCharges}</span>
                </div>

                {/* Amount & Actions row */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase leading-none">TOTAL</span>
                    <span className="text-base sm:text-lg font-black text-teal-800 dark:text-teal-400 truncate block">
                      {clinicConfig.currencySymbol}
                      {bill.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors min-h-[36px]"
                      title="Send Receipt via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(bill)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors min-h-[36px]"
                      title="View & Print Receipt"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Bill Modal */}
      <CreateBillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        patients={patients}
        clinicConfig={clinicConfig}
        onSaveBill={onSaveBill}
        existingBillsCount={bills.length}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        bill={selectedReceipt}
        clinicConfig={clinicConfig}
      />
    </div>
  );
};
