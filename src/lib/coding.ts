import { CodingProblem } from "@/types/coding";

import codingMain from "@/data/coding.json";
import codingRealtest from "@/data/coding-realtest.json";
import codingLive from "@/data/coding-live.json";
import codingSql from "@/data/coding-sql.json";
import codingSim from "@/data/coding-simulation.json";

const allProblems: CodingProblem[] = [
  ...(codingMain as CodingProblem[]),
  ...(codingRealtest as CodingProblem[]),
  ...(codingLive as CodingProblem[]),
  ...(codingSql as CodingProblem[]),
  ...(codingSim as CodingProblem[]),
];

export function getAllCodingProblems(): CodingProblem[] {
  return allProblems;
}

export function getCodingProblem(id: string): CodingProblem | undefined {
  return allProblems.find((p) => p.id === id);
}

export function getCodingByPattern(pattern: string): CodingProblem[] {
  return allProblems.filter((p) => p.patterns.includes(pattern));
}

export function getCodingByCompany(company: string): CodingProblem[] {
  return allProblems.filter((p) => p.companies.includes(company));
}

export function getAllPatterns(): string[] {
  const set = new Set<string>();
  for (const p of allProblems) p.patterns.forEach((pt) => set.add(pt));
  return Array.from(set).sort();
}

export function getAllCompanies(): string[] {
  const set = new Set<string>();
  for (const p of allProblems) p.companies.forEach((c) => set.add(c));
  return Array.from(set).sort();
}

// 오늘의 코테 (랜덤 1개)
export function getDailyCodingProblem(): CodingProblem | undefined {
  if (allProblems.length === 0) return undefined;
  const today = new Date().toISOString().split("T")[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  return allProblems[seed % allProblems.length];
}
