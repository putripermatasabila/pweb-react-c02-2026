import type { JobListing, RemotiveResponse } from '../types';

export async function fetchRemoteJobs(
  signal?: AbortSignal
): Promise<JobListing[]> {
  const res = await fetch(
    'https://remotive.com/api/remote-jobs?category=software-dev&limit=30',
    { signal }
  );

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const data: RemotiveResponse = await res.json();
  return data.jobs;
}

export async function fetchFallbackJobs(): Promise<JobListing[]> {
  const res = await fetch('/magang-fallback.json');

  if (!res.ok) {
    throw new Error('Gagal memuat data fallback');
  }

  const data: RemotiveResponse = await res.json();
  return data.jobs;
}
