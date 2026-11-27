import { RotateCcw, X } from 'lucide-react';
import type { Application } from '../types';

interface UndoToastProps {
  deletedApp: Application;
  countdown: number;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({
  deletedApp,
  countdown,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  return (
    <aside className="undo-toast" role="status" aria-live="polite">
      <div className="undo-toast-message">
        Lamaran <strong>{deletedApp.company}</strong> ({deletedApp.role}) telah dihapus.
      </div>
      <div className="undo-toast-actions">
        <button
          type="button"
          className="undo-toast-btn"
          onClick={onUndo}
        >
          <RotateCcw size={14} aria-hidden="true" />
          Undo ({countdown}d)
        </button>
        <button
          type="button"
          className="undo-toast-close"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
