import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { curveLinearClosed } from "d3-shape";
import { Axis, LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_radar_radius($$renderer, $$props) {
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
			desktop: { label: "Desktop", color: "var(--chart-1)" },
			mobile: { label: "Mobile", color: "var(--chart-2)" }
		};

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							class: 'items-center',
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Radar Chart - Radius Axis`);
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
											$$renderer.push(`<!---->Showing total visitors for the last 6 months`);
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
							class: 'flex-1',
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: chartConfig,
										class: 'mx-auto aspect-square max-h-[250px]',
										children: ($$renderer) => {
											{
												function axis($$renderer) {
													Axis($$renderer, { placement: 'angle', format: () => "" });
													$$renderer.push(`<!----> `);

													Axis($$renderer, {
														placement: 'radius',
														format: 'metric',
														tickLabelProps: { class: "fill-background!" }
													});

													$$renderer.push(`<!---->`);
												}

												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');
														Chart.Tooltip($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												LineChart($$renderer, {
													data: chartData,
													series: [
														{
															key: "desktop",
															label: "Desktop",
															color: chartConfig.desktop.color,
															props: { fill: chartConfig.desktop.color, fillOpacity: 0.6 }
														},

														{
															key: "mobile",
															label: "Mobile",
															color: chartConfig.mobile.color,
															props: { fill: chartConfig.mobile.color }
														}
													],
													radial: true,
													x: 'month',
													y: 'desktop',
													xScale: scaleBand(),
													padding: 12,
													props: {
														spline: { curve: curveLinearClosed, stroke: "0", motion: "tween" },
														xAxis: { placement: "angle", format: () => "" },
														yAxis: {
															format: "metric",
															tickLabelProps: { class: "fill-background!" }
														},
														grid: { yTicks: 6, radialY: "linear" },
														tooltip: { context: { mode: "voronoi" } },
														highlight: { lines: false, points: { r: 4 } }
													},
													axis,
													tooltip,
													$$slots: { axis: true, tooltip: true }
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

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							class: 'flex-col gap-2 text-sm',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month `);
								TrendingUpIcon($$renderer, { class: 'size-4' });
								$$renderer.push(`<!----></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`);
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