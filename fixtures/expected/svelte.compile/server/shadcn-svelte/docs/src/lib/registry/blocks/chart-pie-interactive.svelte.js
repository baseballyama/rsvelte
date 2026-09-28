import * as $ from 'svelte/internal/server';
import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
import { Arc, PieChart, Text } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import ChartStyle from "../ui/chart/chart-style.svelte";

export default function Chart_pie_interactive($$renderer) {
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

	const chartConfig = {
		desktop: { label: "Desktop" },
		january: { label: "January", color: "var(--chart-1)" },
		february: { label: "February", color: "var(--chart-2)" },
		march: { label: "March", color: "var(--chart-3)" },
		april: { label: "April", color: "var(--chart-4)" },
		may: { label: "May", color: "var(--chart-5)" }
	};

	let activeMonth = desktopData[0].month;
	const id = "pie-interactive";
	const activeIndex = $.derived(() => desktopData.findIndex((item) => item.month === activeMonth));
	const months = $.derived(() => desktopData.map((item) => item.month));
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				'data-chart': id,
				class: 'flex flex-col',
				children: ($$renderer) => {
					ChartStyle($$renderer, { id, config: chartConfig });
					$$renderer.push(`<!----> `);

					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							class: 'flex flex-row items-start space-y-0 pb-0',
							children: ($$renderer) => {
								$$renderer.push(`<div class="grid gap-1">`);

								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Pie Chart - Interactive`);
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

								$$renderer.push(`</div> `);

								if (Select.Root) {
									$$renderer.push('<!--[-->');

									Select.Root($$renderer, {
										type: 'single',
										get value() {
											return activeMonth;
										},

										set value($$value) {
											activeMonth = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (Select.Trigger) {
												$$renderer.push('<!--[-->');

												Select.Trigger($$renderer, {
													class: 'ms-auto h-7 w-[130px] rounded-lg ps-2.5 text-sm',
													'aria-label': 'Select a value',
													children: ($$renderer) => {
														$$renderer.push(`<span class="flex h-3 w-3 shrink-0 rounded-sm"${$.attr_style('', { 'background-color': `var(--color-${activeMonth})` })}></span> ${$.escape(activeMonth ? chartConfig[activeMonth].label : "Select month")}`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Select.Content) {
												$$renderer.push('<!--[-->');

												Select.Content($$renderer, {
													align: 'end',
													class: 'rounded-xl',
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(months());

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let month = each_array[$$index];
															const config = chartConfig[month];

															if (config) {
																$$renderer.push('<!--[0-->');

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: month,
																		label: config.label,
																		class: 'rounded-lg [&_span]:flex',
																		children: ($$renderer) => {
																			$$renderer.push(`<div class="flex items-center gap-2 text-xs">${$.escape(config?.label)}</div>`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]-->`);
														}

														$$renderer.push(`<!--]-->`);
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
										id,
										config: chartConfig,
										class: 'mx-auto aspect-square max-h-[250px]',
										children: ($$renderer) => {
											{
												function aboveMarks($$renderer) {
													Text($$renderer, {
														value: desktopData[activeIndex()].desktop.toLocaleString(),
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: 'fill-foreground !text-3xl font-bold',
														dy: 3
													});

													$$renderer.push(`<!----> `);

													Text($$renderer, {
														value: 'Visitors',
														textAnchor: 'middle',
														verticalAnchor: 'middle',
														class: '!fill-muted-foreground text-muted-foreground',
														dy: 22
													});

													$$renderer.push(`<!---->`);
												}

												function arc($$renderer, { props, index }) {
													const isActive = index === activeIndex();

													const arcProps = isActive
														? { ...props, outerRadius: 60, innerRadius: 105 }
														: props;

													if (isActive) {
														$$renderer.push(`<!--[0--><g>`);
														Arc($$renderer, $.spread_props([arcProps]));
														$$renderer.push(`<!---->`);
														Arc($$renderer, $.spread_props([arcProps, { outerRadius: 107, innerRadius: 119 }]));
														$$renderer.push(`<!----></g>`);
													} else {
														$$renderer.push('<!--[-1-->');
														Arc($$renderer, $.spread_props([arcProps]));
													}

													$$renderer.push(`<!--]-->`);
												}

												function tooltip($$renderer) {
													if (Chart.Tooltip) {
														$$renderer.push('<!--[-->');

														Chart.Tooltip($$renderer, {
															labelKey: 'visitors',
															nameKey: 'month',
															indicator: 'line',
															labelFormatter: (_, payload) => {
																return chartConfig[payload?.[0].key].label;
															}
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												PieChart($$renderer, {
													data: desktopData,
													label: 'month',
													key: 'month',
													value: 'desktop',
													c: 'color',
													props: {
														pie: {
															sort: (a, b) => {
																const monthOrder = ["january", "february", "march", "april", "may"];

																return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
															},
															motion: "tween"
														}
													},
													innerRadius: 60,
													padding: 29,
													aboveMarks,
													arc,
													tooltip,
													$$slots: { aboveMarks: true, arc: true, tooltip: true }
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}