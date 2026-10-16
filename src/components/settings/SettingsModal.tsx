import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Check,
  Image as ImageIcon,
  PenTool,
  Eraser,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { ClinicConfig } from '../../types';
import { ACCENT_PRESETS, AccentColor, applyTheme } from '../../services/theme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicConfig: ClinicConfig;
  onSaveConfig: (config: ClinicConfig) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  clinicConfig,
  onSaveConfig,
  onExportBackup,
  onImportBackup,
  onResetDemo,
}) => {
  const [formData, setFormData] = useState<ClinicConfig>({ ...clinicConfig });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');

  // Canvas signature ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    setFormData({ ...clinicConfig });
  }, [clinicConfig, isOpen]);

  if (!isOpen) return null;

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setFormData((prev) => ({ ...prev, physicianSignature: dataUrl }));
    }
  };

  const clearCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData((prev) => ({ ...prev, physicianSignature: undefined }));
  };

  // Logo file upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, clinicLogo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // Signature file upload handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, physicianSignature: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (confirm('Importing data will restore patients, inventory, and bills from this file. Proceed?')) {
        onImportBackup(file);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-base">Clinic Profile & Visual Identity</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {saveSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Settings, Logo & Signature updated successfully!</span>
            </div>
          )}

          {/* Section: Visual Theme & Appearance */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Theme & UI Accent Color
            </h4>

            {/* Dark / Light Mode Switch */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Display Theme Mode
              </span>
              <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-1 rounded-lg gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, themeMode: 'light' }));
                    applyTheme(false, formData.accentColor || 'teal');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    formData.themeMode !== 'dark'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, themeMode: 'dark' }));
                    applyTheme(true, formData.accentColor || 'teal');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    formData.themeMode === 'dark'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Accent Presets */}
            <div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
                Primary UI Accent Color
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(Object.keys(ACCENT_PRESETS) as AccentColor[]).map((key) => {
                  const preset = ACCENT_PRESETS[key];
                  const isSelected = (formData.accentColor || 'teal') === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, accentColor: key }));
                        applyTheme(formData.themeMode === 'dark', key);
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-slate-900 dark:border-white ring-2 ring-slate-400/30 font-bold bg-white dark:bg-slate-900 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-white'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full mb-1 shrink-0 shadow-2xs"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-[10px] leading-tight text-slate-700 dark:text-slate-300">
                        {preset.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Clinic Logo & Physician Signature */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Clinic Logo & Digital Signature (Embedded in PDFs)
            </h4>

            {/* Logo Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                  {formData.clinicLogo ? (
                    <img
                      src={formData.clinicLogo}
                      alt="Clinic Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400 text-center font-medium">No Logo</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Official Clinic Logo
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Appears on Receipts, Prescriptions & ID Cards
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs">
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
                {formData.clinicLogo && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, clinicLogo: undefined }))}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Signature Row */}
            <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Physician Digital Signature
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Draw with mouse/touch or upload scanned signature PNG
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setSignatureMode('draw')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      signatureMode === 'draw'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureMode('upload')}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      signatureMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Upload Image
                  </button>
                </div>
              </div>

              {signatureMode === 'draw' ? (
                <div className="space-y-1.5">
                  <div className="border border-slate-300 dark:border-slate-600 rounded-xl bg-white overflow-hidden shadow-inner relative">
                    <canvas
                      ref={canvasRef}
                      width={380}
                      height={100}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-24 touch-none cursor-crosshair bg-white"
                    />
                    <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-slate-400">
                      Sign in box
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={clearCanvasSignature}
                      className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Clear Canvas</span>
                    </button>
                    {formData.physicianSignature && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Signature Saved
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700">
                  {formData.physicianSignature && (
                    <div className="h-12 w-28 bg-white border border-slate-200 rounded p-1 flex items-center justify-center shrink-0">
                      <img
                        src={formData.physicianSignature}
                        alt="Signature Preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose Signature Image (PNG/JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Clinic Demographics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Clinic & Physician Details
            </h4>

            {/* Clinic Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Doctor Name & Qualifications */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degrees / Qualifications *
                </label>
                <input
                  type="text"
                  required
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  placeholder="B.H.M.S., M.D. (Hom.)"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Reg Number & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Homeopathy Reg. No.
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinic Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Email & UPI */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPI ID for QR Billing
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="doctor@okhdfcbank"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clinic Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>
            </div>

            {/* Thank You Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp & Receipt Footer Message
              </label>
              <textarea
                rows={2}
                value={formData.thankYouNote}
                onChange={(e) => setFormData({ ...formData, thankYouNote: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Offline Data Backup & Restore
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Download Backup</span>
              </button>

              <label className="cursor-pointer flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                <Upload className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset to initial realistic demo patient cases and inventory?')) {
                  onResetDemo();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Sample Clinical Demo Data</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-700 active:scale-[0.98] rounded-lg shadow-sm"
            >
              Save All Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
