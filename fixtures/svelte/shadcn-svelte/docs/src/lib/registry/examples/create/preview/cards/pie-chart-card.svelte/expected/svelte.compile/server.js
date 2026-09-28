import * as $ from 'svelte/internal/server';
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Progress } from "$lib/registry/ui/progress/index.js";

export default function Pie_chart_card($$renderer) {
	const pieChartData = [
		{
			browser: "Chrome",
			visitors: 275,
			color: "var(--color-Chrome)"
		},

		{
			browser: "Safari",
			visitors: 200,
			color: "var(--color-Safari)"
		},

		{
			browser: "Firefox",
			visitors: 287,
			color: "var(--color-Firefox)"
		},
		{ browser: "Edge", visitors: 173, color: "var(--color-Edge)" }
	];

	const pieChartConfig = {
		Visitors: { label: "Visitors" },
		Chrome: { label: "Chrome", color: "var(--chart-1)" },
		Safari: { label: "Safari", color: "var(--chart-2)" },
		Firefox: { label: "Firefox", color: "var(--chart-3)" },
		Edge: { label: "Edge", color: "var(--chart-4)" }
	};

	const totalVisitors = $.derived(() => pieChartData.reduce((sum, item) => sum + item.visitors, 0));
	const topBrowser = $.derived(() => pieChartData.reduce((max, item) => item.visitors > max.visitors ? item : max));
	const topBrowserShare = $.derived(() => Math.round(topBrowser().visitors / totalVisitors() * 100));
	const topBrowserLabel = $.derived(() => pieChartConfig[topBrowser().browser]?.label ?? "Top");

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Header) {
					$$renderer.push('<!--[-->');

					Card.Header($$renderer, {
						class: 'pb-0',
						children: ($$renderer) => {
							if (Card.Title) {
								$$renderer.push('<!--[-->');

								Card.Title($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Browser Share`);
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
										$$renderer.push(`<!---->January - June 2026`);
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
											variant: 'outline',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(topBrowserLabel())}`);
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
						class: 'pt-0',
						children: ($$renderer) => {
							if (Chart.Container) {
								$$renderer.push('<!--[-->');

								Chart.Container($$renderer, {
									config: pieChartConfig,
									class: 'mx-auto aspect-square max-h-[190px]',
									children: ($$renderer) => {
										{
											function aboveMarks($$renderer) {
												Text($$renderer, {
													value: String(totalVisitors()),
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-foreground text-3xl! font-bold',
													dy: 3
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: 22
												});

												$$renderer.push(`<!---->`);
											}

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

											PieChart($$renderer, {
												data: pieChartData,
												key: 'browser',
												value: 'visitors',
												c: 'color',
												innerRadius: 0.8,
												padding: 28,
												props: { pie: { motion: "tween" } },
												aboveMarks,
												tooltip,
												$$slots: { aboveMarks: true, tooltip: true }
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
						class: 'flex-col items-stretch gap-2',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex items-center text-xs"><span class="font-medium">${$.escape(topBrowserLabel())}</span> <span class="ml-auto text-muted-foreground tabular-nums">${$.escape(topBrowserShare())}%</span></div> `);

							Progress($$renderer, {
								value: topBrowserShare(),
								class: '**:data-[slot=progress-indicator]:bg-chart-3'
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
}