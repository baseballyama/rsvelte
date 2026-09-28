import * as $ from 'svelte/internal/server';
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Separator } from "$lib/registry/ui/separator/index.js";

export default function Savings_progress($$renderer) {
	const chartData = [
		{ name: "saved", value: 24000, color: "var(--color-saved)" },
		{
			name: "remaining",
			value: 6000,
			color: "var(--color-remaining)"
		}
	];

	const chartConfig = {
		saved: { label: "Saved", color: "var(--chart-2)" },
		remaining: { label: "Remaining", color: "var(--chart-1)" }
	};

	if (Card.Root) {
		$$renderer.push('<!--[-->');

		Card.Root($$renderer, {
			children: ($$renderer) => {
				if (Card.Content) {
					$$renderer.push('<!--[-->');

					Card.Content($$renderer, {
						children: ($$renderer) => {
							if (Chart.Container) {
								$$renderer.push('<!--[-->');

								Chart.Container($$renderer, {
									config: chartConfig,
									class: 'mx-auto aspect-square max-h-[220px]',
									children: ($$renderer) => {
										{
											function aboveMarks($$renderer) {
												Text($$renderer, {
													value: '$24,000',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-foreground text-2xl! font-bold',
													dy: -8
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: '80% of $30,000',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: 14
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
												data: chartData,
												key: 'name',
												value: 'value',
												c: 'color',
												innerRadius: 0.8,
												padding: 28,
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
						class: 'flex-col gap-0',
						children: ($$renderer) => {
							$$renderer.push(`<div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Projected Finish</span> <span class="text-sm font-semibold">October 2024</span></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Monthly Average</span> <span class="text-sm font-semibold tabular-nums">$1,250</span></div> `);
							Separator($$renderer, {});
							$$renderer.push(`<!----> <div class="flex w-full items-center justify-between py-3"><span class="text-sm text-muted-foreground">Top Contributor</span> <span class="text-sm font-semibold">Auto-Transfer</span></div>`);
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