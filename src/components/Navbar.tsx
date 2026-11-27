import { Star, Plus, Download, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  applicationCount: number;
  offerCount: number;
  onExportData: () => void;
  onImportData: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  onAddClick,
  applicationCount,
  offerCount,
  onExportData,
  onImportData,
}: NavbarProps) {
  return (
    <header className="glints-navbar">
      <div className="glints-navbar-inner">
        <div className="glints-navbar-left">
          <button
            type="button"
            className="glints-brand"
            onClick={() => onTabChange('explore')}
          >
            <span className="glints-brand-star">
              <Star size={20} fill="#facc15" color="#f59e0b" />
            </span>
            <span className="glints-brand-text">
              <span className="glints-brand-name">akumwmagang</span>
              <span className="glints-brand-sub">Career Tracker</span>
            </span>
          </button>

          <nav className="glints-nav-links">
            <button
              type="button"
              className={`glints-nav-link ${
                activeTab === 'explore' ? 'is-active' : ''
              }`}
              onClick={() => onTabChange('explore')}
            >
              EKSPLORASI LOWONGAN
            </button>
            <button
              type="button"
              className={`glints-nav-link ${
                activeTab === 'pipeline' ? 'is-active' : ''
              }`}
              onClick={() => onTabChange('pipeline')}
            >
              PIPELINE LAMARAN ({applicationCount})
            </button>
            <button
              type="button"
              className={`glints-nav-link ${
                activeTab === 'compare' ? 'is-active' : ''
              }`}
              onClick={() => onTabChange('compare')}
            >
              BANDINGKAN OFFER ({offerCount})
            </button>
          </nav>
        </div>

        <div className="glints-navbar-right">
          <button
            type="button"
            className="glints-btn-outline"
            onClick={onExportData}
            title="Ekspor backup data ke format JSON"
          >
            <Download size={14} />
            EKSPOR
          </button>
          <label
            className="glints-btn-outline"
            style={{ cursor: 'pointer', margin: 0 }}
            title="Impor backup data dari format JSON"
          >
            <Upload size={14} />
            IMPOR
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={onImportData}
            />
          </label>
          <button
            type="button"
            className="glints-btn-solid"
            onClick={onAddClick}
          >
            <Plus size={16} />
            CATAT LAMARAN
          </button>
        </div>
      </div>
    </header>
  );
}
