import * as $ from 'svelte/internal/server';
import { curveNatural } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Exercise_minutes($$renderer) {
	const data = [
		{ average: 400, today: 240, day: "Monday" },
		{ average: 300, today: 139, day: "Tuesday" },
		{ average: 200, today: 980, day: "Wednesday" },
		{ average: 278, today: 390, day: "Thursday" },
		{ average: 189, today: 480, day: "Friday" },
		{ average: 239, today: 380, day: "Saturday" },
		{ average: 349, today: 430, day: "Sunday" }
	];

	const chartConfig = {
		today: { label: "Today", color: "var(--primary)" },
		average: { label: "Average", color: "var(--primary)" }
	};

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Exercise Minutes`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Card.Description) {
								$$renderer.push('<!--[-->');

								Card.Description($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Your exercise minutes are ahead of where you normally are.`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						class: 'pb-4',
						children: ($$renderer) => {
							if (Chart.Container) {
								$$renderer.push('<!--[-->');

								Chart.Container($$renderer, {
									config: chartConfig,
									class: 'w-full md:h-[200px] [&_.lc-highlight-line]:stroke-1',
									children: ($$renderer) => {
										{
											function tooltip($$renderer) {
												if (Chart.Tooltip) {
													$$renderer.push('<!--[-->');
													Chart.Tooltip($$renderer, { label: 'Minutes' });
													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											LineChart($$renderer, {
												axis: 'x',
												data: data.map((d, i) => ({ ...d, index: i })),
												x: 'index',
												series: [
													{
														key: "average",
														color: "var(--color-average)",
														label: "Average",
														props: { "stroke-opacity": 0.5 }
													},
													{ key: "today", color: "var(--color-today)", label: "Today" }
												],
												seriesLayout: 'stack',
												points: true,
												props: {
													spline: { curve: curveNatural, strokeWidth: 2 },
													points: {
														r: 3,
														stroke: "var(--color-today)",
														strokeWidth: 2,
														fill: "var(--color-today)"
													},
													highlight: { points: { motion: { type: "none" }, r: 5 } },
													xAxis: { format: (d) => data[d]?.day?.slice(0, 3) }
												},
												tooltip,
												$$slots: { tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}
}