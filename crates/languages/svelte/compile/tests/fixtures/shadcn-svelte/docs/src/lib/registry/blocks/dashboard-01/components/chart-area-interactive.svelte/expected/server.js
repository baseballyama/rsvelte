import * as $ from 'svelte/internal/server';
import { scaleUtc } from "d3-scale";
import { curveNatural } from "d3-shape";
import { Area, AreaChart } from "layerchart";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";

export default function Chart_area_interactive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const chartData = [
			{ date: new Date("2024-04-01"), desktop: 222, mobile: 150 },
			{ date: new Date("2024-04-02"), desktop: 97, mobile: 180 },
			{ date: new Date("2024-04-03"), desktop: 167, mobile: 120 },
			{ date: new Date("2024-04-04"), desktop: 242, mobile: 260 },
			{ date: new Date("2024-04-05"), desktop: 373, mobile: 290 },
			{ date: new Date("2024-04-06"), desktop: 301, mobile: 340 },
			{ date: new Date("2024-04-07"), desktop: 245, mobile: 180 },
			{ date: new Date("2024-04-08"), desktop: 409, mobile: 320 },
			{ date: new Date("2024-04-09"), desktop: 59, mobile: 110 },
			{ date: new Date("2024-04-10"), desktop: 261, mobile: 190 },
			{ date: new Date("2024-04-11"), desktop: 327, mobile: 350 },
			{ date: new Date("2024-04-12"), desktop: 292, mobile: 210 },
			{ date: new Date("2024-04-13"), desktop: 342, mobile: 380 },
			{ date: new Date("2024-04-14"), desktop: 137, mobile: 220 },
			{ date: new Date("2024-04-15"), desktop: 120, mobile: 170 },
			{ date: new Date("2024-04-16"), desktop: 138, mobile: 190 },
			{ date: new Date("2024-04-17"), desktop: 446, mobile: 360 },
			{ date: new Date("2024-04-18"), desktop: 364, mobile: 410 },
			{ date: new Date("2024-04-19"), desktop: 243, mobile: 180 },
			{ date: new Date("2024-04-20"), desktop: 89, mobile: 150 },
			{ date: new Date("2024-04-21"), desktop: 137, mobile: 200 },
			{ date: new Date("2024-04-22"), desktop: 224, mobile: 170 },
			{ date: new Date("2024-04-23"), desktop: 138, mobile: 230 },
			{ date: new Date("2024-04-24"), desktop: 387, mobile: 290 },
			{ date: new Date("2024-04-25"), desktop: 215, mobile: 250 },
			{ date: new Date("2024-04-26"), desktop: 75, mobile: 130 },
			{ date: new Date("2024-04-27"), desktop: 383, mobile: 420 },
			{ date: new Date("2024-04-28"), desktop: 122, mobile: 180 },
			{ date: new Date("2024-04-29"), desktop: 315, mobile: 240 },
			{ date: new Date("2024-04-30"), desktop: 454, mobile: 380 },
			{ date: new Date("2024-05-01"), desktop: 165, mobile: 220 },
			{ date: new Date("2024-05-02"), desktop: 293, mobile: 310 },
			{ date: new Date("2024-05-03"), desktop: 247, mobile: 190 },
			{ date: new Date("2024-05-04"), desktop: 385, mobile: 420 },
			{ date: new Date("2024-05-05"), desktop: 481, mobile: 390 },
			{ date: new Date("2024-05-06"), desktop: 498, mobile: 520 },
			{ date: new Date("2024-05-07"), desktop: 388, mobile: 300 },
			{ date: new Date("2024-05-08"), desktop: 149, mobile: 210 },
			{ date: new Date("2024-05-09"), desktop: 227, mobile: 180 },
			{ date: new Date("2024-05-10"), desktop: 293, mobile: 330 },
			{ date: new Date("2024-05-11"), desktop: 335, mobile: 270 },
			{ date: new Date("2024-05-12"), desktop: 197, mobile: 240 },
			{ date: new Date("2024-05-13"), desktop: 197, mobile: 160 },
			{ date: new Date("2024-05-14"), desktop: 448, mobile: 490 },
			{ date: new Date("2024-05-15"), desktop: 473, mobile: 380 },
			{ date: new Date("2024-05-16"), desktop: 338, mobile: 400 },
			{ date: new Date("2024-05-17"), desktop: 499, mobile: 420 },
			{ date: new Date("2024-05-18"), desktop: 315, mobile: 350 },
			{ date: new Date("2024-05-19"), desktop: 235, mobile: 180 },
			{ date: new Date("2024-05-20"), desktop: 177, mobile: 230 },
			{ date: new Date("2024-05-21"), desktop: 82, mobile: 140 },
			{ date: new Date("2024-05-22"), desktop: 81, mobile: 120 },
			{ date: new Date("2024-05-23"), desktop: 252, mobile: 290 },
			{ date: new Date("2024-05-24"), desktop: 294, mobile: 220 },
			{ date: new Date("2024-05-25"), desktop: 201, mobile: 250 },
			{ date: new Date("2024-05-26"), desktop: 213, mobile: 170 },
			{ date: new Date("2024-05-27"), desktop: 420, mobile: 460 },
			{ date: new Date("2024-05-28"), desktop: 233, mobile: 190 },
			{ date: new Date("2024-05-29"), desktop: 78, mobile: 130 },
			{ date: new Date("2024-05-30"), desktop: 340, mobile: 280 },
			{ date: new Date("2024-05-31"), desktop: 178, mobile: 230 },
			{ date: new Date("2024-06-01"), desktop: 178, mobile: 200 },
			{ date: new Date("2024-06-02"), desktop: 470, mobile: 410 },
			{ date: new Date("2024-06-03"), desktop: 103, mobile: 160 },
			{ date: new Date("2024-06-04"), desktop: 439, mobile: 380 },
			{ date: new Date("2024-06-05"), desktop: 88, mobile: 140 },
			{ date: new Date("2024-06-06"), desktop: 294, mobile: 250 },
			{ date: new Date("2024-06-07"), desktop: 323, mobile: 370 },
			{ date: new Date("2024-06-08"), desktop: 385, mobile: 320 },
			{ date: new Date("2024-06-09"), desktop: 438, mobile: 480 },
			{ date: new Date("2024-06-10"), desktop: 155, mobile: 200 },
			{ date: new Date("2024-06-11"), desktop: 92, mobile: 150 },
			{ date: new Date("2024-06-12"), desktop: 492, mobile: 420 },
			{ date: new Date("2024-06-13"), desktop: 81, mobile: 130 },
			{ date: new Date("2024-06-14"), desktop: 426, mobile: 380 },
			{ date: new Date("2024-06-15"), desktop: 307, mobile: 350 },
			{ date: new Date("2024-06-16"), desktop: 371, mobile: 310 },
			{ date: new Date("2024-06-17"), desktop: 475, mobile: 520 },
			{ date: new Date("2024-06-18"), desktop: 107, mobile: 170 },
			{ date: new Date("2024-06-19"), desktop: 341, mobile: 290 },
			{ date: new Date("2024-06-20"), desktop: 408, mobile: 450 },
			{ date: new Date("2024-06-21"), desktop: 169, mobile: 210 },
			{ date: new Date("2024-06-22"), desktop: 317, mobile: 270 },
			{ date: new Date("2024-06-23"), desktop: 480, mobile: 530 },
			{ date: new Date("2024-06-24"), desktop: 132, mobile: 180 },
			{ date: new Date("2024-06-25"), desktop: 141, mobile: 190 },
			{ date: new Date("2024-06-26"), desktop: 434, mobile: 380 },
			{ date: new Date("2024-06-27"), desktop: 448, mobile: 490 },
			{ date: new Date("2024-06-28"), desktop: 149, mobile: 200 },
			{ date: new Date("2024-06-29"), desktop: 103, mobile: 160 },
			{ date: new Date("2024-06-30"), desktop: 446, mobile: 400 }
		];

		let timeRange = "90d";

		const selectedLabel = $.derived(() => {
			switch (timeRange) {
				case "90d":
					return "Last 3 months";

				case "30d":
					return "Last 30 days";

				case "7d":
					return "Last 7 days";

				default:
					return "Last 3 months";
			}
		});

		const filteredData = $.derived(() => chartData.filter((item) => {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			const referenceDate = new Date("2024-06-30");

			let daysToSubtract = 90;

			if (timeRange === "30d") {
				daysToSubtract = 30;
			} else if (timeRange === "7d") {
				daysToSubtract = 7;
			}

			referenceDate.setDate(referenceDate.getDate() - daysToSubtract);

			return item.date >= referenceDate;
		}));

		const chartConfig = {
			desktop: { label: "Desktop", color: "var(--primary)" },
			mobile: { label: "Mobile", color: "var(--primary)" }
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: '@container/card',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Total Visitors`);
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
												$$renderer.push(`<span class="hidden @[540px]/card:block">Total for the last 3 months</span> <span class="@[540px]/card:hidden">Last 3 months</span>`);
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
												if (ToggleGroup.Root) {
													$$renderer.push('<!--[-->');

													ToggleGroup.Root($$renderer, {
														type: 'single',
														variant: 'outline',
														class: 'hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex',
														get value() {
															return timeRange;
														},

														set value($$value) {
															timeRange = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															if (ToggleGroup.Item) {
																$$renderer.push('<!--[-->');

																ToggleGroup.Item($$renderer, {
																	value: '90d',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Last 3 months`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (ToggleGroup.Item) {
																$$renderer.push('<!--[-->');

																ToggleGroup.Item($$renderer, {
																	value: '30d',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Last 30 days`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (ToggleGroup.Item) {
																$$renderer.push('<!--[-->');

																ToggleGroup.Item($$renderer, {
																	value: '7d',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->Last 7 days`);
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

												if (Select.Root) {
													$$renderer.push('<!--[-->');

													Select.Root($$renderer, {
														type: 'single',
														get value() {
															return timeRange;
														},

														set value($$value) {
															timeRange = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															if (Select.Trigger) {
																$$renderer.push('<!--[-->');

																Select.Trigger($$renderer, {
																	size: 'sm',
																	class: 'flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden',
																	'aria-label': 'Select a value',
																	children: ($$renderer) => {
																		$$renderer.push(`<span data-slot="select-value">${$.escape(selectedLabel())}</span>`);
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
																	class: 'rounded-xl',
																	children: ($$renderer) => {
																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: '90d',
																				class: 'rounded-lg',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Last 3 months`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: '30d',
																				class: 'rounded-lg',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Last 30 days`);
																				},
																				$$slots: { default: true }
																			});

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}

																		$$renderer.push(` `);

																		if (Select.Item) {
																			$$renderer.push('<!--[-->');

																			Select.Item($$renderer, {
																				value: '7d',
																				class: 'rounded-lg',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->Last 7 days`);
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
								class: 'px-2 pt-4 sm:px-6 sm:pt-6',
								children: ($$renderer) => {
									if (Chart.Container) {
										$$renderer.push('<!--[-->');

										Chart.Container($$renderer, {
											config: chartConfig,
											class: 'aspect-auto h-[250px] w-full',
											children: ($$renderer) => {
												{
													function marks($$renderer, { context }) {
														$$renderer.push(`<defs><linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="var(--color-desktop)"${$.attr('stop-opacity', 1.0)}></stop><stop offset="95%" stop-color="var(--color-desktop)"${$.attr('stop-opacity', 0.1)}></stop></linearGradient><linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stop-color="var(--color-mobile)"${$.attr('stop-opacity', 0.8)}></stop><stop offset="95%" stop-color="var(--color-mobile)"${$.attr('stop-opacity', 0.1)}></stop></linearGradient></defs><!--[-->`);

														const each_array = $.ensure_array_like(context.series.visibleSeries);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let s = each_array[$$index];

															Area($$renderer, $.spread_props([
																{
																	seriesKey: s.key,
																	curve: curveNatural,
																	fillOpacity: 0.4,
																	line: { class: "stroke-1" },
																	motion: 'tween'
																},
																s.props,
																{
																	fill: s.key === "desktop" ? "url(#fillDesktop)" : "url(#fillMobile)"
																}
															]));
														}

														$$renderer.push(`<!--]-->`);
													}

													function tooltip($$renderer) {
														if (Chart.Tooltip) {
															$$renderer.push('<!--[-->');

															Chart.Tooltip($$renderer, {
																labelFormatter: (v) => {
																	return v.toLocaleDateString("en-US", { month: "short", day: "numeric" });
																},
																indicator: 'line'
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													AreaChart($$renderer, {
														legend: true,
														data: filteredData(),
														x: 'date',
														xScale: scaleUtc(),
														series: [
															{
																key: "mobile",
																label: "Mobile",
																color: chartConfig.mobile.color
															},

															{
																key: "desktop",
																label: "Desktop",
																color: chartConfig.desktop.color
															}
														],
														seriesLayout: 'stack',
														props: {
															xAxis: {
																ticks: timeRange === "7d" ? 7 : undefined,
																format: (v) => {
																	return v.toLocaleDateString("en-US", { month: "short", day: "numeric" });
																}
															},
															yAxis: { format: () => "" }
														},
														marks,
														tooltip,
														$$slots: { marks: true, tooltip: true }
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
	});
}