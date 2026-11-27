import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  RefreshCw,
  AlertCircle,
  Database,
  Loader2,
  Briefcase,
} from 'lucide-react';
import type { JobListing, DataSource } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { calculateSkillMatch } from '../utils/skillMatch';
import { fetchRemoteJobs, fetchFallbackJobs } from '../services/jobService';
import { SkillProfile } from './SkillProfile';
import { JobCard } from './JobCard';

interface JobExplorerProps {
  kaptenSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
  onSaveToWishlist: (job: JobListing) => void;
  isAlreadyApplied: (company: string, role: string) => boolean;
}

const POPULAR_KEYWORDS = ['React', 'TypeScript', 'Python', 'Docker', 'Node.js'];

export function JobExplorer({
  kaptenSkills,
  onSkillsChange,
  dataSource,
  onDataSourceChange,
  onSaveToWishlist,
  isAlreadyApplied,
}: JobExplorerProps) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'match' | 'default'>('match');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const debouncedSearch = useDebounce(searchKeyword, 400);

  useEffect(() => {
    const controller = new AbortController();

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fetchedJobs =
          dataSource === 'api'
            ? await fetchRemoteJobs(controller.signal)
            : await fetchFallbackJobs();
        setJobs(fetchedJobs);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat memuat data'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJobs();

    return () => controller.abort();
  }, [dataSource]);

  const categories = useMemo(() => {
    const cats = new Set(jobs.map((j) => j.category));
    return Array.from(cats).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(keyword) ||
          job.company_name.toLowerCase().includes(keyword) ||
          job.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    if (categoryFilter) {
      result = result.filter((job) => job.category === categoryFilter);
    }

    if (sortBy === 'match') {
      result = [...result].sort((a, b) => {
        const matchA = calculateSkillMatch(kaptenSkills, a.tags).score;
        const matchB = calculateSkillMatch(kaptenSkills, b.tags).score;
        return matchB - matchA;
      });
    }

    return result;
  }, [jobs, debouncedSearch, categoryFilter, sortBy, kaptenSkills]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    const loadJobs = async () => {
      try {
        const fetchedJobs =
          dataSource === 'api'
            ? await fetchRemoteJobs()
            : await fetchFallbackJobs();
        setJobs(fetchedJobs);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  };

  return (
    <div className="glints-explore-page">
      {/* Hero Banner & Unified Search Bar ala Glints */}
      <section className="glints-hero">
        <div className="glints-hero-inner">
          <div className="glints-breadcrumb">
            <span>Jobs</span>
            <span>/</span>
            <span>Internship</span>
            <span>/</span>
            <span className="is-current">Software Development</span>
          </div>

          <h1 className="glints-hero-title">
            Temukan Lowongan Magang Tech Terbaik
          </h1>

          <form
            className="glints-search-bar"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="glints-search-field">
              <Search size={18} className="glints-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search by Title, Skill or Company (tekan /)"
                className="glints-search-input"
              />
            </div>

            <div className="glints-search-divider" />

            <div className="glints-category-field">
              <Briefcase size={16} className="glints-search-icon" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="glints-category-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="glints-search-btn">
              SEARCH
            </button>
          </form>

          <div className="glints-popular-row">
            <span className="glints-popular-label">Popular:</span>
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                className={`glints-popular-chip ${
                  searchKeyword.toLowerCase() === kw.toLowerCase()
                    ? 'is-active'
                    : ''
                }`}
                onClick={() =>
                  setSearchKeyword(
                    searchKeyword.toLowerCase() === kw.toLowerCase() ? '' : kw
                  )
                }
              >
                {kw}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content 2 Kolom ala Glints */}
      <div className="glints-main-container">
        <div className="glints-layout-grid">
          <aside className="glints-sidebar">
            <SkillProfile
              skills={kaptenSkills}
              onSkillsChange={onSkillsChange}
              dataSource={dataSource}
              onDataSourceChange={onDataSourceChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </aside>

          <section className="glints-results-section">
            <div className="glints-results-header">
              <h2 className="glints-results-heading">
                Software Development Internship Jobs
              </h2>
              {!isLoading && !error && (
                <div className="glints-results-meta">
                  <span>Menampilkan {filteredJobs.length} lowongan</span>
                  {dataSource === 'local' && (
                    <span className="glints-source-badge">
                      <Database size={12} /> Dataset Lokal
                    </span>
                  )}
                </div>
              )}
            </div>

            {isLoading && (
              <div className="state-container state-loading">
                <Loader2 size={40} className="spinner" />
                <p>Memuat lowongan magang...</p>
              </div>
            )}

            {error && (
              <div className="state-container state-error">
                <AlertCircle size={40} />
                <h3>Gagal Memuat Data</h3>
                <p>{error}</p>
                <div className="error-actions">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="glints-btn-solid"
                  >
                    <RefreshCw size={15} />
                    Coba Lagi
                  </button>
                  {dataSource === 'api' && (
                    <button
                      type="button"
                      onClick={() => onDataSourceChange('local')}
                      className="glints-btn-outline"
                    >
                      <Database size={15} />
                      Gunakan Fallback Lokal
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLoading && !error && filteredJobs.length === 0 && (
              <div className="state-container state-empty">
                <Search size={40} />
                <h3>Tidak Ada Lowongan</h3>
                <p>
                  {debouncedSearch
                    ? `Tidak ditemukan lowongan untuk "${debouncedSearch}"`
                    : 'Belum ada lowongan yang tersedia.'}
                </p>
              </div>
            )}

            {!isLoading && !error && filteredJobs.length > 0 && (
              <div className="glints-jobs-grid">
                {filteredJobs.map((job) => {
                  const matchResult = calculateSkillMatch(
                    kaptenSkills,
                    job.tags
                  );
                  return (
                    <JobCard
                      key={job.id}
                      companyName={job.company_name}
                      location={job.candidate_required_location}
                      title={job.title}
                      salary={job.salary}
                      tags={job.tags}
                      matchResult={matchResult}
                      isApplied={isAlreadyApplied(job.company_name, job.title)}
                      onSave={() => onSaveToWishlist(job)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
