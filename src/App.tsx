import { useState, useRef, type ChangeEvent } from 'react';
import type { Application, JobListing, WorkMode, DataSource } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Navbar } from './components/Navbar';
import { JobExplorer } from './components/JobExplorer';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationDetail } from './components/ApplicationDetail';
import { OfferComparator } from './components/OfferComparator';
import { UndoToast } from './components/UndoToast';
import { simulateGhosting } from './utils/applicationPipeline';
import './App.css';

function parseWorkMode(location: string): WorkMode {
  const loc = location.toLowerCase();
  if (loc.includes('remote')) return 'Remote';
  if (loc.includes('hybrid')) return 'Hybrid';
  return 'Onsite';
}

export default function App() {
  const [applications, setApplications] = useLocalStorage<Application[]>(
    'kapten-applications',
    []
  );
  const [kaptenSkills, setKaptenSkills] = useLocalStorage<string[]>(
    'kapten-skills',
    ['React', 'TypeScript', 'CSS']
  );
  const [activeTab, setActiveTab] = useState('explore');
  const [showForm, setShowForm] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>('api');
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Undo delete state & useRef timers (Fitur 6)
  const [deletedAppInfo, setDeletedAppInfo] = useState<{
    app: Application;
    index: number;
  } | null>(null);
  const [undoCountdown, setUndoCountdown] = useState(5);
  const deleteTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const selectedApplication = applications.find((app) => app.id === selectedApplicationId);
  const offerCount = applications.filter((app) => app.status === 'OFFER').length;

  const clearDeleteTimers = () => {
    if (deleteTimerRef.current !== null) {
      window.clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const handleDeleteApplication = (id: string) => {
    // If a deletion happened previously within 5 seconds, clear old timer using useRef
    clearDeleteTimers();

    const targetIndex = applications.findIndex((app) => app.id === id);
    if (targetIndex === -1) return;
    const targetApp = applications[targetIndex];

    // Remove application immutably
    setApplications((prev) => prev.filter((app) => app.id !== id));

    if (selectedApplicationId === id) {
      setSelectedApplicationId(null);
    }

    setDeletedAppInfo({ app: targetApp, index: targetIndex });
    setUndoCountdown(5);

    // Live display countdown
    countdownIntervalRef.current = window.setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current !== null) {
            window.clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5-second timer managed with useRef
    deleteTimerRef.current = window.setTimeout(() => {
      setDeletedAppInfo(null);
      clearDeleteTimers();
    }, 5000);
  };

  const handleUndoDelete = () => {
    clearDeleteTimers();
    if (!deletedAppInfo) return;

    setApplications((prev) => {
      const copy = [...prev];
      const insertAt = Math.min(deletedAppInfo.index, copy.length);
      copy.splice(insertAt, 0, deletedAppInfo.app);
      return copy;
    });

    setDeletedAppInfo(null);
  };

  const handleDismissUndo = () => {
    clearDeleteTimers();
    setDeletedAppInfo(null);
  };

  // Nilai Tambahan (Bonus): Export / Import backup JSON
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      kaptenSkills,
      applications,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kapten-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.applications)) {
          setApplications(parsed.applications);
        }
        if (Array.isArray(parsed.kaptenSkills)) {
          setKaptenSkills(parsed.kaptenSkills);
        }
      } catch {
        // Silently ignore or invalid json
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveToWishlist = (job: JobListing) => {
    const isDuplicate = applications.some(
      (app) =>
        app.company.toLowerCase() === job.company_name.toLowerCase() &&
        app.role.toLowerCase() === job.title.toLowerCase()
    );
    if (isDuplicate) return;

    const now = new Date().toISOString();
    const newApp: Application = {
      id: crypto.randomUUID(),
      company: job.company_name,
      role: job.title,
      workMode: parseWorkMode(job.candidate_required_location),
      status: 'WISHLIST',
      requiredSkills: job.tags,
      lastUpdatedAt: now,
      checklist: [],
      activityLogs: [
        {
          id: crypto.randomUUID(),
          timestamp: now,
          message: 'Disimpan ke Wishlist dari Katalog',
        },
      ],
    };

    setApplications((prev) => [...prev, newApp]);
  };

  const handleAddApplication = (app: Application) => {
    setApplications((prev) => [...prev, app]);
  };

  const updateApplication = (
    id: string,
    update: (application: Application) => Application
  ) => {
    setApplications((previous) => previous.map((app) => app.id === id ? update(app) : app));
  };

  const isAlreadyApplied = (companyName: string, title: string): boolean => {
    return applications.some(
      (app) =>
        app.company.toLowerCase() === companyName.toLowerCase() &&
        app.role.toLowerCase() === title.toLowerCase()
    );
  };

  return (
    <div className="app">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={() => setShowForm(true)}
        applicationCount={applications.length}
        offerCount={offerCount}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {activeTab === 'explore' && (
        <JobExplorer
          kaptenSkills={kaptenSkills}
          onSkillsChange={setKaptenSkills}
          dataSource={dataSource}
          onDataSourceChange={setDataSource}
          onSaveToWishlist={handleSaveToWishlist}
          isAlreadyApplied={isAlreadyApplied}
        />
      )}

      {activeTab === 'pipeline' && (
        <main className="glints-main-container glints-pipeline-page">
          <ApplicationList
            applications={applications}
            kaptenSkills={kaptenSkills}
            onOpenDetail={setSelectedApplicationId}
            onSimulateGhosting={(id) => updateApplication(id, simulateGhosting)}
            onDelete={handleDeleteApplication}
          />
          {selectedApplication && (
            <ApplicationDetail
              key={selectedApplication.id}
              application={selectedApplication}
              onUpdate={(update) => updateApplication(selectedApplication.id, update)}
              onDelete={handleDeleteApplication}
              onSimulateGhosting={(id) => updateApplication(id, simulateGhosting)}
              onClose={() => setSelectedApplicationId(null)}
            />
          )}
        </main>
      )}

      {activeTab === 'compare' && (
        <OfferComparator
          applications={applications}
          kaptenSkills={kaptenSkills}
          onGoToPipeline={() => setActiveTab('pipeline')}
        />
      )}

      {showForm && (
        <ApplicationForm
          onSubmit={handleAddApplication}
          onClose={() => setShowForm(false)}
          applications={applications}
        />
      )}

      {deletedAppInfo && (
        <UndoToast
          deletedApp={deletedAppInfo.app}
          countdown={undoCountdown}
          onUndo={handleUndoDelete}
          onDismiss={handleDismissUndo}
        />
      )}
    </div>
  );
}
