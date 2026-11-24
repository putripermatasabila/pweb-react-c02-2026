import { useState, useRef, type KeyboardEvent } from 'react';
import { Plus, X, ChevronUp } from 'lucide-react';
import type { DataSource } from '../types';

interface SkillProfileProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
  sortBy: 'match' | 'default';
  onSortChange: (sort: 'match' | 'default') => void;
}

export function SkillProfile({
  skills,
  onSkillsChange,
  dataSource,
  onDataSourceChange,
  sortBy,
  onSortChange,
}: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState('');
  const [skillError, setSkillError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) {
      setSkillError('Skill tidak boleh kosong');
      inputRef.current?.focus();
      return;
    }

    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setSkillError(`"${trimmed}" sudah ada di profil`);
      inputRef.current?.focus();
      return;
    }

    setSkillError('');
    onSkillsChange([...skills, trimmed]);
    setNewSkill('');
    inputRef.current?.focus();
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter((s) => s !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="glints-sidebar-card">
      <div className="glints-filter-section">
        <div className="glints-filter-header">
          <span>Prioritise By</span>
          <ChevronUp size={16} />
        </div>
        <div className="glints-prioritise-pills">
          <button
            type="button"
            className={`glints-choice-pill ${sortBy === 'match' ? 'is-selected' : ''}`}
            onClick={() => onSortChange('match')}
          >
            Match Tertinggi
          </button>
          <button
            type="button"
            className={`glints-choice-pill ${sortBy === 'default' ? 'is-selected' : ''}`}
            onClick={() => onSortChange('default')}
          >
            Recently Added
          </button>
        </div>
      </div>

      <div className="glints-filter-section">
        <div className="glints-filter-header">
          <span>Profil Skill Kapten</span>
          <ChevronUp size={16} />
        </div>
        <p className="glints-filter-desc">
          Digunakan untuk menghitung kecocokan tiap lowongan.
        </p>

        <div className="glints-skill-input-row">
          <input
            ref={inputRef}
            type="text"
            value={newSkill}
            onChange={(e) => {
              setNewSkill(e.target.value);
              if (skillError) setSkillError('');
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tambah skill..."
            className="glints-input-sm"
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="glints-btn-add-skill"
          >
            <Plus size={15} />
            Tambah
          </button>
        </div>

        {skillError && <p className="glints-skill-error">{skillError}</p>}

        <div className="glints-user-skills">
          {skills.map((skill) => (
            <span key={skill} className="glints-user-skill-tag">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="glints-user-skill-remove"
                aria-label={`Hapus ${skill}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="glints-filter-section glints-filter-last">
        <div className="glints-filter-header">
          <span>Sumber Data Lowongan</span>
          <ChevronUp size={16} />
        </div>
        <label className="glints-radio-item">
          <input
            type="radio"
            name="dataSource"
            value="api"
            checked={dataSource === 'api'}
            onChange={() => onDataSourceChange('api')}
          />
          <span>Remotive API (Live)</span>
        </label>
        <label className="glints-radio-item">
          <input
            type="radio"
            name="dataSource"
            value="local"
            checked={dataSource === 'local'}
            onChange={() => onDataSourceChange('local')}
          />
          <span>Dataset Magang ID (Lokal)</span>
        </label>
      </div>
    </div>
  );
}
