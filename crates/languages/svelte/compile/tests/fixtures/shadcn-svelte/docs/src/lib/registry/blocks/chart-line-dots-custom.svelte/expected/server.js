import * as $ from 'svelte/internal/server';
import GitCommitVerticalIcon from "@lucide/svelte/icons/git-commit-vertical";
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { LineChart, Points } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_line_dots_custom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ date: new Date("2024-01-01"), desktop: 186 },
			{ date: new Date("2024-02-01"), desktop: 305 },
			{ date: new Date("2024-03-01"), desktop: 237 },
			{ date: new Date("2024-04-01"), desktop: 73 },
			{ date: new Date("2024-05-01"), desktop: 209 },
			{ date: new Date("2024-06-01"), desktop: 214 }
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
											$$renderer.push(`<!---->Line Chart - Dots Custom`);
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
														Chart.Tooltip($$renderer, { hideLabel: true });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												function points($$renderer, { context }) {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(context.series.visibleSeries);

													for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
														let s = each_array[$$index_1];

														{
															function children($$renderer, { points }) {
																$$renderer.push(`<!--[-->`);

																const each_array_1 = $.ensure_array_like(points);

																for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																	let p = each_array_1[i];
																	const r = 24;

																	GitCommitVerticalIcon($$renderer, {
																		x: p.x - r / 2,
																		y: p.y - r / 2,
																		width: r,
																		height: r,
																		fill: 'var(--background)',
																		color: 'var(--color-desktop)'
																	});
																}

																$$renderer.push(`<!--]-->`);
															}

															Points($$renderer, $.spread_props([
																{ seriesKey: s.key },
																s.props,
																{ children, $$slots: { default: true } }
															]));
														}
													}

													$$renderer.push(`<!--]-->`);
												}

												LineChart($$renderer, {
													data: chartData,
													x: 'date',
													xScale: scaleUtc(),
													axis: 'x',
													series: [
														{
															key: "desktop",
															label: "Desktop",
															color: chartConfig.desktop.color
														}
													],
													props: {
														spline: { curve: curveNatural, motion: "tween", strokeWidth: 2 },
														highlight: { points: { motion: "none", r: 3 } },
														xAxis: {
															format: (v) => v.toLocaleDateString("en-US", { month: "short" })
														}
													},
													tooltip,
													points,
													$$slots: { tooltip: true, points: true }
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