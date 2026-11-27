import { useState, useId } from 'react';
import { Trophy, Award, Sparkles, Scale, ArrowRight } from 'lucide-react';
import type { Application } from '../types';
import { compareOffers } from '../utils/offerComparator';

interface OfferComparatorProps {
  applications: Application[];
  kaptenSkills: string[];
  onGoToPipeline: () => void;
}

export function OfferComparator({
  applications,
  kaptenSkills,
  onGoToPipeline,
}: OfferComparatorProps) {
  const offerASelectId = useId();
  const offerBSelectId = useId();
  const offers = applications.filter((app) => app.status === 'OFFER');

  const [selectedAId, setSelectedAId] = useState<string>(() => offers[0]?.id ?? '');
  const [selectedBId, setSelectedBId] = useState<string>(() => offers[1]?.id ?? offers[0]?.id ?? '');

  // If there are fewer than 2 offers, show empty state
  if (offers.length < 2) {
    return (
      <main className="glints-main-container">
        <div className="state-container state-empty comparator-empty-state">
          <Scale size={48} className="comparator-empty-icon" aria-hidden="true" />
          <h2 className="comparator-empty-title">Belum Cukup Penawaran untuk Dibandingkan</h2>
          <p className="comparator-empty-desc">
            Fitur <strong>Offer Comparator</strong> memerlukan minimal <strong>2 tawaran</strong> dengan status{' '}
            <span className="status-badge status-offer">OFFER</span> untuk membandingkan gaji, mode kerja, dan kecocokan skill secara objektif.
          </p>
          <p className="comparator-empty-sub">
            Saat ini Kapten memiliki <strong>{offers.length}</strong> lamaran berstatus OFFER. Ubah status lamaran Anda di War Room Pipeline setelah menerima tawaran magang!
          </p>
          <button
            type="button"
            className="btn btn-primary comparator-empty-btn"
            onClick={onGoToPipeline}
          >
            Buka War Room Pipeline
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  }

  // Ensure valid selection
  const offerA = offers.find((o) => o.id === selectedAId) ?? offers[0];
  const offerB = offers.find((o) => o.id === selectedBId) ?? (offers[1] ?? offers[0]);

  const sameOffer = offerA.id === offerB.id;
  const comparison = compareOffers(offerA, offerB, kaptenSkills);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    });
  };

  return (
    <main className="glints-main-container comparator-page">
      <div className="comparator-header-bar">
        <div>
          <h2 className="comparator-main-title">Bandingkan Offer Magang</h2>
          <p className="comparator-weights-desc">
            Bobot penilaian: <span className="weight-tag">Uang Saku 50%</span> •{' '}
            <span className="weight-tag">Mode Kerja 25%</span> •{' '}
            <span className="weight-tag">Kecocokan Skill 25%</span>
          </p>
        </div>

        <div className="comparator-selectors">
          <div className="comparator-select-item">
            <label htmlFor={offerASelectId} className="comparator-select-label">Offer A:</label>
            <select
              id={offerASelectId}
              className="input comparator-select"
              value={offerA.id}
              onChange={(e) => setSelectedAId(e.target.value)}
            >
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.company} — {offer.role}
                </option>
              ))}
            </select>
          </div>

          <span className="comparator-vs-badge">VS</span>

          <div className="comparator-select-item">
            <label htmlFor={offerBSelectId} className="comparator-select-label">Offer B:</label>
            <select
              id={offerBSelectId}
              className="input comparator-select"
              value={offerB.id}
              onChange={(e) => setSelectedBId(e.target.value)}
            >
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.company} — {offer.role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sameOffer && (
        <div className="comparator-same-warning" role="alert">
          <Sparkles size={16} />
          <span>Kapten memilih lowongan yang sama untuk Offer A dan Offer B. Silakan pilih 2 lowongan berbeda untuk perbandingan objektif.</span>
        </div>
      )}

      <div className="comparator-grid">
        {/* Card Offer A */}
        <article className={`comparator-card ${comparison.recommended === 'A' && !sameOffer ? 'is-winner' : ''}`}>
          <div className="comparator-card-top">
            <div className="comparator-card-identity">
              <span className="comparator-role-tag">PILIHAN A</span>
              <h3 className="comparator-company-name">{offerA.company}</h3>
              <p className="comparator-role-name">{offerA.role}</p>
            </div>
            {comparison.recommended === 'A' && !sameOffer && (
              <span className="comparator-winner-badge">
                <Trophy size={14} />
                Rekomendasi Terbaik
              </span>
            )}
          </div>

          <div className="comparator-metrics-table">
            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Uang Saku / Bulan</span>
                <span className="metric-val">{formatCurrency(comparison.offerA.salary)}</span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerA.salaryScore.toFixed(1)}</span>
                <span className="score-denom">/ 50</span>
              </div>
            </div>

            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Mode Kerja</span>
                <span className="metric-val">
                  {offerA.workMode} ({comparison.offerA.rawWorkModeScore})
                </span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerA.workModeScore.toFixed(1)}</span>
                <span className="score-denom">/ 25</span>
              </div>
            </div>

            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Kecocokan Skill</span>
                <span className="metric-val">
                  {comparison.offerA.skillMatchPercent}% ({comparison.offerA.matchedSkillsCount} dari {comparison.offerA.totalRequiredSkills} skill)
                </span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerA.skillScore.toFixed(1)}</span>
                <span className="score-denom">/ 25</span>
              </div>
            </div>
          </div>

          <div className="comparator-card-footer">
            <span className="total-score-label">TOTAL SKOR BERBOBOT</span>
            <span className="total-score-value">{comparison.offerA.totalScore.toFixed(1)}</span>
          </div>
        </article>

        {/* Card Offer B */}
        <article className={`comparator-card ${comparison.recommended === 'B' && !sameOffer ? 'is-winner' : ''}`}>
          <div className="comparator-card-top">
            <div className="comparator-card-identity">
              <span className="comparator-role-tag">PILIHAN B</span>
              <h3 className="comparator-company-name">{offerB.company}</h3>
              <p className="comparator-role-name">{offerB.role}</p>
            </div>
            {comparison.recommended === 'B' && !sameOffer && (
              <span className="comparator-winner-badge">
                <Trophy size={14} />
                Rekomendasi Terbaik
              </span>
            )}
          </div>

          <div className="comparator-metrics-table">
            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Uang Saku / Bulan</span>
                <span className="metric-val">{formatCurrency(comparison.offerB.salary)}</span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerB.salaryScore.toFixed(1)}</span>
                <span className="score-denom">/ 50</span>
              </div>
            </div>

            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Mode Kerja</span>
                <span className="metric-val">
                  {offerB.workMode} ({comparison.offerB.rawWorkModeScore})
                </span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerB.workModeScore.toFixed(1)}</span>
                <span className="score-denom">/ 25</span>
              </div>
            </div>

            <div className="comparator-metric-row">
              <div className="metric-info">
                <span className="metric-label">Kecocokan Skill</span>
                <span className="metric-val">
                  {comparison.offerB.skillMatchPercent}% ({comparison.offerB.matchedSkillsCount} dari {comparison.offerB.totalRequiredSkills} skill)
                </span>
              </div>
              <div className="metric-score">
                <span className="score-num">{comparison.offerB.skillScore.toFixed(1)}</span>
                <span className="score-denom">/ 25</span>
              </div>
            </div>
          </div>

          <div className="comparator-card-footer">
            <span className="total-score-label">TOTAL SKOR BERBOBOT</span>
            <span className="total-score-value">{comparison.offerB.totalScore.toFixed(1)}</span>
          </div>
        </article>
      </div>

      <div className="comparator-explanation-box">
        <Award size={18} className="comparator-info-icon" />
        <div className="comparator-info-text">
          <strong>Bagaimana Skor Dihitung?</strong>
          <p>
            Perhitungan menggunakan bobot resmi: <strong>Gaji (50%)</strong> dinormalisasi terhadap tawaran tertinggi saat ini,{' '}
            <strong>Mode Kerja (25%)</strong> (Remote: 100, Hybrid: 75, Onsite: 50), dan{' '}
            <strong>Kecocokan Skill (25%)</strong> berdasarkan skill Profil Kapten saat ini.
          </p>
        </div>
      </div>
    </main>
  );
}
