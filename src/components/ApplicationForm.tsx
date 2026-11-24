import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Application, WorkMode } from '../types';

interface ApplicationFormProps {
  onSubmit: (app: Application) => void;
  onClose: () => void;
  applications: Application[];
}

export function ApplicationForm({
  onSubmit,
  onClose,
  applications,
}: ApplicationFormProps) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Onsite');
  const [initialStatus, setInitialStatus] = useState<'WISHLIST' | 'APPLIED'>(
    'WISHLIST'
  );
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [cvVersion, setCvVersion] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const companyRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const skillsRef = useRef<HTMLInputElement>(null);
  const cvRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!company.trim()) {
      newErrors.company = 'Nama perusahaan wajib diisi';
    }
    if (!role.trim()) {
      newErrors.role = 'Posisi/Role wajib diisi';
    }
    if (!requiredSkillsInput.trim()) {
      newErrors.skills = 'Required skills wajib diisi';
    }

    if (initialStatus === 'APPLIED') {
      if (!cvVersion.trim()) {
        newErrors.cv = 'Versi CV wajib diisi untuk status Applied';
      }
      if (!appliedDate) {
        newErrors.date = 'Tanggal melamar wajib diisi untuk status Applied';
      }
    }

    const isDuplicate = applications.some(
      (app) =>
        app.company.toLowerCase() === company.trim().toLowerCase() &&
        app.role.toLowerCase() === role.trim().toLowerCase()
    );
    if (isDuplicate && !newErrors.company) {
      newErrors.company =
        'Lamaran untuk perusahaan dan posisi ini sudah ada';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (newErrors.company) companyRef.current?.focus();
      else if (newErrors.role) roleRef.current?.focus();
      else if (newErrors.skills) skillsRef.current?.focus();
      else if (newErrors.cv) cvRef.current?.focus();
      else if (newErrors.date) dateRef.current?.focus();
      return;
    }

    const skills = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const now = new Date().toISOString();

    const newApp: Application = {
      id: crypto.randomUUID(),
      company: company.trim(),
      role: role.trim(),
      workMode,
      status: initialStatus,
      requiredSkills: skills,
      cvVersion: initialStatus === 'APPLIED' ? cvVersion.trim() : undefined,
      appliedDate: initialStatus === 'APPLIED' ? appliedDate : undefined,
      lastUpdatedAt: now,
      checklist: [],
      activityLogs: [
        {
          id: crypto.randomUUID(),
          timestamp: now,
          message:
            initialStatus === 'APPLIED'
              ? `Lamaran dikirim (CV: ${cvVersion.trim()})`
              : 'Lamaran dibuat manual ke Wishlist',
        },
      ],
    };

    onSubmit(newApp);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Catat Lamaran Baru</h2>
          <button onClick={onClose} className="modal-close" aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className={`form-group ${errors.company ? 'form-group-error' : ''}`}>
            <label className="form-label" htmlFor="company">
              Perusahaan <span className="required">*</span>
            </label>
            <input
              ref={companyRef}
              id="company"
              type="text"
              value={company}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setCompany(e.target.value)
              }
              placeholder="Contoh: Tokopedia"
              className="input"
            />
            {errors.company && (
              <span className="form-error">
                <AlertTriangle size={13} /> {errors.company}
              </span>
            )}
          </div>

          <div className={`form-group ${errors.role ? 'form-group-error' : ''}`}>
            <label className="form-label" htmlFor="role">
              Posisi / Role <span className="required">*</span>
            </label>
            <input
              ref={roleRef}
              id="role"
              type="text"
              value={role}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRole(e.target.value)
              }
              placeholder="Contoh: Frontend Developer Intern"
              className="input"
            />
            {errors.role && (
              <span className="form-error">
                <AlertTriangle size={13} /> {errors.role}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="workMode">
                Mode Kerja
              </label>
              <select
                id="workMode"
                value={workMode}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setWorkMode(e.target.value as WorkMode)
                }
                className="input"
              >
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="initialStatus">
                Status Awal
              </label>
              <select
                id="initialStatus"
                value={initialStatus}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setInitialStatus(e.target.value as 'WISHLIST' | 'APPLIED')
                }
                className="input"
              >
                <option value="WISHLIST">Wishlist</option>
                <option value="APPLIED">Applied</option>
              </select>
            </div>
          </div>

          <div
            className={`form-group ${errors.skills ? 'form-group-error' : ''}`}
          >
            <label className="form-label" htmlFor="skills">
              Required Skills <span className="required">*</span>
            </label>
            <input
              ref={skillsRef}
              id="skills"
              type="text"
              value={requiredSkillsInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRequiredSkillsInput(e.target.value)
              }
              placeholder="Pisahkan dengan koma, misal: React, TypeScript, CSS"
              className="input"
            />
            {errors.skills && (
              <span className="form-error">
                <AlertTriangle size={13} /> {errors.skills}
              </span>
            )}
          </div>

          {initialStatus === 'APPLIED' && (
            <div className="applied-fields">
              <div className="applied-fields-header">
                <AlertTriangle size={15} />
                <span>Field tambahan untuk status Applied</span>
              </div>
              <div className="form-row">
                <div
                  className={`form-group ${errors.cv ? 'form-group-error' : ''}`}
                >
                  <label className="form-label" htmlFor="cvVersion">
                    Versi CV <span className="required">*</span>
                  </label>
                  <input
                    ref={cvRef}
                    id="cvVersion"
                    type="text"
                    value={cvVersion}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setCvVersion(e.target.value)
                    }
                    placeholder="Contoh: Kapten-CV-v2.pdf"
                    className="input"
                  />
                  {errors.cv && (
                    <span className="form-error">
                      <AlertTriangle size={13} /> {errors.cv}
                    </span>
                  )}
                </div>

                <div
                  className={`form-group ${errors.date ? 'form-group-error' : ''}`}
                >
                  <label className="form-label" htmlFor="appliedDate">
                    Tanggal Melamar <span className="required">*</span>
                  </label>
                  <input
                    ref={dateRef}
                    id="appliedDate"
                    type="date"
                    value={appliedDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setAppliedDate(e.target.value)
                    }
                    className="input"
                  />
                  {errors.date && (
                    <span className="form-error">
                      <AlertTriangle size={13} /> {errors.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan Lamaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
