import type { Application, WorkMode } from '../types';
import { calculateSkillMatch } from './skillMatch';

export const WORK_MODE_SCORES: Record<WorkMode, number> = {
  Remote: 100,
  Hybrid: 75,
  Onsite: 50,
};

export interface OfferEvaluation {
  application: Application;
  salary: number;
  salaryScore: number; // max 50
  workModeScore: number; // max 25
  rawWorkModeScore: number; // 100, 75, 50
  skillMatchPercent: number; // 0 - 100
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  skillScore: number; // max 25
  totalScore: number; // max 100
}

export interface ComparisonResult {
  offerA: OfferEvaluation;
  offerB: OfferEvaluation;
  recommended: 'A' | 'B' | 'TIE';
}

export function evaluateOffer(
  app: Application,
  maxSalary: number,
  kaptenSkills: string[]
): OfferEvaluation {
  const salary = app.salaryOffer ?? 0;
  const salaryScore = maxSalary > 0 ? (salary / maxSalary) * 50 : 0;

  const rawWorkModeScore = WORK_MODE_SCORES[app.workMode] ?? 50;
  const workModeScore = rawWorkModeScore * 0.25;

  const match = calculateSkillMatch(kaptenSkills, app.requiredSkills);
  const skillMatchPercent = match.score;
  const skillScore = (skillMatchPercent / 100) * 25;

  const totalScore = Math.round((salaryScore + workModeScore + skillScore) * 10) / 10;

  return {
    application: app,
    salary,
    salaryScore: Math.round(salaryScore * 10) / 10,
    workModeScore: Math.round(workModeScore * 10) / 10,
    rawWorkModeScore,
    skillMatchPercent,
    matchedSkillsCount: match.matched.length,
    totalRequiredSkills: app.requiredSkills.length,
    skillScore: Math.round(skillScore * 10) / 10,
    totalScore,
  };
}

export function compareOffers(
  appA: Application,
  appB: Application,
  kaptenSkills: string[]
): ComparisonResult {
  const salaryA = appA.salaryOffer ?? 0;
  const salaryB = appB.salaryOffer ?? 0;
  const maxSalary = Math.max(salaryA, salaryB, 1);

  const evalA = evaluateOffer(appA, maxSalary, kaptenSkills);
  const evalB = evaluateOffer(appB, maxSalary, kaptenSkills);

  let recommended: 'A' | 'B' | 'TIE' = 'TIE';
  if (evalA.totalScore > evalB.totalScore) {
    recommended = 'A';
  } else if (evalB.totalScore > evalA.totalScore) {
    recommended = 'B';
  }

  return {
    offerA: evalA,
    offerB: evalB,
    recommended,
  };
}
