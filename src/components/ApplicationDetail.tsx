import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Trash2, X } from 'lucide-react';
import type { Application, ApplicationStatus, WorkMode } from '../types';
import { formatApplicationDateTime, getInterviewTimestamp } from '../utils/applicationPipeline';
import { canTransition, getValidNextStatuses } from '../utils/stateMachine';

type ApplicationTransition =
  | { status: 'APPLIED'; cvVersion: string; appliedDate: string }
  | { status: 'INTERVIEW'; interviewDateTime: string }
  | { status: 'OFFER'; salaryOffer: number; workMode: WorkMode }
  | { status: Exclude<ApplicationStatus, 'APPLIED' | 'INTERVIEW' | 'OFFER'> };

interface ApplicationDetailProps {
  application: Application;
  onUpdate: (update: (application: Application) => Application) => void;
  onClose: () => void;
  children?: ReactNode;
}

interface StatusFormProps {
  application: Application;
  onTransition: (transition: ApplicationTransition) => void;
}

const workModes: WorkMode[] = ['Remote', 'Hybrid', 'Onsite'];

function StatusForm({ application, onTransition }: StatusFormProps) {
  const [nextStatus, setNextStatus] = useState<ApplicationStatus | ''>('');
  const [cvVersion, setCvVersion] = useState(application.cvVersion ?? '');
  const [appliedDate, setAppliedDate] = useState(application.appliedDate ?? '');
  const [interviewDateTime, setInterviewDateTime] = useState(application.interviewDateTime ?? '');
  const [salary, setSalary] = useState(application.salaryOffer?.toString() ?? '');
  const [workMode, setWorkMode] = useState(application.workMode);
  const [error, setError] = useState('');
  const nextStatuses = getValidNextStatuses(application.status);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!nextStatus || !canTransition(application.status, nextStatus)) return;

    switch (nextStatus) {
      case 'APPLIED':
        if (!cvVersion.trim() || !Number.isFinite(Date.parse(appliedDate))) {
          setError('Isi versi CV dan tanggal melamar yang valid.');
          return;
        }
        onTransition({ status: nextStatus, cvVersion: cvVersion.trim(), appliedDate });
        break;
      case 'INTERVIEW':
        if (!Number.isFinite(Date.parse(interviewDateTime))) {
          setError('Isi jadwal interview yang valid.');
          return;
        }
        onTransition({ status: nextStatus, interviewDateTime });
        break;
      case 'OFFER': {
        const salaryOffer = Number(salary);
        if (!Number.isFinite(salaryOffer) || salaryOffer <= 0 || !workModes.includes(workMode)) {
          setError('Isi gaji lebih dari nol dan pilih mode kerja.');
          return;
        }
        onTransition({ status: nextStatus, salaryOffer, workMode });
        break;
      }
      default:
        onTransition({ status: nextStatus });
    }
  }

  if (nextStatuses.length === 0) {
    return <p className="application-detail-muted">Lamaran sudah mencapai status akhir.</p>;
  }

  return (
    <form className="application-status-form" onSubmit={handleSubmit}>
      <label className="form-group">
        <span className="form-label">Status tujuan</span>
        <select
          className="input"
          value={nextStatus}
          onChange={(event) => {
            setNextStatus(nextStatuses.find((status) => status === event.target.value) ?? '');
            setError('');
          }}
          required
        >
          <option value="">Pilih status</option>
          {nextStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      {nextStatus === 'APPLIED' && (
        <div className="form-row">
          <label className="form-group">
            <span className="form-label">Versi CV</span>
            <input className="input" value={cvVersion} onChange={(event) => setCvVersion(event.target.value)} required />
          </label>
          <label className="form-group">
            <span className="form-label">Tanggal melamar</span>
            <input className="input" type="date" value={appliedDate} onChange={(event) => setAppliedDate(event.target.value)} required />
          </label>
        </div>
      )}
      {nextStatus === 'INTERVIEW' && (
        <label className="form-group">
          <span className="form-label">Jadwal interview</span>
          <input className="input" type="datetime-local" value={interviewDateTime} onChange={(event) => setInterviewDateTime(event.target.value)} required />
        </label>
      )}
      {nextStatus === 'OFFER' && (
        <div className="form-row">
          <label className="form-group">
            <span className="form-label">Gaji atau uang saku (Rp)</span>
            <input className="input" type="number" min="0" step="any" value={salary} onChange={(event) => setSalary(event.target.value)} required />
          </label>
          <label className="form-group">
            <span className="form-label">Mode kerja</span>
            <select className="input" value={workMode} onChange={(event) => setWorkMode(event.target.value as WorkMode)} required>
              {workModes.map((mode) => <option key={mode}>{mode}</option>)}
            </select>
          </label>
        </div>
      )}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={!nextStatus}>Simpan status</button>
    </form>
  );
}

export function ApplicationDetail({ application, onUpdate, onClose, children }: ApplicationDetailProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [checklistText, setChecklistText] = useState('');
  const [note, setNote] = useState('');
  const { checklist, activityLogs } = application;
  const completed = checklist.filter((item) => item.done).length;
  const interviewTime = getInterviewTimestamp(application);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();
    return () => dialog.close();
  }, []);

  function handleTransition(transition: ApplicationTransition) {
    const timestamp = new Date().toISOString();
    const logId = crypto.randomUUID();

    onUpdate((current) => {
      if (!canTransition(current.status, transition.status)) return current;

      return {
        ...current,
        ...transition,
        lastUpdatedAt: timestamp,
        activityLogs: [...current.activityLogs, {
          id: logId,
          timestamp,
          message: `Status ${current.status} → ${transition.status}`,
        }],
      };
    });
  }

  function addChecklistItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = checklistText.trim();
    if (!text) return;

    const item = { id: crypto.randomUUID(), text, done: false };
    onUpdate((current) => ({ ...current, checklist: [...current.checklist, item] }));
    setChecklistText('');
  }

  function setChecklistItemDone(id: string, done: boolean) {
    onUpdate((current) => ({
      ...current,
      checklist: current.checklist.map((item) => item.id === id ? { ...item, done } : item),
    }));
  }

  function removeChecklistItem(id: string) {
    onUpdate((current) => ({
      ...current,
      checklist: current.checklist.filter((item) => item.id !== id),
    }));
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = note.trim();
    if (!message) return;

    const entry = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), message };
    onUpdate((current) => ({ ...current, activityLogs: [...current.activityLogs, entry] }));
    setNote('');
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal application-detail"
      aria-labelledby="application-detail-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="modal-header application-detail-header">
        <div>
          <h2 id="application-detail-title" className="modal-title">{application.role}</h2>
          <p className="application-detail-muted">
            {application.company} · {application.workMode}
            {application.cvVersion && <> · CV {application.cvVersion}</>}
            {interviewTime !== undefined && <> · Interview {formatApplicationDateTime(interviewTime)}</>}
          </p>
        </div>
        <span className={`status-badge status-${application.status.toLowerCase()}`}>{application.status}</span>
        <button type="button" onClick={onClose} className="modal-close" aria-label="Tutup detail lamaran">
          <X size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="application-detail-content">
        <div className="application-detail-column">
          <section className="application-detail-section" aria-labelledby="application-status-title">
            <h3 id="application-status-title">Tahap seleksi</h3>
            <StatusForm key={application.status} application={application} onTransition={handleTransition} />
          </section>
          <section className="application-detail-section" aria-labelledby="application-checklist-title">
            <div className="checklist-summary">
              <h3 id="application-checklist-title">Checklist persiapan</h3>
              <span>{completed}/{checklist.length} selesai</span>
            </div>
            <progress
              className="application-checklist-progress"
              aria-label="Progres checklist"
              max={Math.max(1, checklist.length)}
              value={completed}
            />
            {checklist.length > 0 && (
              <ul className="application-checklist">
                {checklist.map((item) => (
                  <li key={item.id} className="application-checklist-item">
                    <label className={item.done ? 'is-done' : undefined}>
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={(event) => setChecklistItemDone(item.id, event.target.checked)}
                      />
                      <span>{item.text}</span>
                    </label>
                    <button type="button" className="modal-close" aria-label={`Hapus checklist ${item.text}`} onClick={() => removeChecklistItem(item.id)}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <form className="application-checklist-form" onSubmit={addChecklistItem}>
              <input
                className="input"
                aria-label="Item checklist baru"
                placeholder="Tambah item persiapan"
                value={checklistText}
                onChange={(event) => setChecklistText(event.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!checklistText.trim()}>Tambah</button>
            </form>
          </section>
        </div>

        <div className="application-detail-column">
          {children}
          <section className="application-detail-section" aria-labelledby="application-activity-title">
            <h3 id="application-activity-title">Riwayat aktivitas</h3>
            {activityLogs.length === 0 ? (
              <p className="application-detail-muted">Belum ada aktivitas.</p>
            ) : (
              <ol className="application-activity-log">
                {[...activityLogs].reverse().map((entry) => (
                  <li key={entry.id}>
                    <time dateTime={entry.timestamp}>{formatApplicationDateTime(Date.parse(entry.timestamp))}</time>
                    <p>{entry.message}</p>
                  </li>
                ))}
              </ol>
            )}
            <form className="application-note-form" onSubmit={addNote}>
              <label className="form-group">
                <span className="form-label">Catatan Kapten</span>
                <textarea className="input" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
              <button type="submit" className="btn btn-primary" disabled={!note.trim()}>Simpan catatan</button>
            </form>
          </section>
        </div>
      </div>
    </dialog>
  );
}
