import * as $ from 'svelte/internal/server';
import { curveLinear } from "d3-shape";
import { AreaChart, Area } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import { Badge } from "$lib/registry/ui/badge/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Analytics_card($$renderer) {
	const chartData = [
		{ month: "January", visitors: 186 },
		{ month: "February", visitors: 305 },
		{ month: "March", visitors: 237 },
		{ month: "April", visitors: 73 },
		{ month: "May", visitors: 209 },
		{ month: "June", visitors: 214 }
	];

	const chartConfig = { visitors: { label: "Visitors", color: "var(--chart-1)" } };

	Example($$renderer, {
		title: 'Analytics Card',
		class: 'justify-center',
		children: ($$renderer) => {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: 'mx-auto w-full max-w-sm data-[size=sm]:pb-0',
					size: 'sm',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Analytics`);
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
												$$renderer.push(`<!---->418.2K Visitors `);

												Badge($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->+10%`);
													},
													$$slots: { default: true }
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

									$$renderer.push(` `);

									if (Card.Action) {
										$$renderer.push('<!--[-->');

										Card.Action($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													size: 'sm',
													children: ($$renderer) => {
														$$renderer.push(`<!---->View Analytics`);
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

						if (Chart.Container) {
							$$renderer.push('<!--[-->');

							Chart.Container($$renderer, {
								config: chartConfig,
								class: 'aspect-[1/0.35]',
								children: ($$renderer) => {
									{
										function tooltip($$renderer) {
											if (Chart.Tooltip) {
												$$renderer.push('<!--[-->');
												Chart.Tooltip($$renderer, { indicator: 'line', hideLabel: true });
												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}
										}

										function marks($$renderer, { context }) {
											$$renderer.push(`<!--[-->`);

											const each_array = $.ensure_array_like(context.series.visibleSeries);

											for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
												let s = each_array[$$index];

												Area($$renderer, $.spread_props([
													{
														seriesKey: s.key,
														curve: curveLinear,
														fillOpacity: 0.4,
														line: { class: "stroke-1" }
													},
													s.props
												]));
											}

											$$renderer.push(`<!--]-->`);
										}

										AreaChart($$renderer, {
											data: chartData,
											x: 'month',
											series: [
												{
													key: "visitors",
													label: "Visitors",
													color: chartConfig.visitors.color
												}
											],
											props: { xAxis: { format: () => "" }, yAxis: { format: () => "" } },
											tooltip,
											marks,
											$$slots: { tooltip: true, marks: true }
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
		},
		$$slots: { default: true }
	});
}