import React, { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Layers,
  ChevronRight,
  TrendingDown,
  Trash2,
  Droplet,
  X,
} from 'lucide-react';
import { Medicine, MedicineCategory, getMedicineUnit } from '../../types';
import { AddMedicineModal } from './AddMedicineModal';

interface InventoryManagerProps {
  medicines: Medicine[];
  onUpdateMedicineQty: (id: string, delta: number) => void;
  onAddMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  medicines,
  onUpdateMedicineQty,
  onAddMedicine,
  onDeleteMedicine,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [manualQtyValue, setManualQtyValue] = useState<string>('');

  // Low stock check based on threshold (strictly below minThreshold or 11)
  const isMedicineLowStock = (m: Medicine) => m.currentQuantity < (m.minThreshold ?? 11);
  const lowStockCount = medicines.filter(isMedicineLowStock).length;

  // Filtered medicines
  const filteredMedicines = medicines.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.name.toLowerCase().includes(query) ||
      m.potency.toLowerCase().includes(query) ||
      m.shelfRack.toLowerCase().includes(query) ||
      m.category.toLowerCase().includes(query);

    if (selectedCategory.startsWith('Low Stock')) {
      return matchesSearch && isMedicineLowStock(m);
    }

    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartManualEdit = (med: Medicine) => {
    setEditingQtyId(med.id);
    setManualQtyValue(String(med.currentQuantity));
  };

  const handleSaveManualEdit = (med: Medicine) => {
    const num = Math.max(0, parseInt(manualQtyValue, 10) || 0);
    const delta = num - med.currentQuantity;
    if (delta !== 0) {
      onUpdateMedicineQty(med.id, delta);
    }
    setEditingQtyId(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Inventory Summary & Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <Droplet className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">Medicine Stock & Inventory</span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="shrink-0">{medicines.length} Remedies Tracked</span>
              {lowStockCount > 0 && (
                <>
                  <span aria-hidden="true" className="shrink-0">·</span>
                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {lowStockCount} Low Stock Items
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white active:scale-[0.98] rounded-xl transition-all shadow-sm min-h-[40px] shrink-0"
            style={{ backgroundColor: 'var(--primary-color, #0d9488)' }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicine, potency, rack (e.g. Arnica, 200C, Rack A)..."
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

        {/* Category Pills with Low Stock Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            'All',
            'Low Stock Alert',
            'Dilution',
            'Mother Tincture',
            'Biochemic',
            'Sundries (Globules, Bottles, Sac Lac)',
          ].map((cat) => {
            const isLowStockTab = cat.startsWith('Low Stock');
            const isActive = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 min-h-[36px] ${
                  isActive
                    ? isLowStockTab
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-teal-600 text-white shadow-2xs'
                    : isLowStockTab && lowStockCount > 0
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isLowStockTab && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                <span>{cat}</span>
                {isLowStockTab && lowStockCount > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-rose-800 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock List */}
      {filteredMedicines.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800">
          <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Stock Records</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchQuery
              ? `No medicines matching "${searchQuery}".`
              : 'Add your homeopathic remedies, dilutions, mother tinctures (ml), and biochemic & sundries (grams).'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredMedicines.map((med) => {
            const unit = getMedicineUnit(med);
            const isLowStock = isMedicineLowStock(med);
            const isEditing = editingQtyId === med.id;

            return (
              <div
                key={med.id}
                className={`bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border transition-all space-y-2.5 ${
                  isLowStock
                    ? 'border-rose-300 dark:border-rose-700/60 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700'
                }`}
              >
                {/* Top Section: Remedy Details + Delete Action */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Name, Potency, and Low Stock Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 break-words leading-tight">
                        {med.name}
                      </h3>
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                        {med.potency}
                      </span>
                      {isLowStock && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          LOW STOCK (&lt; {med.minThreshold ?? 11} {unit})
                        </span>
                      )}
                    </div>

                    {/* Metadata: Category, Pack, Shelf/Rack, Price */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{med.category}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span>Pack: {med.packSize}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {med.shelfRack}
                      </span>
                      {med.pricePerUnit > 0 && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">₹{med.pricePerUnit}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remove Button cleanly aligned in top-right */}
                  <button
                    type="button"
                    onClick={() => onDeleteMedicine(med.id)}
                    title="Remove medicine"
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Section: Stock Volume Indicator & Stepper Controls */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Droplet className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span>Current Stock:</span>
                    <span
                      className={`font-extrabold text-xs sm:text-sm ${
                        isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {med.currentQuantity} {unit}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-teal-500">
                        <input
                          type="number"
                          min="0"
                          value={manualQtyValue}
                          onChange={(e) => setManualQtyValue(e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs font-bold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none text-right"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveManualEdit(med);
                            if (e.key === 'Escape') setEditingQtyId(null);
                          }}
                        />
                        <span className="text-xs font-bold text-slate-500">{unit}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveManualEdit(med)}
                        className="px-2.5 py-1 text-xs bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 shadow-2xs transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingQtyId(null)}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
                      {/* -5 button */}
                      <button
                        type="button"
                        onClick={() => onUpdateMedicineQty(med.id, -5)}
                        className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 text-xs font-bold transition-colors min-h-[32px]"
                        title={`Dispense 5 ${unit}`}
                      >
                        -5
                      </button>
                      {/* -1 button */}
                      <button
                        type="button"
                        onClick={() => onUpdateMedicineQty(med.id, -1)}
                        className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 text-xs font-bold transition-colors min-h-[32px] border-r border-slate-200 dark:border-slate-700"
                        title={`Dispense 1 ${unit}`}
                      >
                        -1
                      </button>

                      {/* Direct Click to edit value */}
                      <button
                        type="button"
                        onClick={() => handleStartManualEdit(med)}
                        className={`px-3 py-1 text-xs font-extrabold min-w-[56px] text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                          isLowStock
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/40'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                        title={`Click to type exact ${unit}`}
                      >
                        {med.currentQuantity} {unit}
                      </button>

                      {/* +1 button */}
                      <button
                        type="button"
                        onClick={() => onUpdateMedicineQty(med.id, 1)}
                        className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 text-xs font-bold transition-colors min-h-[32px] border-l border-slate-200 dark:border-slate-700"
                        title={`Add 1 ${unit}`}
                      >
                        +1
                      </button>
                      {/* +5 button */}
                      <button
                        type="button"
                        onClick={() => onUpdateMedicineQty(med.id, 5)}
                        className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:bg-slate-200 text-xs font-bold transition-colors min-h-[32px]"
                        title={`Restock 5 ${unit}`}
                      >
                        +5
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddMedicine}
      />
    </div>
  );
};
