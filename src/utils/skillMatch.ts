import type { SkillMatchResult } from '../types';

export function calculateSkillMatch(
  userSkills: string[],
  requiredSkills: string[]
): SkillMatchResult {
  if (requiredSkills.length === 0) {
    return { score: 0, matched: [], missing: [] };
  }

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of requiredSkills) {
    if (userSkillsLower.includes(skill.toLowerCase())) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = Math.round((matched.length / requiredSkills.length) * 100);

  return { score, matched, missing };
}

export function getMatchColor(score: number): string {
  if (score >= 70) return 'match-high';
  if (score >= 40) return 'match-medium';
  return 'match-low';
}

export function getMatchDot(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}
