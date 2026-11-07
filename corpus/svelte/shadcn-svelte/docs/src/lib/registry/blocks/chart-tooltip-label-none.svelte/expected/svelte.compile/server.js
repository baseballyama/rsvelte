import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_tooltip_label_none($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ date: "2024-07-15", running: 450, swimming: 300 },
			{ date: "2024-07-16", running: 380, swimming: 420 },
			{ date: "2024-07-17", running: 520, swimming: 120 },
			{ date: "2024-07-18", running: 140, swimming: 550 },
			{ date: "2024-07-19", running: 600, swimming: 350 },
			{ date: "2024-07-20", running: 480, swimming: 400 }
		];

		const chartConfig = {
			running: { label: "Running", color: "var(--chart-1)" },
			swimming: { label: "Swimming", color: "var(--chart-2)" }
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
											$$renderer.push(`<!---->Tooltip - No Label`);
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
											$$renderer.push(`<!---->Tooltip with no label.`);
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
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: chartConfig,
										children: ($$renderer) => {
											{
												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');
														Chart.Tooltip($$renderer, { hideLabel: true, hideIndicator: true });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												BarChart($$renderer, {
													data: chartData,
													xScale: scaleBand().padding(0.25),
													x: 'date',
													axis: 'x',
													rule: false,
													series: [
														{
															key: "running",
															label: "Running",
															color: chartConfig.running.color,
															props: { rounded: "bottom" }
														},

														{
															key: "swimming",
															label: "Swimming",
															color: chartConfig.swimming.color
														}
													],
													seriesLayout: 'stack',
													grid: false,
													highlight: false,
													props: {
														bars: {
															stroke: "none",
															motion: { type: "tween", duration: 500, easing: cubicInOut }
														},
														xAxis: {
															format: (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
															tickLabelProps: { svgProps: { y: 13 } }
														}
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
	});
}