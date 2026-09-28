import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { scaleBand } from "d3-scale";
import { BarChart, Highlight } from "layerchart";
import { cubicInOut } from "svelte/easing";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Chart from "$lib/registry/ui/chart/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Calendar_27($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 6, 5),
			end: new CalendarDate(2025, 6, 20)
		};

		const chartData = [
			{ date: new Date("2025-06-01"), visitors: 178 },
			{ date: new Date("2025-06-02"), visitors: 470 },
			{ date: new Date("2025-06-03"), visitors: 103 },
			{ date: new Date("2025-06-04"), visitors: 439 },
			{ date: new Date("2025-06-05"), visitors: 88 },
			{ date: new Date("2025-06-06"), visitors: 294 },
			{ date: new Date("2025-06-07"), visitors: 323 },
			{ date: new Date("2025-06-08"), visitors: 385 },
			{ date: new Date("2025-06-09"), visitors: 438 },
			{ date: new Date("2025-06-10"), visitors: 155 },
			{ date: new Date("2025-06-11"), visitors: 92 },
			{ date: new Date("2025-06-12"), visitors: 492 },
			{ date: new Date("2025-06-13"), visitors: 81 },
			{ date: new Date("2025-06-14"), visitors: 426 },
			{ date: new Date("2025-06-15"), visitors: 307 },
			{ date: new Date("2025-06-16"), visitors: 371 },
			{ date: new Date("2025-06-17"), visitors: 475 },
			{ date: new Date("2025-06-18"), visitors: 107 },
			{ date: new Date("2025-06-19"), visitors: 341 },
			{ date: new Date("2025-06-20"), visitors: 408 },
			{ date: new Date("2025-06-21"), visitors: 169 },
			{ date: new Date("2025-06-22"), visitors: 317 },
			{ date: new Date("2025-06-23"), visitors: 480 },
			{ date: new Date("2025-06-24"), visitors: 132 },
			{ date: new Date("2025-06-25"), visitors: 141 },
			{ date: new Date("2025-06-26"), visitors: 434 },
			{ date: new Date("2025-06-27"), visitors: 448 },
			{ date: new Date("2025-06-28"), visitors: 149 },
			{ date: new Date("2025-06-29"), visitors: 103 },
			{ date: new Date("2025-06-30"), visitors: 446 }
		];

		const total = chartData.reduce((acc, curr) => acc + curr.visitors, 0);

		const chartConfig = {
			visitors: { label: "Visitors", color: "var(--color-primary)" }
		};

		const filteredData = $.derived(() => {
			if (!value?.start || !value?.end) return chartData;

			return chartData.filter(({ date }) => {
				const dateObj = new Date(date);

				if (!value) return true;

				const startDate = value.start.toDate(getLocalTimeZone());
				const endDate = value.end.toDate(getLocalTimeZone());

				// set end date to end of day to include the full day
				endDate.setHours(23, 59, 59, 999);

				return dateObj >= startDate && dateObj <= endDate;
			});
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					class: '@container/card w-full max-w-xl',
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								class: 'flex flex-col border-b @md/card:grid',
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Web Analytics`);
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
												$$renderer.push(`<!---->Showing total visitors for this month.`);
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
											class: 'mt-2 @md/card:mt-0',
											children: ($$renderer) => {
												if (Popover.Root) {
													$$renderer.push('<!--[-->');

													Popover.Root($$renderer, {
														children: ($$renderer) => {
															{
																function child($$renderer, { props }) {
																	Button($$renderer, $.spread_props([
																		props,
																		{
																			variant: 'outline',
																			children: ($$renderer) => {
																				CalendarIcon($$renderer, {});

																				$$renderer.push(`<!----> ${$.escape(value?.start && value?.end
																					? `${value.start.toDate(getLocalTimeZone()).toLocaleDateString()} - ${value.end.toDate(getLocalTimeZone()).toLocaleDateString()}`
																					: "June 2025")}`);
																			},
																			$$slots: { default: true }
																		}
																	]));
																}

																if (Popover.Trigger) {
																	$$renderer.push('<!--[-->');
																	Popover.Trigger($$renderer, { child, $$slots: { child: true } });
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}

															$$renderer.push(` `);

															if (Popover.Content) {
																$$renderer.push('<!--[-->');

																Popover.Content($$renderer, {
																	class: 'w-auto overflow-hidden p-0',
																	align: 'end',
																	children: ($$renderer) => {
																		RangeCalendar($$renderer, {
																			class: 'w-full',
																			fixedWeeks: true,
																			minValue: new CalendarDate(2025, 6, 1),
																			maxValue: new CalendarDate(2025, 6, 31),
																			get value() {
																				return value;
																			},

																			set value($$value) {
																				value = $$value;
																				$$settled = false;
																			}
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
								class: 'px-4',
								children: ($$renderer) => {
									if (Chart.Container) {
										$$renderer.push('<!--[-->');

										Chart.Container($$renderer, {
											config: chartConfig,
											class: 'aspect-auto h-[250px] w-full',
											children: ($$renderer) => {
												{
													function belowMarks($$renderer) {
														Highlight($$renderer, { area: { class: "fill-muted" } });
													}

													function tooltip($$renderer) {
														if (Chart.Tooltip) {
															$$renderer.push('<!--[-->');

															Chart.Tooltip($$renderer, {
																class: 'w-[150px]',
																nameKey: 'visitors',
																labelFormatter: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													}

													BarChart($$renderer, {
														data: filteredData(),
														xScale: scaleBand().padding(0.25),
														x: 'date',
														axis: 'x',
														y: 'visitors',
														props: {
															bars: {
																stroke: "none",
																rounded: "all",
																radius: 4,
																motion: { type: "tween", duration: 500, easing: cubicInOut }
															},
															xAxis: {
																format: (d) => d.toLocaleDateString("en-US", { day: "numeric" })
															}
														},
														belowMarks,
														tooltip,
														$$slots: { belowMarks: true, tooltip: true }
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
								class: 'border-t',
								children: ($$renderer) => {
									$$renderer.push(`<div class="text-sm">You had <span class="font-semibold">${$.escape(total.toLocaleString())}</span> visitors for the month of June.</div>`);
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