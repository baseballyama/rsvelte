import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { Arc, PieChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_pie_stacked($$renderer) {
	const desktopData = [
		{
			month: "january",
			desktop: 186,
			color: "var(--color-january)"
		},

		{
			month: "february",
			desktop: 305,
			color: "var(--color-february)"
		},
		{ month: "march", desktop: 237, color: "var(--color-march)" },
		{ month: "april", desktop: 173, color: "var(--color-april)" },
		{ month: "may", desktop: 209, color: "var(--color-may)" }
	];

	const mobileData = [
		{ month: "january", mobile: 80, color: "var(--color-january)" },
		{
			month: "february",
			mobile: 200,
			color: "var(--color-february)"
		},
		{ month: "march", mobile: 120, color: "var(--color-march)" },
		{ month: "april", mobile: 190, color: "var(--color-april)" },
		{ month: "may", mobile: 130, color: "var(--color-may)" }
	];

	const monthOrder = ["january", "february", "march", "april", "may"];

	const sortMonths = (a, b) => {
		return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
	};

	const chartConfig = {
		desktop: { label: "Desktop" },
		mobile: { label: "Mobile" },
		january: { label: "January", color: "var(--chart-1)" },
		february: { label: "February", color: "var(--chart-2)" },
		march: { label: "March", color: "var(--chart-3)" },
		april: { label: "April", color: "var(--chart-4)" },
		may: { label: "May", color: "var(--chart-5)" }
	};

	const tooltipLabelFormatter = (_, payload) => {
		return chartConfig[payload?.[0].key].label;
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
										$$renderer.push(`<!---->Pie Chart - Stacked`);
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
											function arc($$renderer, { props }) {
												Arc($$renderer, $.spread_props([props, { fill: props.data.color }]));
											}

											function tooltip($$renderer) {
												if (Chart.Tooltip) {
													$$renderer.push('<!--[-->');

													Chart.Tooltip($$renderer, {
														nameKey: 'month',
														indicator: 'line',
														labelFormatter: tooltipLabelFormatter
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}
											}

											PieChart($$renderer, {
												key: 'month',
												label: 'month',
												c: 'color',
												props: {
													pie: { sort: sortMonths, motion: "tween" },
													tooltip: { context: { hideDelay: 250 } }
												},
												series: [
													{
														key: "desktop",
														value: "value",
														data: desktopData.map((d) => ({ month: d.month, value: d.desktop, color: d.color })),
														props: { innerRadius: -20 }
													},

													{
														key: "mobile",
														value: "value",
														data: mobileData.map((d) => ({ month: d.month, value: d.mobile, color: d.color })),
														props: { outerRadius: -30 }
													}
												],
												padding: 29,
												arc,
												tooltip,
												$$slots: { arc: true, tooltip: true }
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