import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { Arc, PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_pie_label($$renderer) {
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
			class: 'flex flex-col',
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						class: 'items-center',
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Pie Chart - Label`);
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
						class: 'flex-1',
						children: ($$renderer) => {
							if (Chart.Container) {
								$$renderer.push('<!--[-->');

								Chart.Container($$renderer, {
									config: chartConfig,
									class: 'mx-auto aspect-square max-h-[250px]',
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

											function arc($$renderer, { props, visibleData, index }) {
												const browser = visibleData[index].browser;

												{
													function children($$renderer, { getArcTextProps }) {
														Text($$renderer, $.spread_props([
															{ value: browser },
															getArcTextProps("centroid"),
															{ 'font-size': '12', class: 'fill-background capitalize' }
														]));
													}

													Arc($$renderer, $.spread_props([props, { children, $$slots: { default: true } }]));
												}
											}

											PieChart($$renderer, {
												data: chartData,
												key: 'browser',
												value: 'visitors',
												cRange: chartData.map((d) => d.color),
												c: 'color',
												props: { pie: { motion: "tween" } },
												tooltip,
												arc,
												$$slots: { tooltip: true, arc: true }
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
						class: 'flex-col gap-2 text-sm',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month `);
							TrendingUpIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----></div> <div class="leading-none text-muted-foreground">Showing total visitors for the last 6 months</div>`);
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
}