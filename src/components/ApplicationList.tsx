import { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Briefcase, Calendar, FileText, MapPin, Trash2 } from 'lucide-react';
import type { Application, ApplicationStatus } from '../types';
import {
  canSimulateGhosting,
  formatApplicationDateTime,
  getInterviewConflicts,
  getInterviewTimestamp,
  isAtRiskOfGhosting,
} from '../utils/applicationPipeline';
import { calculateSkillMatch, getMatchColor } from '../utils/skillMatch';
import { applicationStatuses } from '../utils/stateMachine';
import { StatsCards } from './StatsCards';

interface ApplicationListProps {
  applications: Application[];
  kaptenSkills: string[];
  onOpenDetail: (id: string) => void;
  onSimulateGhosting: (id: string) => void;
  onDelete?: (id: string) => void;
}

type SortOrder = 'recent' | 'interview' | 'offer';

function compareInterviewTimes(first: Application, second: Application, now: number) {
  const firstTime = getInterviewTimestamp(first);
  const secondTime = getInterviewTimestamp(second);

  if (firstTime === undefined) return secondTime === undefined ? 0 : 1;
  if (secondTime === undefined) return -1;
  if (firstTime >= now && secondTime >= now) return firstTime - secondTime;
  if (firstTime < now && secondTime < now) return secondTime - firstTime;
  return firstTime >= now ? -1 : 1;
}

export function ApplicationList({
  applications,
  kaptenSkills,
  onOpenDetail,
  onSimulateGhosting,
  onDelete,
}: ApplicationListProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ApplicationStatus | 'all'>('all');
  const [onlyGhosting, setOnlyGhosting] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [now, setNow] = useState(() => Date.now());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const keyword = query.trim().toLowerCase();
  const visibleApplications = applications.filter((application) => (
    (status === 'all' || application.status === status) &&
    (!onlyGhosting || isAtRiskOfGhosting(application, now)) &&
    `${application.company} ${application.role}`.toLowerCase().includes(keyword)
  ));
  visibleApplications.sort((first, second) => {
    if (sortOrder === 'interview') return compareInterviewTimes(first, second, now);
    if (sortOrder === 'offer') return (second.salaryOffer ?? 0) - (first.salaryOffer ?? 0);
    return Date.parse(second.lastUpdatedAt) - Date.parse(first.lastUpdatedAt);
  });

  const conflicts = getInterviewConflicts(applications);

  return (
    <>
      {conflicts.length > 0 && (
        <aside className="interview-conflict" role="status">
          <AlertTriangle size={19} aria-hidden="true" />
          <div>
            <strong>Jadwal interview bentrok</strong>
            <ul>
              {conflicts.map(([first, second]) => (
                <li key={`${first.application.id}-${second.application.id}`}>
                  {first.application.company} — {first.application.role} ({formatApplicationDateTime(first.timestamp)})
                  {' dan '}
                  {second.application.company} — {second.application.role} ({formatApplicationDateTime(second.timestamp)})
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      <StatsCards applications={applications} now={now} />
      <section className="app-list" aria-labelledby="pipeline-title">
        <h2 id="pipeline-title" className="app-list-title">War Room Lamaran</h2>
        <div className="pipeline-filters">
          <label className="form-group">
            <span className="form-label">Cari lamaran</span>
            <input
              ref={searchInputRef}
              className="input"
              type="search"
              placeholder="Perusahaan atau posisi (tekan /)"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="form-group">
            <span className="form-label">Filter status</span>
            <select
              className="input"
              value={status}
              onChange={(event) => setStatus(
                applicationStatuses.find((option) => option === event.target.value) ?? 'all'
              )}
            >
              <option value="all">Semua status</option>
              {applicationStatuses.map((option) => (
                <option value={option} key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Urutkan</span>
            <select
              className="input"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="recent">Terbaru</option>
              <option value="interview">Jadwal Interview Terdekat</option>
              <option value="offer">Offer Tertinggi</option>
            </select>
          </label>
          <label className="pipeline-toggle">
            <input
              type="checkbox"
              checked={onlyGhosting}
              onChange={(event) => setOnlyGhosting(event.target.checked)}
            />
            Hanya Rawan Ghosting
          </label>
        </div>

        {visibleApplications.length === 0 ? (
          <div className="state-container state-empty">
            <Briefcase size={36} aria-hidden="true" />
            <h3>{applications.length === 0 ? 'Belum Ada Lamaran' : 'Lamaran Tidak Ditemukan'}</h3>
            <p>
              {applications.length === 0
                ? 'Simpan lowongan atau catat lamaran baru.'
                : 'Ubah kata kunci atau filter untuk melihat lamaran lain.'}
            </p>
          </div>
        ) : (
          <div className="app-list-grid">
            {visibleApplications.map((application) => {
              const { id, company, role, workMode, cvVersion, status, checklist, requiredSkills } = application;
              const match = calculateSkillMatch(kaptenSkills, requiredSkills);
              const completed = checklist.filter((item) => item.done).length;
              const interviewTime = getInterviewTimestamp(application);
              const lastUpdated = Date.parse(application.lastUpdatedAt);

              return (
                <article key={id} className="app-list-card" aria-labelledby={`application-${id}`}>
                  <div className="app-list-card-header">
                    <div>
                      <h3 id={`application-${id}`} className="app-list-card-role">{role}</h3>
                      <p className="app-list-card-company">
                        <Briefcase size={13} aria-hidden="true" /> {company}
                      </p>
                    </div>
                    <div className="app-list-badges">
                      <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>
                      {isAtRiskOfGhosting(application, now) && (
                        <span className="status-badge status-ghosted">Rawan Ghosting</span>
                      )}
                    </div>
                  </div>

                  <div className="app-list-card-meta">
                    <span><MapPin size={13} aria-hidden="true" /> {workMode}</span>
                    {cvVersion && <span><FileText size={13} aria-hidden="true" /> {cvVersion}</span>}
                    {interviewTime !== undefined && (
                      <span>
                        <Calendar size={13} aria-hidden="true" />
                        <time dateTime={application.interviewDateTime}>{formatApplicationDateTime(interviewTime)}</time>
                      </span>
                    )}
                    {status === 'OFFER' && application.salaryOffer !== undefined && (
                      <span>{application.salaryOffer.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 })}</span>
                    )}
                    {Number.isFinite(lastUpdated) && (
                      <time dateTime={application.lastUpdatedAt}>Diperbarui {formatApplicationDateTime(lastUpdated)}</time>
                    )}
                    <span>{completed}/{checklist.length} checklist selesai</span>
                  </div>

                  <div className="pipeline-card-footer">
                    <span className={`match-pill ${getMatchColor(match.score)}`}>{match.score}% Match</span>
                    <div className="pipeline-card-actions">
                      {canSimulateGhosting(status) && (
                        <button type="button" className="btn btn-ghost" onClick={() => onSimulateGhosting(id)}>
                          Simulasi +15 Hari
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-delete-danger"
                          onClick={() => onDelete(id)}
                          title="Hapus lamaran"
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Hapus
                        </button>
                      )}
                      <button type="button" className="btn btn-primary" onClick={() => onOpenDetail(id)}>
                        Lihat detail
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
