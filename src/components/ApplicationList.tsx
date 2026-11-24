import { Briefcase, MapPin, FileText, Calendar } from 'lucide-react';
import type { Application } from '../types';
import { calculateSkillMatch } from '../utils/skillMatch';
import { getMatchColor } from '../utils/skillMatch';

interface ApplicationListProps {
  applications: Application[];
  kaptenSkills: string[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusStyle(status: string): string {
  const map: Record<string, string> = {
    WISHLIST: 'status-wishlist',
    APPLIED: 'status-applied',
    SCREENING: 'status-screening',
    INTERVIEW: 'status-interview',
    OFFER: 'status-offer',
    REJECTED: 'status-rejected',
    GHOSTED: 'status-ghosted',
  };
  return map[status] ?? 'status-wishlist';
}

export function ApplicationList({
  applications,
  kaptenSkills,
}: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="state-container state-empty">
        <Briefcase size={48} />
        <h3>Belum Ada Lamaran</h3>
        <p>
          Simpan lowongan dari Eksplorasi atau tambahkan lamaran manual
          melalui tombol &quot;+ Catat Lamaran&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="app-list">
      <h3 className="app-list-title">
        Daftar Lamaran ({applications.length})
      </h3>
      <div className="app-list-grid">
        {applications.map((app) => {
          const match = calculateSkillMatch(kaptenSkills, app.requiredSkills);
          return (
            <div key={app.id} className="app-list-card">
              <div className="app-list-card-header">
                <div>
                  <h4 className="app-list-card-role">{app.role}</h4>
                  <p className="app-list-card-company">
                    <Briefcase size={13} /> {app.company}
                  </p>
                </div>
                <span className={`status-badge ${getStatusStyle(app.status)}`}>
                  {app.status}
                </span>
              </div>
              <div className="app-list-card-meta">
                <span>
                  <MapPin size={13} /> {app.workMode}
                </span>
                {app.cvVersion && (
                  <span>
                    <FileText size={13} /> {app.cvVersion}
                  </span>
                )}
                <span>
                  <Calendar size={13} /> {formatDate(app.lastUpdatedAt)}
                </span>
              </div>
              <div className="app-list-card-match">
                <span className={`match-pill ${getMatchColor(match.score)}`}>
                  {match.score}% Match
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
