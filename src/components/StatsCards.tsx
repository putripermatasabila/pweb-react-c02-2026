import { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Users,
  Ghost,
  Trophy,
} from 'lucide-react';
import type { Application } from '../types';

interface StatsCardsProps {
  applications: Application[];
}

export function StatsCards({ applications }: StatsCardsProps) {
  const [now] = useState(() => Date.now());
  const total = applications.length;

  const responded = applications.filter(
    (a) => a.status !== 'WISHLIST'
  ).length;
  const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

  const interviewed = applications.filter(
    (a) =>
      a.status === 'INTERVIEW' ||
      a.status === 'OFFER'
  ).length;
  const interviewRate =
    responded > 0 ? Math.round((interviewed / responded) * 100) : 0;

  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  const ghostingCount = applications.filter(
    (a) =>
      (a.status === 'APPLIED' || a.status === 'SCREENING') &&
      now - new Date(a.lastUpdatedAt).getTime() > fourteenDays
  ).length;

  const offerCount = applications.filter(
    (a) => a.status === 'OFFER'
  ).length;

  const stats = [
    {
      label: 'TOTAL LAMARAN',
      value: total.toString(),
      sub: `${applications.filter((a) => a.status !== 'OFFER' && a.status !== 'REJECTED').length} aktif di pipeline`,
      icon: FileText,
      color: '#0f172a',
    },
    {
      label: 'RESPONSE RATE',
      value: `${responseRate}%`,
      sub: `${responded} dari ${total} diproses`,
      icon: TrendingUp,
      color: '#2563eb',
    },
    {
      label: 'INTERVIEW RATE',
      value: `${interviewRate}%`,
      sub: `${interviewed} masuk wawancara`,
      icon: Users,
      color: '#7c3aed',
    },
    {
      label: 'RAWAN GHOSTING',
      value: ghostingCount.toString(),
      sub: '>14 hari tanpa kabar',
      icon: Ghost,
      color: '#f59e0b',
    },
    {
      label: 'OFFER DITERIMA',
      value: offerCount.toString(),
      sub: 'Siap dibandingkan',
      icon: Trophy,
      color: '#16a34a',
    },
  ];

  return (
    <div className="stats-row">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">{stat.label}</span>
            <stat.icon size={18} color={stat.color} />
          </div>
          <span className="stat-value" style={{ color: stat.color }}>
            {stat.value}
          </span>
          <span className="stat-sub">{stat.sub}</span>
        </div>
      ))}
    </div>
  );
}
