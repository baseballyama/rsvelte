import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_bar_tooltip_demo($$anchor, $$props) {
	$.push($$props, true);

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

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Chart.Container, ($$anchor, Chart_Container) => {
		Chart_Container($$anchor, {
			get config() {
				return chartConfig;
			},
			class: 'min-h-[200px] w-full',
			children: ($$anchor, $$slotProps) => {
				{
					const tooltip = ($$anchor) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
							Chart_Tooltip($$anchor, {});
						});

						$.append($$anchor, fragment_2);
					};

					let $0 = $.derived(() => scaleBand().padding(0.25));

					let $1 = $.derived(() => [
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
					]);

					BarChart($$anchor, {
						get data() {
							return chartData;
						},

						get xScale() {
							return $.get($0);
						},
						x: 'month',
						axis: 'x',
						seriesLayout: 'group',
						get series() {
							return $.get($1);
						},
						tooltip,
						$$slots: { tooltip: true }
					});
				}
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}