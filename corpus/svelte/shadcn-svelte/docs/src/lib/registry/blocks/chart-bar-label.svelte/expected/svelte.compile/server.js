import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_bar_label($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ month: "January", desktop: 186 },
			{ month: "February", desktop: 305 },
			{ month: "March", desktop: 237 },
			{ month: "April", desktop: 73 },
			{ month: "May", desktop: 209 },
			{ month: "June", desktop: 214 }
		];

		const chartConfig = { desktop: { label: "Desktop", color: "var(--chart-1)" } };

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
											$$renderer.push(`<!---->Bar Chart - Label`);
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
											$$renderer.push(`<!---->January - June 2024`);
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
														Chart.Tooltip($$renderer, { hideLabel: true });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												BarChart($$renderer, {
													labels: { offset: 12 },
													data: chartData,
													xScale: scaleBand().padding(0.25),
													x: 'month',
													series: [
														{
															key: "desktop",
															label: "Desktop",
															color: chartConfig.desktop.color
														}
													],
													axis: 'x',
													rule: false,
													props: {
														bars: {
															stroke: "none",
															radius: 8,
															rounded: "all",
															motion: { type: "tween", duration: 500, easing: cubicInOut }
														},
														highlight: { area: { fill: "none" } },
														xAxis: { format: (d) => d.slice(0, 3) }
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

					$$renderer.push(` `);

					if (Card.Footer) {
						$$renderer.push('<!--[-->');

						Card.Footer($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex w-full items-start gap-2 text-sm"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month `);
								TrendingUpIcon($$renderer, { class: 'size-4' });
								$$renderer.push(`<!----></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">Showing total visitors for the last 6 months</div></div></div>`);
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