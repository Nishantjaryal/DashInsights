import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as d3 from "d3";
import { Activity, Globe2, Sparkles, TrendingUp } from "lucide-react";
import { fetchInsights, applyFilters, EMPTY_FILTERS, type Filters, type Insight } from "@/lib/insights";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { BubbleChart } from "@/components/dashboard/BubbleChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { RadialBars } from "@/components/dashboard/RadialBars";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "dashinsights — Strategic Data Visualization Dashboard" },
      {
        name: "description",
        content:
          "Interactive D3.js dashboard exploring intensity, likelihood, relevance and reach across topics, sectors, regions and countries.",
      },
    ],
  }),
});

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

function topAggregate(
  rows: Insight[],
  key: keyof Insight,
  metric: keyof Insight,
  limit = 8,
): { label: string; value: number }[] {
  const groups = d3.rollup(
    rows.filter((r) => r[key] && r[metric] != null),
    (v) => d3.mean(v, (d) => Number(d[metric])) ?? 0,
    (d) => String(d[key]),
  );
  return Array.from(groups, ([label, value]) => ({ label, value: Math.round(value * 10) / 10 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function countAggregate(
  rows: Insight[],
  key: keyof Insight,
  limit = 8,
): { label: string; value: number }[] {
  const groups = d3.rollup(
    rows.filter((r) => r[key]),
    (v) => v.length,
    (d) => String(d[key]),
  );
  return Array.from(groups, ([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function Kpi({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">
            {label}
          </p>
          <p className="text-3xl font-semibold mt-2 tabular-nums text-foreground">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
      <div
        className="absolute -bottom-12 -right-12 size-32 rounded-full opacity-20 blur-2xl"
        style={{ background: "var(--gradient-hero)" }}
      />
    </div>
  );
}

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["insights"],
    queryFn: fetchInsights,
  });
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const all = data ?? [];
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  const intensities = filtered.map((r) => r.intensity).filter((v): v is number => v != null);
  const likelihoods = filtered.map((r) => r.likelihood).filter((v): v is number => v != null);
  const relevances = filtered.map((r) => r.relevance).filter((v): v is number => v != null);

  const bubbleData = useMemo(
    () =>
      filtered
        .filter((r) => r.likelihood != null && r.relevance != null && r.intensity != null)
        .map((r) => ({
          x: r.likelihood as number,
          y: r.relevance as number,
          r: r.intensity as number,
          label: r.title ?? r.insight ?? "Untitled",
          group: r.sector ?? r.pestle ?? "Other",
        })),
    [filtered],
  );

  const sectorData = useMemo(() => topAggregate(filtered, "sector", "intensity", 8), [filtered]);
  const topicData = useMemo(() => countAggregate(filtered, "topic", 8), [filtered]);
  const regionData = useMemo(() => topAggregate(filtered, "region", "likelihood", 8), [filtered]);
  const countryData = useMemo(() => topAggregate(filtered, "country", "intensity", 8), [filtered]);
  const pestleData = useMemo(() => countAggregate(filtered, "pestle", 8), [filtered]);
  const sourceData = useMemo(() => countAggregate(filtered, "source", 8), [filtered]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="absolute inset-x-0 top-0 h-[420px] -z-0 opacity-30 blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
      />
      <main className="relative max-w-[1600px] mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
              Strategic{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-hero)" }}
              >
                signal &amp; foresight
              </span>{" "}
              dashboard
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Live data streamed from your dashinsights Cloud database. Slice by topic, sector, region or
              country to surface what matters.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Records loaded</p>
            <p className="text-3xl font-semibold tabular-nums">
              {isLoading ? "…" : filtered.length}
              <span className="text-muted-foreground text-base"> / {all.length}</span>
            </p>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 mb-6 text-sm">
            Failed to load data: {(error as Error).message}
          </div>
        )}

        <FilterBar rows={all} filters={filters} onChange={setFilters} />

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <Kpi
            label="Avg Intensity"
            value={avg(intensities)}
            icon={Activity}
            hint={`${intensities.length} measured`}
          />
          <Kpi
            label="Avg Likelihood"
            value={avg(likelihoods)}
            icon={TrendingUp}
            hint={`${likelihoods.length} measured`}
          />
          <Kpi
            label="Avg Relevance"
            value={avg(relevances)}
            icon={Sparkles}
            hint={`${relevances.length} measured`}
          />
          <Kpi
            label="Countries Covered"
            value={new Set(filtered.map((r) => r.country).filter(Boolean)).size}
            icon={Globe2}
            hint={`${new Set(filtered.map((r) => r.region).filter(Boolean)).size} regions`}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <ChartCard
            title="Likelihood × Relevance × Intensity"
            subtitle="Each bubble is one insight — size encodes intensity, colour by sector"
            className="lg:col-span-2 h-[420px]"
          >
            <BubbleChart data={bubbleData} />
          </ChartCard>
          <ChartCard title="PEST Distribution" subtitle="Share of insights by category" className="h-[420px]">
            <DonutChart data={pestleData} />
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <ChartCard
            title="Top Sectors by Avg Intensity"
            subtitle="Where market signals are strongest"
            className="h-[340px]"
          >
            <BarChart data={sectorData} horizontal color="var(--chart-1)" />
          </ChartCard>
          <ChartCard
            title="Top Countries by Avg Intensity"
            subtitle="Geographic concentration of impact"
            className="h-[340px]"
          >
            <BarChart data={countryData} horizontal color="var(--chart-2)" />
          </ChartCard>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <ChartCard title="Topics" subtitle="Volume of insights" className="h-[340px]">
            <BarChart data={topicData} color="var(--chart-3)" />
          </ChartCard>
          <ChartCard
            title="Regions"
            subtitle="Avg likelihood per region"
            className="h-[340px]"
          >
            <RadialBars data={regionData} />
          </ChartCard>
          <ChartCard title="Sources" subtitle="Where the signals come from" className="h-[340px]">
            <BarChart data={sourceData} horizontal color="var(--chart-4)" />
          </ChartCard>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Latest Insights</h3>
              <p className="text-xs text-muted-foreground">
                {filtered.length} record{filtered.length === 1 ? "" : "s"} matching filters
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Title</th>
                  <th className="text-left font-medium px-4 py-3">Sector</th>
                  <th className="text-left font-medium px-4 py-3">Region</th>
                  <th className="text-left font-medium px-4 py-3">Country</th>
                  <th className="text-right font-medium px-4 py-3">Int.</th>
                  <th className="text-right font-medium px-4 py-3">Lik.</th>
                  <th className="text-right font-medium px-4 py-3">Rel.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 25).map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 max-w-[460px]">
                      <a
                        href={r.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-primary line-clamp-2"
                      >
                        {r.title ?? r.insight ?? "—"}
                      </a>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{r.source}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.sector ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.region ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.country ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.intensity ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.likelihood ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.relevance ?? "—"}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          D3.js · TanStack Start · dashinsights Cloud
        </footer>
      </main>
    </div>
  );
}
