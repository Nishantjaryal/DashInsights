import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartSize } from "./useChartSize";

export type BubbleDatum = {
  x: number;
  y: number;
  r: number;
  label: string;
  group: string;
};

export function BubbleChart({ data }: { data: BubbleDatum[] }) {
  const { ref, size } = useChartSize<HTMLDivElement>();
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const { width, height } = size;
    if (!svgRef.current || width < 50 || height < 50) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    if (data.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 12)
        .text("No data for current filters");
      return;
    }
    const margin = { top: 12, right: 16, bottom: 36, left: 36 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, (d3.max(data, (d) => d.x) ?? 5) + 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, (d3.max(data, (d) => d.y) ?? 5) + 1]).range([h, 0]);
    const r = d3.scaleSqrt().domain([0, d3.max(data, (d) => d.r) ?? 1]).range([4, 28]);
    const groups = Array.from(new Set(data.map((d) => d.group)));
    const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
    const color = d3.scaleOrdinal<string, string>().domain(groups).range(palette);

    g.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-h))
      .call((s) => s.select(".domain").remove())
      .call((s) => s.selectAll(".tick line").attr("stroke", "var(--border)").attr("stroke-dasharray", "2,3"))
      .selectAll("text")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10);
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickSize(-w))
      .call((s) => s.select(".domain").remove())
      .call((s) => s.selectAll(".tick line").attr("stroke", "var(--border)").attr("stroke-dasharray", "2,3"))
      .selectAll("text")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10);

    g.append("text")
      .attr("x", w)
      .attr("y", h + 28)
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10)
      .text("Likelihood →");
    g.append("text")
      .attr("x", -8)
      .attr("y", -2)
      .attr("text-anchor", "end")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10)
      .text("↑ Relevance");

    const tooltip = d3.select(ref.current!).select<HTMLDivElement>(".bubble-tooltip");

    g.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y))
      .attr("fill", (d) => color(d.group))
      .attr("fill-opacity", 0.55)
      .attr("stroke", (d) => color(d.group))
      .attr("stroke-width", 1.5)
      .attr("r", 0)
      .on("mousemove", function (event, d) {
        tooltip
          .style("opacity", "1")
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY + 12}px`)
          .html(
            `<div class="font-medium">${d.label}</div><div class="text-muted-foreground">${d.group}</div><div class="mt-1">Likelihood ${d.x} · Relevance ${d.y} · Intensity ${d.r}</div>`
          );
      })
      .on("mouseleave", () => tooltip.style("opacity", "0"))
      .transition()
      .duration(700)
      .attr("r", (d) => r(d.r));
  }, [data, size]);

  return (
    <div ref={ref} className="w-full h-full relative">
      <svg ref={svgRef} width={size.width} height={size.height} />
      <div
        className="bubble-tooltip pointer-events-none absolute opacity-0 transition-opacity rounded-md border border-border bg-popover/95 backdrop-blur px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-lg max-w-[220px]"
        style={{ opacity: 0 }}
      />
    </div>
  );
}