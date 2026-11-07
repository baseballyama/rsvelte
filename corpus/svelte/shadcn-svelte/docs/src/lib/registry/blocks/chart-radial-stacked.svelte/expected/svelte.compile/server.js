import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";

export default function Chart_radial_stacked($$renderer) {
	const chartData = [{ month: "january", desktop: 1260, mobile: 570 }];

	const chartConfig = {
		desktop: { label: "Desktop", color: "var(--chart-1)" },
		mobile: { label: "Mobile", color: "var(--chart-2)" }
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
										$$renderer.push(`<!---->Radial Chart - Stacked`);
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
											function aboveMarks($$renderer) {
												Text($$renderer, {
													value: String(chartData[0].desktop + chartData[0].mobile),
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-foreground text-2xl! font-bold',
													dy: -24
												});

												$$renderer.push(`<!----> `);

												Text($$renderer, {
													value: 'Visitors',
													textAnchor: 'middle',
													verticalAnchor: 'middle',
													class: 'fill-muted-foreground! text-muted-foreground',
													dy: -4
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
												data: [
													{
														platform: "mobile",
														visitors: 570,
														color: chartConfig.mobile.color
													},

													{
														platform: "desktop",
														visitors: 1260,
														color: chartConfig.desktop.color
													}
												],
												key: 'platform',
												value: 'visitors',
												c: 'color',
												innerRadius: 76,
												padding: 29,
												range: [-90, 90],
												props: { pie: { sort: null } },
												cornerRadius: 4,
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