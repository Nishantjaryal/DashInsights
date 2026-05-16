import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import type { Filters, Insight } from "@/lib/insights";
import { EMPTY_FILTERS, uniqueValues } from "@/lib/insights";

const FILTER_DEFS: { key: keyof Filters; label: string; field: keyof Insight }[] = [
  { key: "end_year", label: "End Year", field: "end_year" },
  { key: "topic", label: "Topic", field: "topic" },
  { key: "sector", label: "Sector", field: "sector" },
  { key: "region", label: "Region", field: "region" },
  { key: "pestle", label: "PEST", field: "pestle" },
  { key: "source", label: "Source", field: "source" },
  { key: "swot", label: "SWOT", field: "swot" },
  { key: "country", label: "Country", field: "country" },
  { key: "city", label: "City", field: "city" },
];

export function FilterBar({
  rows,
  filters,
  onChange,
}: {
  rows: Insight[];
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          <Filter className="size-4" /> Filters
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
        {FILTER_DEFS.map(({ key, label, field }) => {
          const opts = uniqueValues(rows, field);
          return (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                {label}
              </label>
              <Select
                value={filters[key]}
                onValueChange={(v) => onChange({ ...filters, [key]: v })}
              >
                <SelectTrigger className="h-9 bg-background/50 border-border text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {opts.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No data</div>
                  )}
                  {opts.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}