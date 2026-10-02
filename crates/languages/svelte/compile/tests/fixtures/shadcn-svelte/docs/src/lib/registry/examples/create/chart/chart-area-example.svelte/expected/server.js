import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { curveNatural } from "d3-shape";
import { AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Chart_area_example($$renderer, $$props) {
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

		Example($$renderer, {
			title: 'Area Chart',
			children: ($$renderer) => {
				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'w-full',
						children: ($$renderer) => {
							if (Card.Header) {
								$$renderer.push('<!--[-->');

								Card.Header($$renderer, {
									children: ($$renderer) => {
										if (Card.Title) {
											$$renderer.push('<!--[-->');

											Card.Title($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Area Chart`);
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
												config: areaChartConfig,
												children: ($$renderer) => {
													{
														function tooltip($$renderer) {
															if (Chart.Tooltip) {
																$$renderer.push('<!--[-->');
																Chart.Tooltip($$renderer, { indicator: 'line' });
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
																area: { curve: curveNatural, fillOpacity: 0.4, motion: "tween" },
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

							$$renderer.push(` `);

							if (Card.Footer) {
								$$renderer.push('<!--[-->');

								Card.Footer($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex w-full items-start gap-2"><div class="grid gap-2"><div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month `);

										IconPlaceholder($$renderer, {
											lucide: 'TrendingUpIcon',
											tabler: 'IconTrendingUp',
											hugeicons: 'ChartUpIcon',
											phosphor: 'TrendUpIcon',
											remixicon: 'RiLineChartLine',
											class: 'size-4'
										});

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
			},
			$$slots: { default: true }
		});
	});
}