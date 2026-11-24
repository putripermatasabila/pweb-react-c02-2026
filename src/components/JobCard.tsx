import { Bookmark, BookmarkCheck, CheckCircle2, MapPin } from 'lucide-react';
import type { SkillMatchResult } from '../types';
import { getMatchColor } from '../utils/skillMatch';

interface JobCardProps {
  companyName: string;
  location: string;
  title: string;
  salary: string;
  tags: string[];
  matchResult: SkillMatchResult;
  isApplied: boolean;
  onSave: () => void;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = [
    '#0070e0',
    '#0284c7',
    '#0d9488',
    '#4f46e5',
    '#7c3aed',
    '#d97706',
    '#dc2626',
    '#059669',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function JobCard({
  companyName,
  location,
  title,
  salary,
  tags,
  matchResult,
  isApplied,
  onSave,
}: JobCardProps) {
  const matchColorClass = getMatchColor(matchResult.score);

  return (
    <article className="glints-job-card">
      <div className="glints-job-top">
        <h3 className="glints-job-title">{title}</h3>
        <span className="glints-job-salary">
          {salary || 'Competitive'}
        </span>
      </div>

      <div className="glints-job-pills">
        <span className={`glints-match-pill ${matchColorClass}`}>
          {matchResult.score}% Match
        </span>
        {matchResult.matched.map((skill) => (
          <span key={skill} className="glints-skill-pill is-matched">
            {skill}
          </span>
        ))}
        {matchResult.missing.map((skill) => (
          <span key={skill} className="glints-skill-pill is-missing">
            {skill}
          </span>
        ))}
      </div>

      <div className="glints-job-company">
        <div
          className="glints-company-logo"
          style={{ backgroundColor: getAvatarColor(companyName) }}
        >
          {getInitials(companyName)}
        </div>
        <div className="glints-company-meta">
          <div className="glints-company-name-row">
            <CheckCircle2 size={14} className="glints-verified-icon" />
            <span className="glints-company-name">{companyName}</span>
          </div>
          <div className="glints-company-location">
            <MapPin size={13} />
            <span>{location || 'Indonesia'}</span>
          </div>
        </div>
      </div>

      <div className="glints-job-footer">
        <span className="glints-job-note">
          {tags.length === 0
            ? 'Tanpa syarat skill khusus'
            : matchResult.missing.length > 0
              ? `Kurang ${matchResult.missing.length} skill: ${matchResult.missing.slice(0, 2).join(', ')}${matchResult.missing.length > 2 ? '...' : ''}`
              : 'Semua skill cocok!'}
        </span>
        <button
          type="button"
          className={`glints-save-btn ${isApplied ? 'is-applied' : ''}`}
          onClick={onSave}
          disabled={isApplied}
          title={isApplied ? 'Sudah ada di daftar lamaran' : 'Simpan ke Wishlist'}
        >
          {isApplied ? (
            <>
              <BookmarkCheck size={16} />
              <span>Sudah Dilamar</span>
            </>
          ) : (
            <>
              <Bookmark size={16} />
              <span>Simpan ke Wishlist</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
