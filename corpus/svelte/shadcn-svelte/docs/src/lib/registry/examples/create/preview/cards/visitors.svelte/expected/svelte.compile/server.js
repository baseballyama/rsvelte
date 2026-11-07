import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";

export default function Visitors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const areaChartData = [
			{ month: "January", desktop: 186 },
			{ month: "February", desktop: 305 },
			{ month: "March", desktop: 237 },
			{ month: "April", desktop: 73 },
			{ month: "May", desktop: 209 },
			{ month: "June", desktop: 214 }
		];

		const areaChartConfig = { desktop: { label: "Desktop", color: "var(--chart-1)" } };
		const latestVisitors = areaChartData[areaChartData.length - 1]?.desktop ?? 0;
		const previousVisitors = areaChartData[areaChartData.length - 2]?.desktop ?? latestVisitors;

		const trendPercent = previousVisitors === 0
			? 0
			: Math.round((latestVisitors - previousVisitors) / previousVisitors * 100);

		const trendPrefix = trendPercent > 0 ? "+" : "";

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: 'pb-0',
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Visitors`);
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
											$$renderer.push(`<!---->Last 6 months`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Action) {
									$$renderer.push('<!--[-->');

									Card.Action($$renderer, {
										children: ($$renderer) => {
											Badge($$renderer, {
												variant: trendPercent >= 0 ? "secondary" : "destructive",
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(trendPrefix)}${$.escape(trendPercent)}% vs last month`);
												},
												$$slots: { default: true }
											});
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
							class: 'px-0',
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: areaChartConfig,
										class: 'h-48 w-full',
										children: ($$renderer) => {
											{
												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');
														Chart.Tooltip($$renderer, { indicator: 'line', hideLabel: true });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												AreaChart($$renderer, {
													data: areaChartData,
													x: 'month',
													xScale: scaleBand(),
													axis: 'x',
													series: [
														{
															key: "desktop",
															label: "Desktop",
															color: areaChartConfig.desktop.color
														}
													],
													props: {
														area: { curve: curveNatural, fillOpacity: 0.15, motion: "tween" },
														xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
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