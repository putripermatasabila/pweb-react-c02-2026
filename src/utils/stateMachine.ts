import type { ApplicationStatus } from '../types';

const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  WISHLIST: ['APPLIED', 'REJECTED'],
  APPLIED: ['SCREENING', 'INTERVIEW', 'REJECTED', 'GHOSTED'],
  SCREENING: ['INTERVIEW', 'REJECTED', 'GHOSTED'],
  INTERVIEW: ['OFFER', 'REJECTED', 'GHOSTED'],
  OFFER: [],
  REJECTED: [],
  GHOSTED: ['SCREENING'],
};

export const applicationStatuses = Object.keys(validTransitions) as ApplicationStatus[];

export function getValidNextStatuses(
  current: ApplicationStatus
): ApplicationStatus[] {
  return validTransitions[current];
}

export function canTransition(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  return validTransitions[from].includes(to);
}
