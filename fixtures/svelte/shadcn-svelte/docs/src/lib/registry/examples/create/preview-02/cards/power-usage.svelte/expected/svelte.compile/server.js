import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Power_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ hour: "6a", usage: 1.2 },
			{ hour: "8a", usage: 2.8 },
			{ hour: "10a", usage: 3.1 },
			{ hour: "12p", usage: 2.4 },
			{ hour: "2p", usage: 3.4 },
			{ hour: "4p", usage: 2.9 },
			{ hour: "6p", usage: 3.8 },
			{ hour: "8p", usage: 3.2 }
		];

		const chartConfig = { usage: { label: "Usage (kW)", color: "var(--chart-2)" } };

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
											$$renderer.push(`<!---->Power Usage`);
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
											$$renderer.push(`<!---->Whole Home`);
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
							class: 'flex flex-col gap-4',
							children: ($$renderer) => {
								if (Chart.Container) {
									$$renderer.push('<!--[-->');

									Chart.Container($$renderer, {
										config: chartConfig,
										class: 'h-[140px] w-full',
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
													data: chartData,
													x: 'hour',
													xScale: scaleBand().padding(0.2),
													axis: 'x',
													rule: false,
													series: [
														{
															key: "usage",
															label: chartConfig.usage.label,
															color: chartConfig.usage.color
														}
													],
													props: {
														bars: { rounded: "top" },
														xAxis: { tickLength: 0, class: "text-xs" }
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

								$$renderer.push(` `);
								Separator($$renderer, {});
								$$renderer.push(`<!----> <div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Currently Using</span> <span class="text-lg font-semibold tabular-nums">3.4 kW</span></div> <div class="flex flex-col gap-0.5"><span class="text-sm text-muted-foreground">Solar Gen</span> <span class="text-lg font-semibold text-chart-1 tabular-nums">+1.2 kW</span></div></div>`);
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
							class: 'flex-col items-start gap-1',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-sm text-muted-foreground">Battery Level</span> <div class="flex w-full items-center gap-2">`);
								Progress($$renderer, { value: 85, class: 'flex-1' });
								$$renderer.push(`<!----> <span class="text-sm font-medium tabular-nums">85%</span></div>`);
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