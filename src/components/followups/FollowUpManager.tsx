import React, { useState } from 'react';
import {
  CalendarClock,
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  ChevronRight,
  RotateCcw,
  Check,
  CalendarDays,
  X,
} from 'lucide-react';
import { ClinicConfig, FollowUpItem, Patient } from '../../types';
import { createFollowUpReminderUrl } from '../../services/whatsapp';

interface FollowUpManagerProps {
  followUps: FollowUpItem[];
  clinicConfig: ClinicConfig;
  patients: Patient[];
  onSelectPatientById: (patientId: string) => void;
  onRescheduleFollowUp?: (patientId: string, visitId: string, newDate: string) => void;
  onCompleteFollowUp?: (patientId: string, visitId: string) => void;
}

export const FollowUpManager: React.FC<FollowUpManagerProps> = ({
  followUps,
  clinicConfig,
  patients,
  onSelectPatientById,
  onRescheduleFollowUp,
  onCompleteFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming_all' | 'today' | 'missed' | 'completed'>('upcoming_all');
  const [reschedulingItem, setReschedulingItem] = useState<FollowUpItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const todayFollowUps = followUps.filter((f) => f.status === 'today');
  const upcomingFollowUps = followUps.filter((f) => f.status === 'upcoming');
  const missedFollowUps = followUps.filter((f) => f.status === 'missed');

  // Filter based on active tab
  const getFilteredList = () => {
    switch (activeTab) {
      case 'today':
        return todayFollowUps;
      case 'missed':
        return missedFollowUps;
      case 'upcoming_all':
        // All upcoming starting today onwards, sorted chronologically
        return [...todayFollowUps, ...upcomingFollowUps].sort((a, b) =>
          a.scheduledDate.localeCompare(b.scheduledDate)
        );
      case 'completed':
        return followUps.filter((f) => f.status === 'completed');
      default:
        return followUps;
    }
  };

  const listToRender = getFilteredList();

  // Group items by date string
  const groupedByDate: Record<string, FollowUpItem[]> = {};
  listToRender.forEach((item) => {
    if (!groupedByDate[item.scheduledDate]) {
      groupedByDate[item.scheduledDate] = [];
    }
    groupedByDate[item.scheduledDate].push(item);
  });

  // Sorted date keys
  const sortedDates = Object.keys(groupedByDate).sort();

  const getDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (dateStr === todayStr) {
      return `Today — ${dateFormatted}`;
    }
    if (dateStr === tomorrowStr) {
      return `Tomorrow — ${dateFormatted}`;
    }
    if (dateStr < todayStr) {
      return `Overdue / Missed — ${dateFormatted}`;
    }
    const weekday = d.toLocaleDateString('en-IN', { weekday: 'long' });
    return `${weekday} — ${dateFormatted}`;
  };

  const handleOpenReschedule = (item: FollowUpItem) => {
    setReschedulingItem(item);
    setRescheduleDate(item.scheduledDate);
  };

  const handleSaveReschedule = () => {
    if (!reschedulingItem || !rescheduleDate) return;
    onRescheduleFollowUp?.(reschedulingItem.patientId, reschedulingItem.visitId, rescheduleDate);
    setReschedulingItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Follow-Up & WhatsApp Reminders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological date-wise OPD appointment tracker with 1-tap patient WhatsApp notifications
          </p>
        </div>

        {/* Tab Segment Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming_all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap min-h-[36px] ${
              activeTab === 'upcoming_all'
                ? 'text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
            style={{ backgroundColor: activeTab === 'upcoming_all' ? 'var(--primary-color, #0d9488)' : undefined }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>All Upcoming (Date-Wise)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-black/20 text-white">
              {todayFollowUps.length + upcomingFollowUps.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap min-h-[36px] ${
              activeTab === 'today'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Follow-ups</span>
            {todayFollowUps.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-800 text-white">
                {todayFollowUps.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('missed')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap min-h-[36px] ${
              activeTab === 'missed'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Overdue / Missed</span>
            {missedFollowUps.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-800 text-white">
                {missedFollowUps.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Date-wise Grouped Follow-up List */}
      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <CalendarClock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Scheduled Follow-ups Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'today'
              ? 'No patients scheduled for follow-up today.'
              : activeTab === 'missed'
              ? 'No overdue appointments. Excellent follow-up compliance!'
              : 'When prescribing remedies, select a next date to auto-schedule follow-ups.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((dateKey) => {
            const itemsOnDate = groupedByDate[dateKey];
            const isToday = dateKey === todayStr;
            const isPast = dateKey < todayStr;

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Header (in-flow, non-sticky to avoid overlapping while scrolling) */}
                <div className="py-2 px-3 rounded-xl flex items-center justify-between border shadow-2xs bg-slate-100/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className={`w-4 h-4 shrink-0 ${isToday ? 'text-amber-500' : isPast ? 'text-rose-500' : 'text-teal-600'}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {getDateLabel(dateKey)}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 shrink-0 ml-2">
                    {itemsOnDate.length} {itemsOnDate.length === 1 ? 'Patient' : 'Patients'}
                  </span>
                </div>

                {/* Follow-up Cards */}
                <div className="space-y-2.5">
                  {itemsOnDate.map((item) => {
                    const patient = patients.find((p) => p.id === item.patientId);
                    const whatsappReminderUrl = createFollowUpReminderUrl({
                      patientName: item.patientName,
                      patientPhone: item.patientPhone,
                      clinicName: clinicConfig.clinicName,
                      scheduledDate: item.scheduledDate,
                      doctorName: clinicConfig.doctorName,
                    });

                    return (
                      <div
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border transition-all space-y-3 ${
                          isToday
                            ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                            : isPast
                            ? 'border-rose-300 dark:border-rose-700/60 bg-rose-50/20 dark:bg-rose-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 shadow-2xs'
                        }`}
                      >
                        {/* Top Row: Patient Avatar, Name, ID & Status Badge */}
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {/* Avatar */}
                            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900 overflow-hidden shadow-2xs">
                              {patient?.photoUrl ? (
                                <img
                                  src={patient.photoUrl}
                                  alt={item.patientName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{item.patientName.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                                  {item.patientName}
                                </h3>
                                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shrink-0">
                                  {item.patientId}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                Phone: <span className="font-mono font-medium">{item.patientPhone}</span>
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="shrink-0 flex items-center gap-1">
                            {isToday ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                TODAY
                              </span>
                            ) : isPast ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                                OVERDUE
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                                SCHEDULED
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle Section: Remedy & Chief Complaint Box */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                              Prescribed Rx:
                            </span>
                            <span className="font-bold text-teal-800 dark:text-teal-300 truncate">
                              {item.lastRemedy || 'None recorded'}
                            </span>
                          </div>

                          {item.chiefComplaint && (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                                Complaint:
                              </span>
                              <span className="text-slate-700 dark:text-slate-300 line-clamp-2">
                                {item.chiefComplaint}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action Bar: Full width dedicated row */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {/* 1-Tap WhatsApp Reminder */}
                          <a
                            href={whatsappReminderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-xs min-h-[38px]"
                            title="Send WhatsApp Follow-up Reminder"
                          >
                            <MessageSquare className="w-4 h-4 shrink-0" />
                            <span className="truncate">WhatsApp Reminder</span>
                          </a>

                          {/* Reschedule */}
                          <button
                            type="button"
                            onClick={() => handleOpenReschedule(item)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 shadow-2xs"
                            title="Reschedule Appointment"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>

                          {/* Complete Follow-up */}
                          <button
                            type="button"
                            onClick={() => onCompleteFollowUp?.(item.patientId, item.visitId)}
                            className="p-2 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 bg-teal-50 dark:bg-teal-950/60 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800 shadow-2xs"
                            title="Mark Completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>

                          {/* View Case */}
                          <button
                            type="button"
                            onClick={() => onSelectPatientById(item.patientId)}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0 shadow-2xs"
                            title="View Patient Record"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Reschedule Follow-Up</h3>
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select a new follow-up date for <strong className="text-slate-900 dark:text-slate-100">{reschedulingItem.patientName}</strong>:
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Follow-Up Date *
              </label>
              <input
                type="date"
                required
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
              />
            </div>

            {/* Quick date chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: '+7 Days', days: 7 },
                { label: '+15 Days', days: 15 },
                { label: '+30 Days', days: 30 },
              ].map((chip) => (
                <button
                  key={chip.days}
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + chip.days);
                    setRescheduleDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setReschedulingItem(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReschedule}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
