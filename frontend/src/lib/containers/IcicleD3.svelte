<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from 'd3';
    import { testData } from '$lib/containers/testData';
  
    export let width = 928;
    export let height = 1200;
    export let title = "Portfolio";
    export let description = "Click a segment to zoom in, or the left column to zoom out.";
    export let data = testData;
  
    // Explicitly define the type of `chart`
    export let chart: HTMLElement;
  
    function renderChart() {
  // Clear any existing content
  d3.select(chart).selectAll("*").remove();

  // Get the current container width for responsive sizing
  const containerWidth = chart.clientWidth || width;
  const aspectRatio = height / width;
  const containerHeight = containerWidth * aspectRatio;

  // Create the color scale.
  const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  // Compute the layout.
  const hierarchy = d3.hierarchy(data)
    .sum((d: any) => d.value)
    .sort((a: any, b: any) => b.height - a.height || b.value - a.value);
  const root = d3.partition()
    .size([containerHeight, (hierarchy.height + 1) * containerWidth / 3])
    (hierarchy);

  // Create the SVG container.
  const svg = d3.select(chart)
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", containerWidth)
    .attr("height", containerHeight)
    .attr("style", "font: 10px Merriweather, serif;");

  // Add a subtle pattern background to the chart
  svg.append("defs")
    .append("pattern")
    .attr("id", "grid")
    .attr("width", 10)
    .attr("height", 10)
    .attr("patternUnits", "userSpaceOnUse")
    .append("path")
    .attr("d", "M 10 0 L 0 0 0 10")
    .attr("fill", "none")
    .attr("stroke", "rgba(0,0,0,0.05)")
    .attr("stroke-width", 1);

  svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "url(#grid)");

  // Append cells.
  const cell = svg
    .selectAll("g.cell")
    .data(root.descendants())
    .join("g")
    .attr("class", "cell")
    .attr("transform", (d: any) => `translate(${d.y0},${d.x0})`);

  const rect = cell.append("rect")
    .attr("width", (d: any) => d.y1 - d.y0 - 1)
    .attr("height", (d: any) => rectHeight(d))
    .attr("fill-opacity", 0.85)
    .attr("fill", (d: any) => {
      if (!d.depth) return "#f0f0f0";
      while (d.depth > 1) d = d.parent;
      return color(d.data.name);
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("click", (event: MouseEvent, p: any) => clicked(event, p))
    .on("mouseover", function() {
      d3.select(this).attr("fill-opacity", 1);
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill-opacity", 0.85);
    });

  const text = cell.append("text")
    .style("user-select", "none")
    .attr("pointer-events", "none")
    .attr("x", (d: any) => (d.y1 - d.y0) / 2) 
    .attr("y", (d: any) => (d.x1 - d.x0) / 2) 
    .attr("fill", (d: any) => d.depth === 0 ? "#333" : "#fff")
    .attr("fill-opacity", (d: any) => +labelVisible(d))
    .attr("text-shadow", "0px 0px 2px rgba(0,0,0,0.3)")
    .style("font-size", (d: any) => {
      if (d.depth === 0) return "2.75rem"; 
      if (d.depth === 1) return "1.5rem"; 
      if (d.depth === 2) return "1.25rem"; 
      if (d.depth === 3) return "1.5rem"; 

      return "1rem"; // Default for deeper levels
    })
    
    .attr("text-anchor", "middle") // Center-align text horizontally
    .attr("dominant-baseline", "middle"); // Center-align text vertically

  text.append("tspan")
    .text((d: any) => d.data.name)
    .attr("font-weight", (d: any) => d.depth <= 1 ? "bold" : "normal");

  const format = d3.format(",d");
  const tspan = text.append("tspan")
    .attr("fill-opacity", (d: any) => labelVisible(d) * 0.7)
    .text((d: any) => ` ${format(d.value)}`);

  cell.append("title")
    .text((d: any) => `${d.ancestors().map((d: any) => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  // On click, change the focus and transitions it into view.
  let focus = root;
  function clicked(event: MouseEvent, p: any) {
    focus = focus === p ? p = p.parent : p;

    root.each((d: any) => d.target = {
      x0: (d.x0 - p.x0) / (p.x1 - p.x0) * containerHeight,
      x1: (d.x1 - p.x0) / (p.x1 - p.x0) * containerHeight,
      y0: d.y0 - p.y0,
      y1: d.y1 - p.y0
    });

    const t = cell.transition().duration(750)
      .attr("transform", (d: any) => `translate(${d.target.y0},${d.target.x0})`);

    rect.transition(t).attr("height", (d: any) => rectHeight(d.target));
    text.transition(t).attr("fill-opacity", (d: any) => +labelVisible(d.target));
    tspan.transition(t).attr("fill-opacity", (d: any) => labelVisible(d.target) * 0.7);
  }

  function rectHeight(d: any) {
    return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
  }

  function labelVisible(d: any) {
    return d.y1 <= containerWidth && d.y0 >= 0 && d.x1 - d.x0 > 16;
  }
}
  
    $: if (data && chart) {
      renderChart();
    }
  
    onMount(() => {
      if (chart) {
        renderChart();
      }
  
      // Handle resize events for responsiveness
      const handleResize = () => {
        renderChart();
      };
  
      window.addEventListener('resize', handleResize);
  
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });
  </script>
  
  <div class="chart-container" bind:this={chart}>
  </div>
  
  <style lang="scss">
    @use "src/styles/themes.scss" as *;
    * {
        font-family: var(--font-family);
    }    
    .icicle-container {
    }
  
    .icicle-header {
      border-bottom: 1px solid #eee;
      padding-bottom: 1rem;
    }
  
    h1 {
      font-size: 1.75rem;
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }
  
    p {
      font-size: 0.95rem;
      margin: 0;
      color: #666;
      line-height: 1.4;
    }
  
    .chart-container {
      display: flex;
      flex-direction: column;
      width: auto;
      margin-top: 2rem;
      margin: -7rem;
      padding: 0;
        border-radius: 2rem;
        box-sizing: border-box;
        overflow: hidden;
        border: 1px solid var(--tertiary-color);
      width: 928px;
      height: 50vh;
    }
  
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
  
    .legend-item {
      display: flex;
      align-items: center;
      font-size: 0.85rem;
      margin-right: 10px;
    }
  
    .legend-color {
      width: 15px;
      height: 15px;
      border-radius: 4px;
      margin-right: 6px;
      border: 1px solid rgba(0, 0, 0, 0.1);
    }
  
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .icicle-container {
        padding: 15px;
        border-radius: 6px;
      }
  
      h1 {
        font-size: 1.4rem;
      }
  
      p {
        font-size: 0.9rem;
      }
  
      .legend {
        flex-direction: column;
        gap: 8px;
      }
  
      .legend-item {
        margin-right: 0;
      }
    }
  </style>