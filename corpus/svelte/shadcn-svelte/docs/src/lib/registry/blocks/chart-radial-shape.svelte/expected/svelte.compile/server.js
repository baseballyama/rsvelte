import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { ArcChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_radial_shape($$renderer) {
	const chartData = [
		{
			browser: "safari",
			visitors: 1260,
			color: "var(--color-safari)"
		}
	];

	const chartConfig = {
		visitors: { label: "Visitors" },
		safari: { label: "Safari", color: "var(--chart-2)" }
	};

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
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
										$$renderer.push(`<!---->Radial Chart - Shape`);
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
						class: 'flex-1',
						children: ($$renderer) => {
							if (Chart.Container) {
								$$renderer.push('<!--[-->');

								Chart.Container($$renderer, {
									config: chartConfig,
									class: 'mx-auto aspect-square max-h-[250px]',
									children: ($$renderer) => {
										{
											function belowMarks($$renderer) {
												$$renderer.push(`<circle cx="0" cy="0" r="80" class="fill-background"></circle>`);
											}

											function aboveMarks($$renderer) {
												Text($$renderer, {
													value: String(chartData[0].visitors),
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-foreground text-4xl! font-bold',
													dy: 3
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground!',
													dy: 22
												});

												$$renderer.push(`<!---->`);
											}

											ArcChart($$renderer, {
												label: 'browser',
												value: 'visitors',
												outerRadius: 88,
												innerRadius: 66,
												trackOuterRadius: 83,
												trackInnerRadius: 72,
												padding: 40,
												range: [90, -270],
												maxValue: chartData[0].visitors * 4,
												series: chartData.map((d) => ({ key: d.browser, color: d.color, data: [d] })),
												props: {
													arc: { track: { fill: "var(--muted)" }, motion: "tween" },
													tooltip: { context: { hideDelay: 350 } }
												},
												tooltipContext: false,
												belowMarks,
												aboveMarks,
												$$slots: { belowMarks: true, aboveMarks: true }
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
							$$renderer.push(`<!----></div> <div class="flex items-center gap-2 leading-none text-muted-foreground">January - June 2024</div>`);
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