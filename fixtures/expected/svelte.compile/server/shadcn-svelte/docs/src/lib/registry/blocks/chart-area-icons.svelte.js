import * as $ from 'svelte/internal/server';
import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_area_icons($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ date: new Date("2024-01-01"), desktop: 186, mobile: 80 },
			{ date: new Date("2024-02-01"), desktop: 305, mobile: 200 },
			{ date: new Date("2024-03-01"), desktop: 237, mobile: 120 },
			{ date: new Date("2024-04-01"), desktop: 73, mobile: 190 },
			{ date: new Date("2024-05-01"), desktop: 209, mobile: 130 },
			{ date: new Date("2024-06-01"), desktop: 214, mobile: 140 }
		];

		const chartConfig = {
			desktop: {
				label: "Desktop",
				color: "var(--chart-1)",
				icon: TrendingDownIcon
			},
			mobile: {
				label: "Mobile",
				color: "var(--chart-2)",
				icon: TrendingUpIcon
			}
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
											$$renderer.push(`<!---->Area Chart - Icons`);
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

														Chart.Tooltip($$renderer, {
															labelFormatter: (v) => {
																return v.toLocaleDateString("en-US", { month: "long" });
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												AreaChart($$renderer, {
													legend: true,
													data: chartData,
													x: 'date',
													xScale: scaleUtc(),
													series: [
														{
															key: "mobile",
															label: "Mobile",
															color: chartConfig.mobile.color
														},

														{
															key: "desktop",
															label: "Desktop",
															color: chartConfig.desktop.color
														}
													],
													seriesLayout: 'stack',
													props: {
														area: {
															curve: curveNatural,
															fillOpacity: 0.4,
															line: { class: "stroke-1" },
															motion: "tween"
														},
														xAxis: {
															format: (v) => v.toLocaleDateString("en-US", { month: "short" })
														},
														yAxis: { format: () => "" }
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
								$$renderer.push(`<!----></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div></div></div>`);
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