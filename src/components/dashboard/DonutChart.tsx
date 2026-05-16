import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartSize } from "./useChartSize";

export function DonutChart({ data }: { data: { label: string; value: number }[] }) {
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
        .text("No data");
      return;
    }
    const palette = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
    const radius = Math.min(width, height) / 2 - 8;
    const inner = radius * 0.62;
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const total = d3.sum(data, (d) => d.value);
    const pie = d3.pie<{ label: string; value: number }>().value((d) => d.value).sort(null);
    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number }>>().innerRadius(inner).outerRadius(radius);

    const tooltip = d3.select(ref.current!).select<HTMLDivElement>(".donut-tooltip");

    g.selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("fill", (_, i) => palette[i % palette.length])
      .attr("stroke", "var(--card)")
      .attr("stroke-width", 2)
      .on("mousemove", function (event, d) {
        tooltip
          .style("opacity", "1")
          .style("left", `${event.offsetX + 12}px`)
          .style("top", `${event.offsetY + 12}px`)
          .html(
            `<div class="font-medium">${d.data.label}</div><div class="text-muted-foreground">${d.data.value} · ${((d.data.value / total) * 100).toFixed(0)}%</div>`
          );
      })
      .on("mouseleave", () => tooltip.style("opacity", "0"))
      .transition()
      .duration(700)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 } as d3.PieArcDatum<{ label: string; value: number }>, d);
        return (t) => arc(i(t)) ?? "";
      });

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "var(--foreground)")
      .attr("font-size", 22)
      .attr("font-weight", 600)
      .text(total);
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10)
      .attr("letter-spacing", 1.5)
      .text("TOTAL");
  }, [data, size]);

  return (
    <div ref={ref} className="w-full h-full relative">
      <svg ref={svgRef} width={size.width} height={size.height} />
      <div
        className="donut-tooltip pointer-events-none absolute opacity-0 transition-opacity rounded-md border border-border bg-popover/95 backdrop-blur px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-lg"
        style={{ opacity: 0 }}
      />
    </div>
  );
}