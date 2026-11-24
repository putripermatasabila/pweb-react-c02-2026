import { Star, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
  applicationCount: number;
}

export function Navbar({
  activeTab,
  onTabChange,
  onAddClick,
  applicationCount,
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
              JOBS
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
          </nav>
        </div>

        <div className="glints-navbar-right">
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
