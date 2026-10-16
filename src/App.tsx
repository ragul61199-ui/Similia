/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { applyTheme } from './services/theme';
import { Bill, ClinicConfig, ClinicalVisit, FollowUpItem, Medicine, Patient } from './types';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/common/BottomNav';
import { AndroidFrame } from './components/common/AndroidFrame';
import { PatientList } from './components/patients/PatientList';
import { PatientDetailView } from './components/patients/PatientDetailView';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { AddVisitModal } from './components/patients/AddVisitModal';
import { PatientIdCardModal } from './components/patients/PatientIdCardModal';
import { InventoryManager } from './components/inventory/InventoryManager';
import { BillingManager } from './components/billing/BillingManager';
import { FollowUpManager } from './components/followups/FollowUpManager';
import { SettingsModal } from './components/settings/SettingsModal';
import { CreateBillModal } from './components/billing/CreateBillModal';

export default function App() {
  // App state backed by LocalStorage
  const [clinicConfig, setClinicConfig] = useState<ClinicConfig>(() =>
    StorageService.getClinicConfig()
  );
  const [patients, setPatients] = useState<Patient[]>(() => StorageService.getPatients());
  const [medicines, setMedicines] = useState<Medicine[]>(() => StorageService.getMedicines());
  const [bills, setBills] = useState<Bill[]>(() => StorageService.getBills());

  // Apply Theme Mode (Dark/Light) & Accent Color to DOM
  useEffect(() => {
    applyTheme(clinicConfig.themeMode === 'dark', clinicConfig.accentColor || 'teal');
  }, [clinicConfig.themeMode, clinicConfig.accentColor]);

  // UI Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 640;
    }
    return true;
  });

  // Modals & Active Edit States
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);
  const [visitToEdit, setVisitToEdit] = useState<ClinicalVisit | null>(null);

  const [selectedPatientForIdCard, setSelectedPatientForIdCard] = useState<Patient | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateBillOpen, setIsCreateBillOpen] = useState(false);
  const [billTargetPatient, setBillTargetPatient] = useState<Patient | null>(null);
  const [billTargetVisit, setBillTargetVisit] = useState<ClinicalVisit | null>(null);
  const [activeBillIdToOpen, setActiveBillIdToOpen] = useState<string | null>(null);

  // Sync state changes to storage
  const handleSaveClinicConfig = (config: ClinicConfig) => {
    setClinicConfig(config);
    StorageService.saveClinicConfig(config);
    applyTheme(config.themeMode === 'dark', config.accentColor || 'teal');
  };

  const handleToggleTheme = () => {
    const nextMode = clinicConfig.themeMode === 'dark' ? 'light' : 'dark';
    const updated = { ...clinicConfig, themeMode: nextMode as 'light' | 'dark' };
    handleSaveClinicConfig(updated);
  };

  // Patient Actions: Create or Update
  const handleSavePatient = (savedPatient: Patient) => {
    const existingIndex = patients.findIndex((p) => p.id === savedPatient.id);
    let updated: Patient[];

    if (existingIndex >= 0) {
      updated = patients.map((p) => (p.id === savedPatient.id ? savedPatient : p));
      StorageService.updatePatient(savedPatient);
    } else {
      updated = [savedPatient, ...patients];
      StorageService.savePatients(updated);
    }

    setPatients(updated);
    setSelectedPatientId(savedPatient.id);
    setPatientToEdit(null);
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setIsNewPatientOpen(true);
  };

  const handleDeletePatient = (patientId: string) => {
    StorageService.deletePatient(patientId);
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    setBills((prev) => prev.filter((b) => b.patientId !== patientId));
    setSelectedPatientId(null);
  };

  // Consultation Actions: Create or Edit
  const handleOpenAddVisit = () => {
    setVisitToEdit(null);
    setIsAddVisitOpen(true);
  };

  const handleOpenEditVisit = (visit: ClinicalVisit) => {
    setVisitToEdit(visit);
    setIsAddVisitOpen(true);
  };

  const handleSaveVisit = (
    savedVisit: ClinicalVisit,
    autoCreateBill: boolean,
    billData?: { consultationFee: number; medicineCharges: number; paymentMode: any }
  ) => {
    if (!selectedPatientId) return;

    let createdBill: Bill | null = null;
    const patientObj = patients.find((p) => p.id === selectedPatientId);

    if (autoCreateBill && billData && patientObj) {
      const nextBillNo = `REC-${new Date().getFullYear()}-${String(bills.length + 1).padStart(3, '0')}`;
      createdBill = {
        id: savedVisit.billId || `INV-${Date.now()}`,
        billNumber: nextBillNo,
        patientId: patientObj.id,
        patientName: patientObj.fullName,
        patientPhone: patientObj.phoneNumber,
        visitId: savedVisit.id,
        date: savedVisit.date,
        consultationFee: billData.consultationFee,
        medicineCharges: billData.medicineCharges,
        courierOrOtherCharges: 0,
        discount: 0,
        totalAmount: billData.consultationFee + billData.medicineCharges,
        paymentMode: billData.paymentMode,
        clinicDetails: clinicConfig,
      };
      const updatedBills = [createdBill, ...bills];
      setBills(updatedBills);
      StorageService.saveBills(updatedBills);
    }

    const updatedPatients = patients.map((p) => {
      if (p.id === selectedPatientId) {
        const visitExists = p.visits.some((v) => v.id === savedVisit.id);
        const updatedVisits = visitExists
          ? p.visits.map((v) => (v.id === savedVisit.id ? savedVisit : v))
          : [savedVisit, ...p.visits];

        return {
          ...p,
          visits: updatedVisits,
        };
      }
      return p;
    });

    setPatients(updatedPatients);
    StorageService.savePatients(updatedPatients);
    setVisitToEdit(null);
  };

  // Follow-up actions
  const handleRescheduleFollowUp = (patientId: string, visitId: string, newDate: string) => {
    const updatedPatients = patients.map((p) => {
      if (p.id === patientId) {
        const updatedVisits = p.visits.map((v) => {
          if (v.id === visitId) {
            return { ...v, nextFollowUpDate: newDate };
          }
          return v;
        });
        return { ...p, visits: updatedVisits };
      }
      return p;
    });
    setPatients(updatedPatients);
    StorageService.savePatients(updatedPatients);
  };

  const handleCompleteFollowUp = (patientId: string, visitId: string) => {
    const updatedPatients = patients.map((p) => {
      if (p.id === patientId) {
        const updatedVisits = p.visits.map((v) => {
          if (v.id === visitId) {
            return { ...v, nextFollowUpDate: undefined, doctorNotes: (v.doctorNotes ? v.doctorNotes + ' · ' : '') + 'Follow-up completed' };
          }
          return v;
        });
        return { ...p, visits: updatedVisits };
      }
      return p;
    });
    setPatients(updatedPatients);
    StorageService.savePatients(updatedPatients);
  };

  // Medicine Inventory Handlers
  const handleUpdateMedicineQty = (id: string, delta: number) => {
    const updated = medicines.map((m) => {
      if (m.id === id) {
        const nextQty = Math.max(0, m.currentQuantity + delta);
        return { ...m, currentQuantity: nextQty, updatedAt: new Date().toISOString().split('T')[0] };
      }
      return m;
    });
    setMedicines(updated);
    StorageService.saveMedicines(updated);
  };

  const handleAddMedicine = (newMed: Medicine) => {
    const updated = [newMed, ...medicines];
    setMedicines(updated);
    StorageService.saveMedicines(updated);
  };

  const handleDeleteMedicine = (id: string) => {
    if (confirm('Are you sure you want to delete this medicine from stock?')) {
      const updated = medicines.filter((m) => m.id !== id);
      setMedicines(updated);
      StorageService.saveMedicines(updated);
    }
  };

  // Billing Handlers
  const handleSaveBill = (newBill: Bill) => {
    const updated = [newBill, ...bills];
    setBills(updated);
    StorageService.saveBills(updated);
    setActiveBillIdToOpen(newBill.id);
  };

  const handleOpenCreateBillForPatient = (patient: Patient, visit?: ClinicalVisit) => {
    setBillTargetPatient(patient);
    setBillTargetVisit(visit || null);
    setIsCreateBillOpen(true);
  };

  const handleSelectPatientById = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('patients');
  };

  const handleViewBillById = (billId: string) => {
    setActiveBillIdToOpen(billId);
    setActiveTab('billing');
  };

  // Export / Import Handlers
  const handleExportBackup = () => {
    const jsonStr = StorageService.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `similia_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = StorageService.importBackupJson(content);
      if (success) {
        const loadedPatients = StorageService.getPatients();
        const loadedMedicines = StorageService.getMedicines();
        const loadedBills = StorageService.getBills();
        const loadedConfig = StorageService.getClinicConfig();

        setPatients(loadedPatients);
        setMedicines(loadedMedicines);
        setBills(loadedBills);
        setClinicConfig(loadedConfig);
        applyTheme(loadedConfig.themeMode === 'dark', loadedConfig.accentColor || 'teal');
        alert('Data successfully imported from backup file!');
      } else {
        alert('Failed to parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    StorageService.resetToDemo();
    setPatients(StorageService.getPatients());
    setMedicines(StorageService.getMedicines());
    setBills(StorageService.getBills());
    const cfg = StorageService.getClinicConfig();
    setClinicConfig(cfg);
    applyTheme(cfg.themeMode === 'dark', cfg.accentColor || 'teal');
    setSelectedPatientId(null);
  };

  // Compute Alerts
  const followUps = StorageService.getFollowUps();
  const followUpAlertCount = followUps.filter((f) => f.status === 'today' || f.status === 'missed').length;
  // Low stock alert strictly below threshold
  const lowStockAlertCount = medicines.filter((m) => m.currentQuantity < (m.minThreshold ?? 11)).length;

  // Selected Patient Object
  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId) || null
    : null;

  return (
    <AndroidFrame
      isMobileFrame={isMobileFrame}
      header={
        <Header
          clinicConfig={clinicConfig}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onOpenNewPatient={() => {
            setPatientToEdit(null);
            setIsNewPatientOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onExportData={handleExportBackup}
          onToggleTheme={handleToggleTheme}
        />
      }
      bottomNav={
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          followUpAlertCount={followUpAlertCount}
          lowStockAlertCount={lowStockAlertCount}
          isMobileFrame={isMobileFrame}
        />
      }
    >
      {/* Main Tab View Canvas */}
      <main className="w-full">
        {activeTab === 'patients' && (
          <>
            {selectedPatient ? (
              <PatientDetailView
                patient={selectedPatient}
                clinicConfig={clinicConfig}
                onBack={() => setSelectedPatientId(null)}
                onOpenAddVisit={handleOpenAddVisit}
                onOpenCreateBill={handleOpenCreateBillForPatient}
                onViewBillById={handleViewBillById}
                onEditPatient={handleOpenEditPatient}
                onDeletePatient={handleDeletePatient}
                onOpenIdCard={(p) => setSelectedPatientForIdCard(p)}
                onEditVisit={handleOpenEditVisit}
              />
            ) : (
              <PatientList
                patients={patients}
                onSelectPatient={(p) => setSelectedPatientId(p.id)}
                onOpenNewPatient={() => {
                  setPatientToEdit(null);
                  setIsNewPatientOpen(true);
                }}
              />
            )}
          </>
        )}

        {activeTab === 'followups' && (
          <FollowUpManager
            followUps={followUps}
            clinicConfig={clinicConfig}
            patients={patients}
            onSelectPatientById={handleSelectPatientById}
            onRescheduleFollowUp={handleRescheduleFollowUp}
            onCompleteFollowUp={handleCompleteFollowUp}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            medicines={medicines}
            onUpdateMedicineQty={handleUpdateMedicineQty}
            onAddMedicine={handleAddMedicine}
            onDeleteMedicine={handleDeleteMedicine}
          />
        )}

        {activeTab === 'billing' && (
          <BillingManager
            bills={bills}
            patients={patients}
            clinicConfig={clinicConfig}
            onSaveBill={handleSaveBill}
            activeBillIdToOpen={activeBillIdToOpen}
            onClearActiveBillId={() => setActiveBillIdToOpen(null)}
          />
        )}
      </main>

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => {
          setIsNewPatientOpen(false);
          setPatientToEdit(null);
        }}
        onSave={handleSavePatient}
        existingPatientsCount={patients.length}
        initialPatient={patientToEdit}
      />

      {selectedPatient && (
        <AddVisitModal
          isOpen={isAddVisitOpen}
          onClose={() => {
            setIsAddVisitOpen(false);
            setVisitToEdit(null);
          }}
          patient={selectedPatient}
          clinicConfig={clinicConfig}
          initialVisit={visitToEdit}
          onSaveVisit={handleSaveVisit}
        />
      )}

      {selectedPatientForIdCard && (
        <PatientIdCardModal
          isOpen={!!selectedPatientForIdCard}
          onClose={() => setSelectedPatientForIdCard(null)}
          patient={selectedPatientForIdCard}
          clinicConfig={clinicConfig}
        />
      )}

      <CreateBillModal
        isOpen={isCreateBillOpen}
        onClose={() => {
          setIsCreateBillOpen(false);
          setBillTargetPatient(null);
          setBillTargetVisit(null);
        }}
        patients={patients}
        selectedPatient={billTargetPatient}
        selectedVisit={billTargetVisit}
        clinicConfig={clinicConfig}
        onSaveBill={handleSaveBill}
        existingBillsCount={bills.length}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clinicConfig={clinicConfig}
        onSaveConfig={handleSaveClinicConfig}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetDemo={handleResetDemo}
      />
    </AndroidFrame>
  );
}
