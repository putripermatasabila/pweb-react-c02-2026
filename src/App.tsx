import { useState } from 'react';
import type { Application, JobListing, WorkMode, DataSource } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { SkillProfile } from './components/SkillProfile';
import { JobExplorer } from './components/JobExplorer';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationList } from './components/ApplicationList';
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
      />

      <main className="main-content">
        <StatsCards applications={applications} />

        {activeTab === 'explore' && (
          <div className="content-layout">
            <aside className="sidebar">
              <SkillProfile
                skills={kaptenSkills}
                onSkillsChange={setKaptenSkills}
                dataSource={dataSource}
                onDataSourceChange={setDataSource}
              />
            </aside>
            <section className="content-main">
              <JobExplorer
                kaptenSkills={kaptenSkills}
                dataSource={dataSource}
                onDataSourceChange={setDataSource}
                onSaveToWishlist={handleSaveToWishlist}
                isAlreadyApplied={isAlreadyApplied}
              />
            </section>
          </div>
        )}

        {activeTab === 'pipeline' && (
          <ApplicationList
            applications={applications}
            kaptenSkills={kaptenSkills}
          />
        )}
      </main>

      {showForm && (
        <ApplicationForm
          onSubmit={handleAddApplication}
          onClose={() => setShowForm(false)}
          applications={applications}
        />
      )}
    </div>
  );
}
