import { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, AlertCircle, Database, Loader2 } from 'lucide-react';
import type { JobListing, DataSource } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { calculateSkillMatch } from '../utils/skillMatch';
import { fetchRemoteJobs, fetchFallbackJobs } from '../services/jobService';
import { JobCard } from './JobCard';

interface JobExplorerProps {
  kaptenSkills: string[];
  dataSource: DataSource;
  onDataSourceChange: (source: DataSource) => void;
  onSaveToWishlist: (job: JobListing) => void;
  isAlreadyApplied: (company: string, role: string) => boolean;
}

export function JobExplorer({
  kaptenSkills,
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

  const debouncedSearch = useDebounce(searchKeyword, 400);

  useEffect(() => {
    const controller = new AbortController();

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let fetchedJobs: JobListing[];
        if (dataSource === 'api') {
          fetchedJobs = await fetchRemoteJobs(controller.signal);
        } else {
          fetchedJobs = await fetchFallbackJobs();
        }
        setJobs(fetchedJobs);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(
          err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data'
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
        setError(
          err instanceof Error ? err.message : 'Terjadi kesalahan'
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  };

  const handleFallback = () => {
    onDataSourceChange('local');
  };

  return (
    <div className="job-explorer">
      <div className="search-filter-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Cari posisi atau perusahaan..."
            className="input search-input"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input select-filter"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'match' | 'default')}
          className="input select-filter"
        >
          <option value="match">Match Tertinggi</option>
          <option value="default">Default</option>
        </select>
      </div>

      {isLoading && (
        <div className="state-container state-loading">
          <Loader2 size={40} className="spinner" />
          <p>Memuat lowongan...</p>
        </div>
      )}

      {error && (
        <div className="state-container state-error">
          <AlertCircle size={40} />
          <h3>Gagal Memuat Data</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={handleRetry} className="btn btn-primary">
              <RefreshCw size={16} />
              Coba Lagi
            </button>
            {dataSource === 'api' && (
              <button onClick={handleFallback} className="btn btn-outline">
                <Database size={16} />
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
        <>
          <p className="result-count">
            Menampilkan {filteredJobs.length} lowongan
            {dataSource === 'local' && (
              <span className="source-badge">
                <Database size={13} /> Data Lokal
              </span>
            )}
          </p>
          <div className="job-grid">
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
                  isApplied={isAlreadyApplied(
                    job.company_name,
                    job.title
                  )}
                  onSave={() => onSaveToWishlist(job)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
