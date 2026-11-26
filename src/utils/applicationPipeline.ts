import type { Application, ApplicationStatus } from '../types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function canSimulateGhosting(status: ApplicationStatus): boolean {
  return status === 'APPLIED' || status === 'SCREENING';
}

export function isAtRiskOfGhosting(application: Application, now: number): boolean {
  return (
    canSimulateGhosting(application.status) &&
    now - Date.parse(application.lastUpdatedAt) > 14 * DAY
  );
}

export function simulateGhosting(application: Application): Application {
  if (!canSimulateGhosting(application.status)) return application;

  const lastUpdated = Date.parse(application.lastUpdatedAt);
  if (!Number.isFinite(lastUpdated)) return application;

  return {
    ...application,
    lastUpdatedAt: new Date(lastUpdated - 15 * DAY).toISOString(),
  };
}

export function getInterviewTimestamp(application: Application): number | undefined {
  if (application.status !== 'INTERVIEW' || !application.interviewDateTime) {
    return undefined;
  }

  const timestamp = Date.parse(application.interviewDateTime);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function formatApplicationDateTime(timestamp: number): string {
  return dateTimeFormat.format(timestamp);
}

interface ScheduledInterview {
  application: Application;
  timestamp: number;
}

export function getInterviewConflicts(
  applications: readonly Application[]
): [ScheduledInterview, ScheduledInterview][] {
  const interviews = applications.flatMap((application) => {
    const timestamp = getInterviewTimestamp(application);
    return timestamp === undefined ? [] : [{ application, timestamp }];
  });
  interviews.sort((a, b) => a.timestamp - b.timestamp);

  const conflicts: [ScheduledInterview, ScheduledInterview][] = [];
  for (const [index, interview] of interviews.entries()) {
    for (let nextIndex = index + 1; nextIndex < interviews.length; nextIndex++) {
      const next = interviews[nextIndex];
      if (next.timestamp - interview.timestamp >= HOUR) break;
      conflicts.push([interview, next]);
    }
  }

  return conflicts;
}
