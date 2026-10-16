import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Phone,
  User,
  Calendar,
  MapPin,
  AlertCircle,
  Camera,
  Upload,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Gender, Patient } from '../../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  existingPatientsCount: number;
  initialPatient?: Patient | null;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingPatientsCount,
  initialPatient,
}) => {
  const isEditMode = !!initialPatient;
  const currentYear = new Date().getFullYear();
  const nextId = isEditMode
    ? initialPatient.id
    : `HOM-${currentYear}-${String(existingPatientsCount + 1).padStart(3, '0')}`;

  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Female' as Gender,
    phoneNumber: '',
    address: '',
    bloodGroup: '',
    occupation: '',
    allergies: '',
    photoUrl: '' as string | undefined,
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPatient) {
      setFormData({
        fullName: initialPatient.fullName,
        age: String(initialPatient.age),
        gender: initialPatient.gender,
        phoneNumber: initialPatient.phoneNumber,
        address: initialPatient.address || '',
        bloodGroup: initialPatient.bloodGroup || '',
        occupation: initialPatient.occupation || '',
        allergies: initialPatient.allergies || '',
        photoUrl: initialPatient.photoUrl || '',
      });
    } else {
      setFormData({
        fullName: '',
        age: '',
        gender: 'Female',
        phoneNumber: '',
        address: '',
        bloodGroup: '',
        occupation: '',
        allergies: '',
        photoUrl: undefined,
      });
    }
    setError('');
  }, [initialPatient, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setError('Patient full name is required');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required for WhatsApp communication');
      return;
    }
    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setError('Please enter a valid age (0-120)');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const savedPatient: Patient = {
      id: nextId,
      fullName: formData.fullName.trim(),
      age: ageNum,
      gender: formData.gender,
      phoneNumber: formData.phoneNumber.trim(),
      address: formData.address.trim(),
      bloodGroup: formData.bloodGroup.trim() || undefined,
      occupation: formData.occupation.trim() || undefined,
      allergies: formData.allergies.trim() || undefined,
      photoUrl: formData.photoUrl || undefined,
      registrationDate: initialPatient ? initialPatient.registrationDate : todayStr,
      visits: initialPatient ? initialPatient.visits : [],
    };

    onSave(savedPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <Edit3 className="w-5 h-5 text-teal-400" />
            ) : (
              <UserPlus className="w-5 h-5 text-teal-400" />
            )}
            <h3 className="font-semibold text-base">
              {isEditMode ? `Edit Patient Profile (${nextId})` : 'Register New Patient'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Assigned Patient ID Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200">
            <span className="font-medium">Patient Unique Identifier:</span>
            <span className="font-mono font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-teal-300 dark:border-teal-700">
              {nextId}
            </span>
          </div>

          {/* Patient Photograph Uploader */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Patient Photograph (Profile Avatar & Digital ID Card)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Patient Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-7 h-7 text-slate-400" />
                )}
              </div>

              <div className="flex-1 flex flex-wrap items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-2xs">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photoUrl: undefined }))}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Ananya Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Age & Gender Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age (Years) *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  placeholder="e.g. 32"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Child">Child</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone Number (WhatsApp) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              WhatsApp Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-teal-600" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used for 1-tap WhatsApp prescriptions, receipts, and follow-up reminders.
            </p>
          </div>

          {/* Blood Group & Occupation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. O+, B+"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Occupation
              </label>
              <input
                type="text"
                placeholder="e.g. Teacher, Engineer"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Address / Locality
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. R.S. Puram, Coimbatore"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Known Allergies */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Known Hypersensitivities / Drug Allergies
            </label>
            <input
              type="text"
              placeholder="e.g. Dust, seafood, penicillin, cold air"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-[0.98] rounded-lg transition-all shadow-sm"
            >
              {isEditMode ? 'Update Patient Profile' : 'Save Patient Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
