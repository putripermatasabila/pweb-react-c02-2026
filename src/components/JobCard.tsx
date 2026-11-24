import { Bookmark, BookmarkCheck, MapPin } from 'lucide-react';
import type { SkillMatchResult } from '../types';
import { getMatchColor, getMatchDot } from '../utils/skillMatch';

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
    '#1e40af', '#7c3aed', '#059669', '#d97706',
    '#dc2626', '#0891b2', '#4f46e5', '#be185d',
    '#0d9488', '#6d28d9',
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
  const dotColor = getMatchDot(matchResult.score);

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-card-company-row">
          <div
            className="job-card-avatar"
            style={{ backgroundColor: getAvatarColor(companyName) }}
          >
            {getInitials(companyName)}
          </div>
          <div className="job-card-company-info">
            <span className="job-card-company-name">{companyName}</span>
            <span className="job-card-location">
              <MapPin size={13} />
              {location}
            </span>
          </div>
        </div>
        <div className={`job-card-match-badge ${matchColorClass}`}>
          <span
            className="match-dot"
            style={{ backgroundColor: dotColor }}
          />
          {matchResult.score}% Match
        </div>
      </div>

      <h4 className="job-card-title">{title}</h4>

      <div className="job-card-skills">
        {matchResult.matched.map((skill) => (
          <span key={skill} className="skill-tag skill-tag-match">
            {skill}
          </span>
        ))}
        {matchResult.missing.map((skill) => (
          <span key={skill} className="skill-tag skill-tag-missing">
            {skill}
          </span>
        ))}
      </div>

      <div className="job-card-footer">
        <div className="job-card-salary">
          {salary || 'Gaji tidak tercantum'}
          {salary && <span className="salary-period"> / bulan</span>}
        </div>
        <button
          className={`btn ${isApplied ? 'btn-disabled' : 'btn-outline-primary'}`}
          onClick={onSave}
          disabled={isApplied}
        >
          {isApplied ? (
            <>
              <BookmarkCheck size={16} />
              Sudah Dilamar
            </>
          ) : (
            <>
              <Bookmark size={16} />
              Simpan ke Wishlist
            </>
          )}
        </button>
      </div>

      {tags.length > 0 && matchResult.missing.length > 0 && (
        <div className="job-card-missing-note">
          Missing: {matchResult.missing.join(', ')}
        </div>
      )}
    </div>
  );
}
