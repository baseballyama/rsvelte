import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="text-sm">You had <span class="font-semibold"> </span> visitors for the month of June.</div>`);

export default function Calendar_27($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 5),
		end: new CalendarDate(2025, 6, 20)
	}));

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
		if (!$.get(value)?.start || !$.get(value)?.end) return chartData;

		return chartData.filter(({ date }) => {
			const dateObj = new Date(date);

			if (!$.get(value)) return true;

			const startDate = $.get(value).start.toDate(getLocalTimeZone());
			const endDate = $.get(value).end.toDate(getLocalTimeZone());

			// set end date to end of day to include the full day
			endDate.setHours(23, 59, 59, 999);

			return dateObj >= startDate && dateObj <= endDate;
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			class: '@container/card w-full max-w-xl',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'flex flex-col border-b @md/card:grid',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Web Analytics');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Showing total visitors for this month.');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									class: 'mt-2 @md/card:mt-0',
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = $.comment();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => Popover.Root, ($$anchor, Popover_Root) => {
											Popover_Root($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_1();
													var node_6 = $.first_child(fragment_4);

													{
														const child = ($$anchor, $$arg0) => {
															let props = () => ($$arg0?.()).props;

															Button($$anchor, $.spread_props(props, {
																variant: 'outline',
																children: ($$anchor, $$slotProps) => {
																	var fragment_6 = root();
																	var node_7 = $.first_child(fragment_6);

																	CalendarIcon(node_7, {});

																	var text_2 = $.sibling(node_7);

																	$.template_effect(($0) => $.set_text(text_2, ` ${$0 ?? ''}`), [
																		() => $.get(value)?.start && $.get(value)?.end
																			? `${$.get(value).start.toDate(getLocalTimeZone()).toLocaleDateString()} - ${$.get(value).end.toDate(getLocalTimeZone()).toLocaleDateString()}`
																			: "June 2025"
																	]);

																	$.append($$anchor, fragment_6);
																},
																$$slots: { default: true }
															}));
														};

														$.component(node_6, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
															Popover_Trigger($$anchor, { child, $$slots: { child: true } });
														});
													}

													var node_8 = $.sibling(node_6, 2);

													$.component(node_8, () => Popover.Content, ($$anchor, Popover_Content) => {
														Popover_Content($$anchor, {
															class: 'w-auto overflow-hidden p-0',
															align: 'end',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => new CalendarDate(2025, 6, 1));
																	let $1 = $.derived(() => new CalendarDate(2025, 6, 31));

																	RangeCalendar($$anchor, {
																		class: 'w-full',
																		fixedWeeks: true,
																		get minValue() {
																			return $.get($0);
																		},

																		get maxValue() {
																			return $.get($1);
																		},

																		get value() {
																			return $.get(value);
																		},

																		set value($$value) {
																			$.set(value, $$value, true);
																		}
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_9 = $.sibling(node_1, 2);

				$.component(node_9, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'px-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_10 = $.first_child(fragment_8);

							$.component(node_10, () => Chart.Container, ($$anchor, Chart_Container) => {
								Chart_Container($$anchor, {
									get config() {
										return chartConfig;
									},
									class: 'aspect-auto h-[250px] w-full',
									children: ($$anchor, $$slotProps) => {
										{
											const belowMarks = ($$anchor) => {
												Highlight($$anchor, { area: { class: "fill-muted" } });
											};

											const tooltip = ($$anchor) => {
												var fragment_11 = $.comment();
												var node_11 = $.first_child(fragment_11);

												$.component(node_11, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
													Chart_Tooltip($$anchor, {
														class: 'w-[150px]',
														nameKey: 'visitors',
														labelFormatter: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
													});
												});

												$.append($$anchor, fragment_11);
											};

											let $0 = $.derived(() => scaleBand().padding(0.25));

											let $1 = $.derived(() => ({
												bars: {
													stroke: "none",
													rounded: "all",
													radius: 4,
													motion: { type: "tween", duration: 500, easing: cubicInOut }
												},
												xAxis: {
													format: (d) => d.toLocaleDateString("en-US", { day: "numeric" })
												}
											}));

											BarChart($$anchor, {
												get data() {
													return $.get(filteredData);
												},

												get xScale() {
													return $.get($0);
												},
												x: 'date',
												axis: 'x',
												y: 'visitors',
												get props() {
													return $.get($1);
												},
												belowMarks,
												tooltip,
												$$slots: { belowMarks: true, tooltip: true }
											});
										}
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_9, 2);

				$.component(node_12, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: 'border-t',
						children: ($$anchor, $$slotProps) => {
							var div = root_3();
							var span = $.sibling($.child(div));
							var text_3 = $.only_child(span, true);

							$.next();
							$.reset(div);
							$.template_effect(($0) => $.set_text(text_3, $0), [() => total.toLocaleString()]);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}