import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { scaleBand } from "d3-scale";
import { BarChart } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_bar_mixed($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{
				browser: "chrome",
				visitors: 275,
				color: "var(--color-chrome)"
			},

			{
				browser: "safari",
				visitors: 200,
				color: "var(--color-safari)"
			},

			{
				browser: "firefox",
				visitors: 187,
				color: "var(--color-firefox)"
			},
			{ browser: "edge", visitors: 173, color: "var(--color-edge)" },
			{ browser: "other", visitors: 90, color: "var(--color-other)" }
		];

		const chartConfig = {
			visitors: { label: "Visitors" },
			chrome: { label: "Chrome", color: "var(--chart-1)" },
			safari: { label: "Safari", color: "var(--chart-2)" },
			firefox: { label: "Firefox", color: "var(--chart-3)" },
			edge: { label: "Edge", color: "var(--chart-4)" },
			other: { label: "Other", color: "var(--chart-5)" }
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
											$$renderer.push(`<!---->Bar Chart - Mixed`);
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
														Chart.Tooltip($$renderer, { hideLabel: true, nameKey: 'visitors' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												BarChart($$renderer, {
													data: chartData,
													orientation: 'horizontal',
													yScale: scaleBand().padding(0.25),
													y: 'browser',
													x: 'visitors',
													cRange: chartData.map((c) => c.color),
													c: 'color',
													padding: { left: 48 },
													grid: false,
													rule: false,
													axis: 'y',
													props: {
														bars: {
															stroke: "none",
															radius: 5,
															rounded: "all",
															motion: { type: "tween", duration: 500, easing: cubicInOut }
														},
														highlight: { area: { fill: "none" } },
														yAxis: {
															format: (d) => chartConfig[d].label,
															tickLabelProps: { svgProps: { x: -16 } }
														}
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