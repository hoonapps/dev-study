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
import monitoringQuestions from "@/data/monitoring.json";
import argocdQuestions from "@/data/argocd.json";
import opensearchQuestions from "@/data/opensearch.json";
import algorithmQuestions from "@/data/algorithm.json";
import designPatternQuestions from "@/data/design-pattern.json";
import javaQuestions from "@/data/java.json";
import springQuestions from "@/data/spring.json";
import kotlinQuestions from "@/data/kotlin.json";
import seniorInterviewQuestions from "@/data/senior-interview.json";
import systemDesignQuestions from "@/data/system-design.json";
import javaBasicsQuestions from "@/data/java-basics.json";
import javaCotestQuestions from "@/data/java-cotest.json";

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
  ...(monitoringQuestions as Question[]),
  ...(argocdQuestions as Question[]),
  ...(opensearchQuestions as Question[]),
  ...(algorithmQuestions as Question[]),
  ...(designPatternQuestions as Question[]),
  ...(javaQuestions as Question[]),
  ...(springQuestions as Question[]),
  ...(kotlinQuestions as Question[]),
  ...(seniorInterviewQuestions as Question[]),
  ...(systemDesignQuestions as Question[]),
  ...(javaBasicsQuestions as Question[]),
  ...(javaCotestQuestions as Question[]),
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
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
