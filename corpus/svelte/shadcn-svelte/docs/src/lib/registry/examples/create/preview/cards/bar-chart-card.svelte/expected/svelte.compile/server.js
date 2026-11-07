import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

export default function Bar_chart_card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const barChartData = [
			{ month: "January", desktop: 186, mobile: 80 },
			{ month: "February", desktop: 305, mobile: 200 },
			{ month: "March", desktop: 237, mobile: 120 },
			{ month: "April", desktop: 73, mobile: 190 },
			{ month: "May", desktop: 209, mobile: 130 },
			{ month: "June", desktop: 214, mobile: 140 }
		];

		const barChartConfig = {
			desktop: { label: "Desktop", color: "var(--chart-1)" },
			mobile: { label: "Mobile", color: "var(--chart-2)" }
		};

		const desktopTotal = barChartData.reduce((sum, item) => sum + item.desktop, 0);
		const mobileTotal = barChartData.reduce((sum, item) => sum + item.mobile, 0);
		const desktopDelta = Math.round((desktopTotal - mobileTotal) / mobileTotal * 100);
		const desktopDeltaPrefix = desktopDelta > 0 ? "+" : "";

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
											$$renderer.push(`<!---->Traffic Channels`);
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
											$$renderer.push(`<!---->Desktop vs mobile over the last 6 months`);
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
											if (ToggleGroup.Root) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Root($$renderer, {
													'aria-label': 'Time range',
													type: 'single',
													value: '6m',
													variant: 'outline',
													size: 'sm',
													children: ($$renderer) => {
														if (ToggleGroup.Item) {
															$$renderer.push('<!--[-->');

															ToggleGroup.Item($$renderer, {
																value: '6m',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->6M`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (ToggleGroup.Item) {
															$$renderer.push('<!--[-->');

															ToggleGroup.Item($$renderer, {
																value: '12m',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->12M`);
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
							class: 'pt-0',
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: barChartConfig,
										class: 'max-h-[180px] w-full',
										children: ($$renderer) => {
											{
												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');
														Chart.Tooltip($$renderer, { indicator: 'dashed' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												BarChart($$renderer, {
													data: barChartData,
													xScale: scaleBand().padding(0.25),
													x: 'month',
													axis: 'x',
													x1Scale: scaleBand().paddingInner(0.2),
													seriesLayout: 'group',
													rule: false,
													props: {
														bars: { stroke: "none", rounded: "all" },
														xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 }
													},
													series: [
														{
															key: "desktop",
															label: barChartConfig.desktop.label,
															color: barChartConfig.desktop.color
														},

														{
															key: "mobile",
															label: barChartConfig.mobile.label,
															color: barChartConfig.mobile.color
														}
													],
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
								$$renderer.push(`<div class="grid w-full grid-cols-3 divide-x divide-border/60"><div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Desktop</div> <div class="text-sm font-medium tabular-nums">${$.escape(desktopTotal.toLocaleString())}</div></div> <div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Mobile</div> <div class="text-sm font-medium tabular-nums">${$.escape(mobileTotal.toLocaleString())}</div></div> <div class="px-2 text-center"><div class="text-[0.65rem] text-muted-foreground uppercase">Mix Delta</div> <div class="text-sm font-medium tabular-nums">${$.escape(desktopDeltaPrefix)}${$.escape(desktopDelta)}%</div></div></div>`);
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