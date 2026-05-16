import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartSize } from "./useChartSize";

export type BarDatum = { label: string; value: number };

export function BarChart({
  data,
  color = "var(--chart-1)",
  horizontal = false,
  valueLabel = "Value",
}: {
  data: BarDatum[];
  color?: string;
  horizontal?: boolean;
  valueLabel?: string;
}) {
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
    const margin = horizontal
      ? { top: 8, right: 24, bottom: 24, left: 120 }
      : { top: 8, right: 12, bottom: 56, left: 36 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const max = d3.max(data, (d) => d.value) ?? 0;

    if (horizontal) {
      const y = d3.scaleBand().domain(data.map((d) => d.label)).range([0, h]).padding(0.2);
      const x = d3.scaleLinear().domain([0, max]).nice().range([0, w]);
      g.append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .call((s) => s.select(".domain").remove())
        .selectAll("text")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 11);
      g.append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).ticks(4).tickSize(-h))
        .call((s) => s.select(".domain").remove())
        .call((s) => s.selectAll(".tick line").attr("stroke", "var(--border)").attr("stroke-dasharray", "2,3"))
        .selectAll("text")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 10);
      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", 0)
        .attr("y", (d) => y(d.label)!)
        .attr("height", y.bandwidth())
        .attr("rx", 4)
        .attr("fill", color)
        .attr("width", 0)
        .transition()
        .duration(700)
        .attr("width", (d) => x(d.value));
    } else {
      const x = d3.scaleBand().domain(data.map((d) => d.label)).range([0, w]).padding(0.2);
      const y = d3.scaleLinear().domain([0, max]).nice().range([h, 0]);
      g.append("g")
        .attr("transform", `translate(0,${h})`)
        .call(d3.axisBottom(x).tickSize(0))
        .call((s) => s.select(".domain").remove())
        .selectAll("text")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 10)
        .attr("transform", "rotate(-30)")
        .attr("text-anchor", "end");
      g.append("g")
        .call(d3.axisLeft(y).ticks(4).tickSize(-w))
        .call((s) => s.select(".domain").remove())
        .call((s) => s.selectAll(".tick line").attr("stroke", "var(--border)").attr("stroke-dasharray", "2,3"))
        .selectAll("text")
        .attr("fill", "var(--muted-foreground)")
        .attr("font-size", 10);
      g.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.label)!)
        .attr("width", x.bandwidth())
        .attr("rx", 4)
        .attr("fill", color)
        .attr("y", h)
        .attr("height", 0)
        .transition()
        .duration(700)
        .attr("y", (d) => y(d.value))
        .attr("height", (d) => h - y(d.value));
    }

    void valueLabel;
  }, [data, size, color, horizontal, valueLabel]);

  return (
    <div ref={ref} className="w-full h-full">
      <svg ref={svgRef} width={size.width} height={size.height} />
    </div>
  );
}