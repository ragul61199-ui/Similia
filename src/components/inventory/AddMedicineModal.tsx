import React, { useState } from 'react';
import { X, PackagePlus, AlertCircle, Droplet } from 'lucide-react';
import { Medicine, MedicineCategory, MedicineUnit, getMedicineUnit } from '../../types';
import { COMMON_POTENCIES, COMMON_REMEDIES } from '../../data/homeopathyData';

interface AddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Medicine) => void;
}

const CATEGORIES: MedicineCategory[] = [
  'Dilution',
  'Mother Tincture',
  'Biochemic',
  'Trituration',
  'Patent / Special formulation',
  'Sundries (Globules, Bottles, Sac Lac)',
];

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MedicineCategory>('Dilution');
  const [potency, setPotency] = useState('200C');
  const [packSize, setPackSize] = useState('100ml');
  const [currentQuantity, setCurrentQuantity] = useState(30);
  const [unit, setUnit] = useState<MedicineUnit>('ml');
  const [minThreshold, setMinThreshold] = useState(11);
  const [shelfRack, setShelfRack] = useState('Rack A, Shelf 1');
  const [pricePerUnit, setPricePerUnit] = useState(120);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (newCat: MedicineCategory) => {
    setCategory(newCat);
    if (newCat === 'Biochemic' || newCat === 'Trituration') {
      setUnit('grams');
      if (packSize.endsWith('ml')) setPackSize('100g');
      if (potency === '200C' || potency === '30C') setPotency('6X');
    } else if (newCat === 'Dilution' || newCat === 'Mother Tincture') {
      setUnit('ml');
      if (packSize.endsWith('g')) setPackSize('100ml');
      if (potency === '6X') setPotency('200C');
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    const lower = newName.toLowerCase();
    if (
      lower.includes('cane sugar globules') ||
      lower.includes('globules') ||
      lower.includes('sugar of milk') ||
      lower.includes('sac lac') ||
      lower.includes('lactose')
    ) {
      setUnit('grams');
      setCategory('Sundries (Globules, Bottles, Sac Lac)');
      if (lower.includes('cane sugar globules') || lower.includes('globules')) {
        setPotency('Size 30');
        setPackSize('450g Container');
      } else if (lower.includes('sugar of milk') || lower.includes('sac lac') || lower.includes('lactose')) {
        setPotency('Pure Grade');
        setPackSize('450g / 1kg');
      }
    } else if (category === 'Biochemic' || category === 'Trituration') {
      setUnit('grams');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Medicine name is required');
      return;
    }

    const detectedUnit = getMedicineUnit({ category, name: name.trim(), unit });

    const newMed: Medicine = {
      id: `MED-${Date.now()}`,
      name: name.trim(),
      category,
      potency: potency.trim(),
      packSize: packSize.trim(),
      currentQuantity: Number(currentQuantity),
      unit: detectedUnit,
      minThreshold: Number(minThreshold) || 11,
      shelfRack: shelfRack.trim(),
      pricePerUnit: Number(pricePerUnit),
      batchNumber: batchNumber.trim() || undefined,
      expiryDate: expiryDate.trim() || undefined,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(newMed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="px-5 py-4 bg-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-teal-200" />
            <h3 className="font-semibold text-base sm:text-lg">Add Medicine Stock</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-600 transition-colors"
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

          {/* Medicine Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remedy / Medicine Name *
            </label>
            <input
              type="text"
              list="inventory-remedies"
              required
              placeholder="e.g. Arnica Montana, Cane Sugar Globules No. 30, Sugar of Milk"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
            <datalist id="inventory-remedies">
              {COMMON_REMEDIES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Category & Potency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MedicineCategory)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Potency *
              </label>
              <input
                type="text"
                list="inv-potencies"
                required
                placeholder="e.g. 200C, Q, 6X, Size 30"
                value={potency}
                onChange={(e) => setPotency(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
              <datalist id="inv-potencies">
                {COMMON_POTENCIES.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Measurement Unit: ml vs grams */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quantity Measurement Unit *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUnit('ml')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  unit === 'ml'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Droplet className="w-3.5 h-3.5" />
                <span>ml (Volume)</span>
              </button>
              <button
                type="button"
                onClick={() => setUnit('grams')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  unit === 'grams'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>grams (Weight)</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Biochemic remedies, Cane Sugar Globules No. 30, and Sugar of Milk are measured in grams.
            </p>
          </div>

          {/* Pack Size & Shelf/Rack Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Original Pack Size
              </label>
              <input
                type="text"
                placeholder={unit === 'grams' ? 'e.g. 100g, 450g' : 'e.g. 30ml, 100ml, 450ml'}
                value={packSize}
                onChange={(e) => setPackSize(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Shelf / Rack Location *
              </label>
              <input
                type="text"
                placeholder="e.g. Rack A, Shelf 2"
                value={shelfRack}
                onChange={(e) => setShelfRack(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Current Volume in ml/grams & Low Stock Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stock Quantity in {unit} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  required
                  placeholder={unit === 'grams' ? 'e.g. 100' : 'e.g. 30'}
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pr-14"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                  {unit}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Low stock alert triggers automatically below 11 {unit}
              </p>
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Batch & Expiry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batch Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SBL-2026-44"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="month"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
            >
              Save Medicine Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
