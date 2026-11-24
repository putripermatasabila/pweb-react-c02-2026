import { useState, useRef, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import type { DataSource } from '../types';

interface SkillProfileProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
}

export function SkillProfile({
  skills,
  onSkillsChange,
  dataSource,
  onDataSourceChange,
}: SkillProfileProps) {
  const [newSkill, setNewSkill] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;

    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      inputRef.current?.focus();
      return;
    }

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
    <div className="skill-profile">
      <h3 className="skill-profile-title">Profil Skill Kapten</h3>
      <p className="skill-profile-desc">
        Digunakan untuk menghitung persentase kecocokan tiap lowongan.
      </p>

      <div className="skill-input-row">
        <input
          ref={inputRef}
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tambah skill..."
          className="input skill-input"
        />
        <button onClick={handleAddSkill} className="btn btn-primary btn-sm">
          <Plus size={15} />
          Tambah
        </button>
      </div>

      <div className="skill-tags">
        {skills.map((skill) => (
          <span key={skill} className="skill-tag skill-tag-user">
            {skill}
            <button
              onClick={() => handleRemoveSkill(skill)}
              className="skill-tag-remove"
              aria-label={`Hapus ${skill}`}
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>

      <div className="data-source">
        <h4 className="data-source-title">Sumber Data Lowongan</h4>
        <label className="radio-label">
          <input
            type="radio"
            name="dataSource"
            value="api"
            checked={dataSource === 'api'}
            onChange={() => onDataSourceChange('api')}
          />
          <span className="radio-text">Remotive API (Live)</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="dataSource"
            value="local"
            checked={dataSource === 'local'}
            onChange={() => onDataSourceChange('local')}
          />
          <span className="radio-text">Dataset Magang ID (Lokal)</span>
        </label>
      </div>
    </div>
  );
}
