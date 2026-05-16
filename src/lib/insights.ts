import { supabase } from "@/integrations/supabase/client";

export type Insight = {
  id: string;
  end_year: number | null;
  intensity: number | null;
  sector: string | null;
  topic: string | null;
  insight: string | null;
  url: string | null;
  region: string | null;
  start_year: number | null;
  impact: string | null;
  added: string | null;
  published: string | null;
  country: string | null;
  relevance: number | null;
  pestle: string | null;
  source: string | null;
  title: string | null;
  likelihood: number | null;
  city: string | null;
  swot: string | null;
};

export async function fetchInsights(): Promise<Insight[]> {
  const { data, error } = await supabase.from("insights").select("*").limit(1000);
  if (error) throw error;
  return (data ?? []) as Insight[];
}

export type Filters = {
  end_year: string;
  topic: string;
  sector: string;
  region: string;
  pestle: string;
  source: string;
  swot: string;
  country: string;
  city: string;
};

export const EMPTY_FILTERS: Filters = {
  end_year: "all",
  topic: "all",
  sector: "all",
  region: "all",
  pestle: "all",
  source: "all",
  swot: "all",
  country: "all",
  city: "all",
};

export function applyFilters(rows: Insight[], f: Filters): Insight[] {
  return rows.filter((r) => {
    if (f.end_year !== "all" && String(r.end_year ?? "") !== f.end_year) return false;
    if (f.topic !== "all" && (r.topic ?? "") !== f.topic) return false;
    if (f.sector !== "all" && (r.sector ?? "") !== f.sector) return false;
    if (f.region !== "all" && (r.region ?? "") !== f.region) return false;
    if (f.pestle !== "all" && (r.pestle ?? "") !== f.pestle) return false;
    if (f.source !== "all" && (r.source ?? "") !== f.source) return false;
    if (f.swot !== "all" && (r.swot ?? "") !== f.swot) return false;
    if (f.country !== "all" && (r.country ?? "") !== f.country) return false;
    if (f.city !== "all" && (r.city ?? "") !== f.city) return false;
    return true;
  });
}

export function uniqueValues(rows: Insight[], key: keyof Insight): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    const v = r[key];
    if (v !== null && v !== undefined && v !== "") set.add(String(v));
  });
  return Array.from(set).sort();
}