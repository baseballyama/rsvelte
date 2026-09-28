import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Contribution_history($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ month: "Dec", amount: 800 },
			{ month: "Jan", amount: 1100 },
			{ month: "Feb", amount: 900 },
			{ month: "Mar", amount: 1300 },
			{ month: "Apr", amount: 750 },
			{ month: "May", amount: 1400 }
		];

		const chartConfig = { amount: { label: "Contribution", color: "var(--chart-2)" } };

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
											$$renderer.push(`<!---->Contribution History`);
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
											$$renderer.push(`<!---->Last 6 months of activity`);
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
												variant: 'secondary',
												children: ($$renderer) => {
													$$renderer.push(`<!---->+12% vs last month`);
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
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: chartConfig,
										class: 'h-[200px] w-full',
										children: ($$renderer) => {
											{
												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');
														Chart.Tooltip($$renderer, { hideLabel: true, class: 'min-w-40' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												BarChart($$renderer, {
													data: chartData,
													x: 'month',
													xScale: scaleBand().padding(0.25),
													axis: 'x',
													rule: false,
													series: [
														{
															key: "amount",
															label: chartConfig.amount.label,
															color: chartConfig.amount.color
														}
													],
													props: {
														bars: { stroke: "none", rounded: "top" },
														xAxis: { tickLength: 0 }
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
							class: 'flex-col gap-4',
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid w-full grid-cols-1 gap-3 md:grid-cols-2">`);

								if (Item.Root) {
									$$renderer.push('<!--[-->');

									Item.Root($$renderer, {
										variant: 'muted',
										class: 'flex-col items-stretch',
										children: ($$renderer) => {
											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													class: 'gap-1',
													children: ($$renderer) => {
														if (Item.Description) {
															$$renderer.push('<!--[-->');

															Item.Description($$renderer, {
																class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Upcoming`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <span class="cn-font-heading text-lg font-semibold">May 25, 2024</span> <span class="text-sm text-muted-foreground">$1,000 scheduled</span>`);
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

								if (Item.Root) {
									$$renderer.push('<!--[-->');

									Item.Root($$renderer, {
										variant: 'muted',
										class: 'flex-col items-stretch',
										children: ($$renderer) => {
											if (Item.Content) {
												$$renderer.push('<!--[-->');

												Item.Content($$renderer, {
													class: 'gap-1',
													children: ($$renderer) => {
														if (Item.Description) {
															$$renderer.push('<!--[-->');

															Item.Description($$renderer, {
																class: 'text-xs font-medium tracking-wider text-muted-foreground uppercase',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Auto-Save Plan`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` <span class="cn-font-heading text-lg font-semibold">Accelerated</span> <span class="text-sm text-muted-foreground">Recurring weekly</span>`);
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

								$$renderer.push(`</div> `);

								Button($$renderer, {
									class: 'w-full',
									children: ($$renderer) => {
										$$renderer.push(`<!---->View Full Report`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
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