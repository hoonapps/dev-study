import { Question, Category, Difficulty } from "@/types/question";

import mysqlQuestions from "@/data/mysql.json";
import redisQuestions from "@/data/redis.json";
import kubernetesQuestions from "@/data/kubernetes.json";
import terraformQuestions from "@/data/terraform.json";
import nestjsQuestions from "@/data/nestjs.json";
import nodejsQuestions from "@/data/nodejs.json";
import networkQuestions from "@/data/network.json";
import architectureQuestions from "@/data/architecture.json";
import devopsQuestions from "@/data/devops.json";
import securityQuestions from "@/data/security.json";
import aiLlmQuestions from "@/data/ai-llm.json";
import gitQuestions from "@/data/git.json";
import awsQuestions from "@/data/aws.json";
import ncncQuestions from "@/data/ncnc.json";
import ncncInfraQuestions from "@/data/ncnc-infra.json";

const allQuestions: Question[] = [
  ...(mysqlQuestions as Question[]),
  ...(redisQuestions as Question[]),
  ...(kubernetesQuestions as Question[]),
  ...(terraformQuestions as Question[]),
  ...(nestjsQuestions as Question[]),
  ...(nodejsQuestions as Question[]),
  ...(networkQuestions as Question[]),
  ...(architectureQuestions as Question[]),
  ...(devopsQuestions as Question[]),
  ...(securityQuestions as Question[]),
  ...(aiLlmQuestions as Question[]),
  ...(gitQuestions as Question[]),
  ...(awsQuestions as Question[]),
  ...(ncncQuestions as Question[]),
  ...(ncncInfraQuestions as Question[]),
];

export function getAllQuestions(): Question[] {
  return allQuestions;
}

export function getQuestionsByCategory(category: Category): Question[] {
  return allQuestions.filter((q) => q.category === category);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return allQuestions.filter((q) => q.difficulty === difficulty);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function getFilteredQuestions(
  category?: Category,
  difficulty?: Difficulty
): Question[] {
  return allQuestions.filter((q) => {
    if (category && q.category !== category) return false;
    if (difficulty && q.difficulty !== difficulty) return false;
    return true;
  });
}

export function getRandomQuestions(count: number, category?: Category, difficulty?: Difficulty): Question[] {
  const pool = getFilteredQuestions(category, difficulty);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getDailyInsights(count: number = 3): Question[] {
  const today = new Date().toISOString().split("T")[0];
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);

  const shuffled = [...allQuestions].sort((a, b) => {
    const hashA = (seed * 31 + a.id.charCodeAt(0)) % 1000;
    const hashB = (seed * 31 + b.id.charCodeAt(0)) % 1000;
    return hashA - hashB;
  });

  return shuffled.slice(0, count);
}
