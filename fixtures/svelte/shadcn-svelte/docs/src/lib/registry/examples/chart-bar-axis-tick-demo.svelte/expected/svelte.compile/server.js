import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_bar_axis_tick_demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ month: "January", desktop: 186, mobile: 80 },
			{ month: "February", desktop: 305, mobile: 200 },
			{ month: "March", desktop: 237, mobile: 120 },
			{ month: "April", desktop: 73, mobile: 190 },
			{ month: "May", desktop: 209, mobile: 130 },
			{ month: "June", desktop: 214, mobile: 140 }
		];

		const chartConfig = {
			desktop: { label: "Desktop", color: "#2563eb" },
			mobile: { label: "Mobile", color: "#60a5fa" }
		};

		if (Chart.Container) {
			$$renderer.push('<!--[-->');

			Chart.Container($$renderer, {
				config: chartConfig,
				class: 'min-h-[200px] w-full',
				children: ($$renderer) => {
					BarChart($$renderer, {
						data: chartData,
						xScale: scaleBand().padding(0.25),
						x: 'month',
						axis: 'x',
						tooltipContext: false,
						seriesLayout: 'group',
						series: [
							{
								key: "desktop",
								label: chartConfig.desktop.label,
								color: chartConfig.desktop.color
							},

							{
								key: "mobile",
								label: chartConfig.mobile.label,
								color: chartConfig.mobile.color
							}
						],
						props: { xAxis: { format: (d) => d.slice(0, 3) } }
					});
				},
				$$slots: { default: true }
			});

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	});
}