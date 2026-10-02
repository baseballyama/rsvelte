import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { Area, AreaChart, LinearGradient } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_area_gradient($$renderer, $$props) {
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
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Area Chart - Gradient`);
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
															indicator: 'dot',
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

												function marks($$renderer, { context }) {
													$$renderer.push(`<!--[-->`);

													const each_array = $.ensure_array_like(context.series.visibleSeries);

													for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
														let s = each_array[$$index];

														{
															function children($$renderer, { gradient }) {
																Area($$renderer, $.spread_props([
																	{
																		seriesKey: s.key,
																		curve: curveNatural,
																		fillOpacity: 0.4,
																		line: { class: "stroke-1" },
																		motion: 'tween'
																	},
																	s.props,
																	{ fill: gradient }
																]));
															}

															LinearGradient($$renderer, {
																stops: [
																	s.color ?? "",
																	"color-mix(in lch, " + s.color + " 10%, transparent)"
																],
																vertical: true,
																children,
																$$slots: { default: true }
															});
														}
													}

													$$renderer.push(`<!--]-->`);
												}

												AreaChart($$renderer, {
													data: chartData,
													x: 'date',
													xScale: scaleUtc(),
													yPadding: [0, 25],
													series: [
														{ key: "mobile", label: "Mobile", color: "var(--color-mobile)" },
														{
															key: "desktop",
															label: "Desktop",
															color: "var(--color-desktop)"
														}
													],
													seriesLayout: 'stack',
													props: {
														xAxis: {
															format: (v) => v.toLocaleDateString("en-US", { month: "short" })
														},
														yAxis: { format: () => "" }
													},
													tooltip,
													marks,
													$$slots: { tooltip: true, marks: true }
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