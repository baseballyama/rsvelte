import * as $ from 'svelte/internal/server';
import { scaleBand } from "d3-scale";
import { curveMonotoneX } from "d3-shape";
import { LineChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Chart_line_example($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const lineChartData = [
			{ month: "January", desktop: 186, mobile: 80 },
			{ month: "February", desktop: 305, mobile: 200 },
			{ month: "March", desktop: 237, mobile: 120 },
			{ month: "April", desktop: 73, mobile: 190 },
			{ month: "May", desktop: 209, mobile: 130 },
			{ month: "June", desktop: 214, mobile: 140 }
		];

		const lineChartConfig = {
			desktop: { label: "Desktop", color: "var(--chart-1)" },
			mobile: { label: "Mobile", color: "var(--chart-2)" }
		};

		Example($$renderer, {
			title: 'Line Chart',
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
													$$renderer.push(`<!---->Line Chart - Multiple`);
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
												config: lineChartConfig,
												children: ($$renderer) => {
													{
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
															data: lineChartData,
															x: 'month',
															xScale: scaleBand(),
															axis: 'x',
															series: [
																{
																	key: "desktop",
																	label: "Desktop",
																	color: lineChartConfig.desktop.color
																},

																{
																	key: "mobile",
																	label: "Mobile",
																	color: lineChartConfig.mobile.color
																}
															],
															props: {
																spline: { curve: curveMonotoneX, strokeWidth: 2, motion: "tween" },
																xAxis: { format: (d) => d.slice(0, 3), tickLength: 0 },
																highlight: { points: false }
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
			},
			$$slots: { default: true }
		});
	});
}