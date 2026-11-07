import * as $ from 'svelte/internal/server';
import { ArcChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Chart_radial_example($$renderer) {
	const radialChartData = [
		{
			browser: "safari",
			visitors: 1260,
			fill: "var(--color-safari)"
		}
	];

	const radialChartConfig = {
		visitors: { label: "Visitors" },
		safari: { label: "Safari", color: "var(--chart-2)" }
	};

	Example($$renderer, {
		title: 'Radial Chart',
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
								class: 'flex-1 pb-0',
								children: ($$renderer) => {
									if (Chart.Container) {
										$$renderer.push('<!--[-->');

										Chart.Container($$renderer, {
											config: radialChartConfig,
											class: 'mx-auto aspect-square max-h-[210px]',
											children: ($$renderer) => {
												{
													function belowMarks($$renderer) {
														$$renderer.push(`<circle cx="0" cy="0" r="80" class="fill-background"></circle>`);
													}

													function aboveMarks($$renderer) {
														Text($$renderer, {
															value: String(radialChartData[0].visitors),
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
														maxValue: radialChartData[0].visitors * 4,
														series: radialChartData.map((d) => ({ key: d.browser, color: d.fill, data: [d] })),
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
								class: 'flex-col gap-2',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex items-center gap-2 leading-none font-medium">Trending up by 5.2% this month `);

									IconPlaceholder($$renderer, {
										lucide: 'TrendingUpIcon',
										tabler: 'IconTrendingUp',
										hugeicons: 'ChartUpIcon',
										phosphor: 'TrendUpIcon',
										remixicon: 'RiLineChartLine',
										class: 'size-4'
									});

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
		},
		$$slots: { default: true }
	});
}