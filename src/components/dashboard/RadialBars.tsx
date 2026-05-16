import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useChartSize } from "./useChartSize";

export function RadialBars({ data }: { data: { label: string; value: number }[] }) {
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
    const outer = Math.min(width, height) / 2 - 4;
    const inner = outer * 0.32;
    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, 2 * Math.PI])
      .padding(0.08);
    const y = d3.scaleRadial().domain([0, d3.max(data, (d) => d.value) ?? 1]).range([inner, outer]);

    const arc = d3
      .arc<{ label: string; value: number }>()
      .innerRadius(inner)
      .outerRadius((d) => y(d.value))
      .startAngle((d) => x(d.label)!)
      .endAngle((d) => x(d.label)! + x.bandwidth())
      .padAngle(0.02)
      .padRadius(inner);

    g.selectAll("path")
      .data(data)
      .join("path")
      .attr("fill", "url(#radial-grad)")
      .attr("d", arc as any);

    const defs = svg.append("defs");
    const grad = defs
      .append("linearGradient")
      .attr("id", "radial-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "var(--chart-1)");
    grad.append("stop").attr("offset", "100%").attr("stop-color", "var(--chart-2)");

    g.selectAll("text.lbl")
      .data(data)
      .join("text")
      .attr("class", "lbl")
      .attr("text-anchor", (d) => {
        const a = (x(d.label)! + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI);
        return a < Math.PI ? "start" : "end";
      })
      .attr("transform", (d) => {
        const a = x(d.label)! + x.bandwidth() / 2 - Math.PI / 2;
        const rr = outer + 8;
        const flip = ((a + Math.PI / 2) % (2 * Math.PI)) >= Math.PI;
        return `rotate(${(a * 180) / Math.PI}) translate(${rr},0) ${flip ? "rotate(180)" : ""}`;
      })
      .attr("fill", "var(--muted-foreground)")
      .attr("font-size", 10)
      .text((d) => d.label);
  }, [data, size]);

  return (
    <div ref={ref} className="w-full h-full">
      <svg ref={svgRef} width={size.width} height={size.height} />
    </div>
  );
}