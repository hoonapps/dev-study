import { getAllCodingProblems } from "@/lib/coding";
import CodingDetailClient from "./CodingDetailClient";

export function generateStaticParams() {
  return getAllCodingProblems().map((p) => ({ id: p.id }));
}

export default async function CodingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CodingDetailClient id={id} />;
}
