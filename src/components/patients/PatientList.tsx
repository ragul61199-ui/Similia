import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Phone,
  MessageSquare,
  ChevronRight,
  User,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Patient } from '../../types';

export type PatientSortOption =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'age_asc'
  | 'age_desc'
  | 'recent_visit';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatient: () => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  onSelectPatient,
  onOpenNewPatient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [sortBy, setSortBy] = useState<PatientSortOption>('newest');

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.fullName.toLowerCase().includes(query) ||
      p.phoneNumber.includes(query) ||
      p.id.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query);

    const matchesGender = selectedGender === 'All' || p.gender === selectedGender;

    return matchesSearch && matchesGender;
  });

  // Sort patients
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case 'oldest':
        return new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
      case 'name_asc':
        return a.fullName.localeCompare(b.fullName);
      case 'name_desc':
        return b.fullName.localeCompare(a.fullName);
      case 'age_asc':
        return a.age - b.age;
      case 'age_desc':
        return b.age - a.age;
      case 'recent_visit': {
        const lastA = a.visits.length > 0 ? new Date(a.visits[a.visits.length - 1].date).getTime() : 0;
        const lastB = b.visits.length > 0 ? new Date(b.visits[b.visits.length - 1].date).getTime() : 0;
        return lastB - lastA;
      }
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Search, Filter & Sort Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              Patient Records (EMR)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total {patients.length} registered patients
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenNewPatient}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white active:scale-[0.98] rounded-xl transition-all shadow-sm shrink-0 min-h-[38px]"
            style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or ID (e.g. HOM-2026-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters and Sorting Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          {/* Gender Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', 'Female', 'Male', 'Child'].map((gender) => {
              const isSelected = selectedGender === gender;
              return (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setSelectedGender(gender)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[34px] ${
                    isSelected
                      ? 'text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  style={{ backgroundColor: isSelected ? 'var(--primary-color, #0d9488)' : undefined }}
                >
                  {gender}
                </button>
              );
            })}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as PatientSortOption)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer min-h-[34px]"
            >
              <option value="newest">Recently Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="age_asc">Age: Youngest First</option>
              <option value="age_desc">Age: Oldest First</option>
              <option value="recent_visit">Recent Consultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Cards List */}
      {sortedPatients.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <User className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Patients Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchQuery
              ? `No records matching "${searchQuery}". Try a different name or phone.`
              : 'Start by registering your first homeopathic patient.'}
          </p>
          <button
            type="button"
            onClick={onOpenNewPatient}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700"
          >
            Register Patient Now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedPatients.map((patient) => {
            const cleanPhone = patient.phoneNumber.replace(/\D/g, '');
            const directWhatsAppUrl = `https://wa.me/${
              cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone
            }`;
            const lastVisit = patient.visits[patient.visits.length - 1];

            return (
              <div
                key={patient.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between gap-2.5 sm:gap-3"
                onClick={() => onSelectPatient(patient)}
              >
                {/* Left: Avatar & Info - Anti-overlapping styling */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40 overflow-hidden shadow-2xs">
                    {patient.photoUrl ? (
                      <img
                        src={patient.photoUrl}
                        alt={patient.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{patient.fullName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate max-w-[170px] sm:max-w-none">
                        {patient.fullName}
                      </h3>
                      <span className="font-mono text-[9px] sm:text-[10px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 shrink-0">
                        {patient.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      <span>{patient.age}y</span>
                      <span aria-hidden="true">·</span>
                      <span>{patient.gender}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{patient.phoneNumber}</span>
                    </div>

                    {lastVisit ? (
                      <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                        <span className="font-semibold text-teal-700 dark:text-teal-300">Latest:</span>{' '}
                        {lastVisit.chiefComplaints}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 italic mt-0.5">
                        No consultations yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action Buttons & Chevron */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open WhatsApp Chat"
                    className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => onSelectPatient(patient)}
                    className="p-1 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
