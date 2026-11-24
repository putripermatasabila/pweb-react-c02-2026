import { Briefcase, Plus } from 'lucide-react';

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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <div className="navbar-logo-icon">
              <Briefcase size={18} color="#fff" />
            </div>
            <span className="navbar-logo-text">Aku Mw Magang</span>
          </div>
          <div className="navbar-tabs">
            <button
              className={`navbar-tab ${activeTab === 'explore' ? 'navbar-tab-active' : ''}`}
              onClick={() => onTabChange('explore')}
            >
              Eksplorasi Lowongan
            </button>
            <button
              className={`navbar-tab ${activeTab === 'pipeline' ? 'navbar-tab-active' : ''}`}
              onClick={() => onTabChange('pipeline')}
            >
              Pipeline Lamaran ({applicationCount})
            </button>
          </div>
        </div>
        <div className="navbar-right">
          <button className="btn btn-add" onClick={onAddClick}>
            <Plus size={18} />
            Catat Lamaran
          </button>
        </div>
      </div>
    </nav>
  );
}
