import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount, untrack } from "svelte";
import * as Card from "$lib/components/ui/card/index.js";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import StatusBarCalendar from "$lib/components/StatusBarCalendar.svelte";
import LatencyTrendChart from "$lib/components/LatencyTrendChart.svelte";
import ChevronDown from "@lucide/svelte/icons/chevron-down";
import ArrowUp from "@lucide/svelte/icons/arrow-up";
import { Button } from "$lib/components/ui/button";
import { t } from "$lib/stores/i18n";
import { selectedTimezone } from "$lib/stores/timezone";
import { getEndOfDayAtTz } from "$lib/client/datetime";
import { formatDate } from "$lib/stores/datetime";
import { requestMonitorBar, clearMonitorBarCache } from "$lib/client/monitor-bar-client";
import * as Popover from "$lib/components/ui/popover/index.js";
import * as ToggleGroup from "$lib/components/ui/toggle-group/index.js";
import GroupMonitorPopover from "$lib/components/GroupMonitorPopover.svelte";
import { page } from "$app/state";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex items-center justify-between"><div><!> <!></div> <!></div>`);
var root_3 = $.from_html(`<div class="space-y-4"><div class="flex gap-4"><!> <!></div> <!> <div class="flex justify-between"><!> <!></div> <!></div>`);
var root_4 = $.from_html(`<div class="py-12 text-center"><p class="text-muted-foreground"> </p></div>`);
var root_5 = $.from_html(`<div class="flex justify-center"><!></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<p class="text-muted-foreground text-xs font-medium"> </p> <!>`, 1);
var root_8 = $.from_html(`<div class="flex gap-4"><div class="flex flex-1 flex-col items-start gap-1"><p class="text-2xl font-semibold"> </p> <p class="text-muted-foreground text-sm font-medium"> </p></div></div> <div class="flex flex-col gap-1"><!> <div class="flex justify-between"><p class="text-muted-foreground text-xs font-medium"><!></p> <p class="text-muted-foreground text-xs font-medium"><!></p></div></div> <!> <div class="pt-2"><p class="text-muted-foreground mb-2 text-sm font-medium"> <!></p> <div class="mb-3 flex justify-between gap-4"><div class="flex flex-col items-start gap-1"><p class="text-lg font-semibold"> </p> <p class="text-muted-foreground text-xs"> </p></div> <div class="flex flex-col items-center gap-1"><p class="text-lg font-semibold"> </p> <p class="text-muted-foreground text-xs"> </p></div> <div class="flex flex-col items-end gap-1"><p class="text-lg font-semibold"> </p> <p class="text-muted-foreground text-xs"> </p></div></div> <!></div>`, 1);

export default function MonitorOverview($$anchor, $$props) {
	$.push($$props, true);

	const $t = () => $.store_get(t, '$t', $$stores);
	const $selectedTimezone = () => $.store_get(selectedTimezone, '$selectedTimezone', $$stores);
	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	let className = $.prop($$props, 'class', 3, ""),
		maxDays = $.prop($$props, 'maxDays', 3, 90),
		groupTags = $.prop($$props, 'groupTags', 19, () => []);

	// State
	let loading = $.state(true);

	let overviewData = $.state(null);
	let error = $.state(null);

	// All possible day range options (ascending)
	const allDayOptions = [1, 7, 14, 30, 60, 90];

	// Filter options up to maxDays, always include maxDays itself
	let dayOptions = $.derived(() => {
		const filtered = allDayOptions.filter((d) => d <= maxDays());

		if (!filtered.includes(maxDays())) {
			filtered.push(maxDays());
		}

		// Sort descending for dropdown display
		filtered.sort((a, b) => b - a);

		return filtered.map((d) => ({
			days: d,
			text: `${d} ${d === 1 ? $t()("Day") : $t()("Days")}`
		}));
	});

	// Default to maxDays (first item since sorted descending)
	let selectedDayIndex = $.state(0);

	let selectedDays = $.derived(() => $.get(dayOptions)[$.get(selectedDayIndex)]?.days ?? maxDays());
	let endOfDayTodayAtTz = $.derived(() => getEndOfDayAtTz($selectedTimezone()));

	// Latency metric toggle: "average" | "maximum" | "minimum"
	let latencyMetric = $.state("average");

	// Display values from API response (already formatted as strings)
	let displayUptime = $.derived(() => $.get(overviewData)?.uptime ?? "--");

	let displayAvgLatency = $.derived(() => $.get(overviewData)?.avgLatency ?? "--");
	let displayMaxLatency = $.derived(() => $.get(overviewData)?.maxLatency ?? "--");
	let displayMinLatency = $.derived(() => $.get(overviewData)?.minLatency ?? "--");

	// Data for calendar/chart comes directly from API
	let displayData = $.derived(() => $.get(overviewData)?.uptimeData ?? []);

	// Latency metric label map
	const metricLabels = {
		average: $t()("Avg Latency"),
		maximum: $t()("Max Latency"),
		minimum: $t()("Min Latency")
	};

	// Transform uptimeData into chart-ready points based on selected metric
	let latencyChartData = $.derived(() => {
		if (!$.get(displayData)) return [];

		return $.get(displayData).map((d) => ({
			date: new Date(d.ts * 1000),
			value: $.get(latencyMetric) === "maximum"
				? d.maxLatency
				: $.get(latencyMetric) === "minimum" ? d.minLatency : d.avgLatency
		}));
	});

	let latencyChartLabel = $.derived(() => metricLabels[$.get(latencyMetric)] ?? metricLabels.average);

	// Fetch data with days parameter
	async function fetchData(days) {
		$.set(loading, true);
		$.set(error, null);

		try {
			$.set(overviewData, await requestMonitorBar($$props.monitorTag, days, $.get(endOfDayTodayAtTz)), true);
		} catch(e) {
			console.error("Failed to fetch monitor data:", e);
			$.set(error, e instanceof Error ? e.message : "Failed to load data", true);
		} finally {
			$.set(loading, false);
		}
	}

	// Handle dropdown selection
	function handleDayChange(index) {
		if (index !== $.get(selectedDayIndex)) {
			$.set(selectedDayIndex, index, true);

			// Evict cache so the new range fetches fresh data
			clearMonitorBarCache();

			fetchData($.get(dayOptions)[index].days);
		}
	}

	onMount(() => {
		fetchData($.get(dayOptions)[$.get(selectedDayIndex)].days);
	});

	// Re-fetch when timezone changes
	let initialLoad = true;

	$.user_effect(() => {
		// Track only the timezone - this is the dependency we care about
		const tz = $selectedTimezone();

		// Use untrack to avoid tracking loading/data state changes
		untrack(() => {
			if (initialLoad) {
				initialLoad = false;

				return;
			}

			fetchData($.get(dayOptions)[$.get(selectedDayIndex)].days);
		});
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			get class() {
				return `bg-background rounded-3xl shadow-none ${className() ?? ''}`;
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						class: 'pb-2',
						children: ($$anchor, $$slotProps) => {
							var div = root_2();
							var div_1 = $.child(div);
							var node_2 = $.child(div_1);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									class: 'text-base font-medium',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, $.get(dayOptions)[$.get(selectedDayIndex)].text));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									class: 'text-xs',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => $t()("Status history and latency trend")]);
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div_1);

							var node_4 = $.sibling(div_1, 2);

							{
								var consequent = ($$anchor) => {
									var fragment_4 = $.comment();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
										DropdownMenu_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_5 = root_1();
												var node_6 = $.first_child(fragment_5);

												{
													const child = ($$anchor, $$arg0) => {
														let props = () => ($$arg0?.()).props;

														Button($$anchor, $.spread_props(props, {
															variant: 'outline',
															class: 'rounded-btn cursor-pointer gap-1 text-xs',
															size: 'sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var fragment_7 = root();
																var text_2 = $.first_child(fragment_7);
																var node_7 = $.sibling(text_2);

																ChevronDown(node_7, { class: 'size-4' });
																$.template_effect(() => $.set_text(text_2, `${$.get(dayOptions)[$.get(selectedDayIndex)].text ?? ''} `));
																$.append($$anchor, fragment_7);
															},
															$$slots: { default: true }
														}));
													};

													$.component(node_6, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
														DropdownMenu_Trigger($$anchor, { class: 'cursor-pointer', child, $$slots: { child: true } });
													});
												}

												var node_8 = $.sibling(node_6, 2);

												$.component(node_8, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
													DropdownMenu_Content($$anchor, {
														align: 'end',
														children: ($$anchor, $$slotProps) => {
															var fragment_8 = root_1();
															var node_9 = $.first_child(fragment_8);

															$.component(node_9, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																DropdownMenu_Label($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_3 = $.text();

																		$.template_effect(($0) => $.set_text(text_3, $0), [() => $t()("Select Range")]);
																		$.append($$anchor, text_3);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
																DropdownMenu_Group($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_10 = $.comment();
																		var node_11 = $.first_child(fragment_10);

																		$.each(node_11, 19, () => $.get(dayOptions), (option) => option.days, ($$anchor, option, i) => {
																			var fragment_11 = $.comment();
																			var node_12 = $.first_child(fragment_11);

																			{
																				let $0 = $.derived(() => $.get(selectedDayIndex) === $.get(i) ? 'bg-secondary' : '');

																				$.component(node_12, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																					DropdownMenu_Item($$anchor, {
																						get class() {
																							return `cursor-pointer text-xs ${$.get($0) ?? ''}`;
																						},
																						onclick: () => handleDayChange($.get(i)),
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_4 = $.text();

																							$.template_effect(() => $.set_text(text_4, $.get(option).text));
																							$.append($$anchor, text_4);
																						},
																						$$slots: { default: true }
																					});
																				});
																			}

																			$.append($$anchor, fragment_11);
																		});

																		$.append($$anchor, fragment_10);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_8);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_5);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								};

								$.if(node_4, ($$render) => {
									if (!$.get(loading) && $.get(overviewData)) $$render(consequent);
								});
							}

							$.reset(div);
							$.append($$anchor, div);
						},
						$$slots: { default: true }
					});
				});

				var node_13 = $.sibling(node_1, 2);

				$.component(node_13, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_13 = $.comment();
							var node_14 = $.first_child(fragment_13);

							{
								var consequent_1 = ($$anchor) => {
									var div_2 = root_3();
									var div_3 = $.child(div_2);
									var node_15 = $.child(div_3);

									Skeleton(node_15, { class: 'h-16 flex-1 rounded-lg' });

									var node_16 = $.sibling(node_15, 2);

									Skeleton(node_16, { class: 'h-16 flex-1 rounded-lg' });
									$.reset(div_3);

									var node_17 = $.sibling(div_3, 2);

									Skeleton(node_17, { class: 'h-10 w-full rounded-lg' });

									var div_4 = $.sibling(node_17, 2);
									var node_18 = $.child(div_4);

									Skeleton(node_18, { class: 'h-4 w-24' });

									var node_19 = $.sibling(node_18, 2);

									Skeleton(node_19, { class: 'h-4 w-24' });
									$.reset(div_4);

									var node_20 = $.sibling(div_4, 2);

									Skeleton(node_20, { class: 'h-32 w-full rounded-lg' });
									$.reset(div_2);
									$.append($$anchor, div_2);
								};

								var consequent_2 = ($$anchor) => {
									var div_5 = root_4();
									var p = $.child(div_5);
									var text_5 = $.only_child(p, true);

									$.reset(div_5);
									$.template_effect(() => $.set_text(text_5, $.get(error)));
									$.append($$anchor, div_5);
								};

								var consequent_6 = ($$anchor) => {
									var fragment_14 = root_8();
									var div_6 = $.first_child(fragment_14);
									var div_7 = $.child(div_6);
									var p_1 = $.child(div_7);
									var text_6 = $.only_child(p_1);
									var p_2 = $.sibling(p_1, 2);
									var text_7 = $.only_child(p_2, true);

									$.reset(div_7);
									$.reset(div_6);

									var div_8 = $.sibling(div_6, 2);
									var node_21 = $.child(div_8);

									StatusBarCalendar(node_21, {
										get data() {
											return $.get(displayData);
										},

										get monitorTag() {
											return $$props.monitorTag;
										},
										barHeight: 40,
										radius: 8
									});

									var div_9 = $.sibling(node_21, 2);
									var p_3 = $.child(div_9);
									var node_22 = $.child(p_3);

									{
										var consequent_3 = ($$anchor) => {
											var text_8 = $.text();

											$.template_effect(($0) => $.set_text(text_8, $0), [
												() => $formatDate()($.get(displayData)[0].ts, page.data.dateAndTimeFormat.dateOnly)
											]);

											$.append($$anchor, text_8);
										};

										$.if(node_22, ($$render) => {
											if ($.get(displayData).length > 0) $$render(consequent_3);
										});
									}

									$.reset(p_3);

									var p_4 = $.sibling(p_3, 2);
									var node_23 = $.child(p_4);

									{
										var consequent_4 = ($$anchor) => {
											var text_9 = $.text();

											$.template_effect(($0) => $.set_text(text_9, $0), [
												() => $formatDate()($.get(displayData)[$.get(displayData).length - 1].ts, page.data.dateAndTimeFormat.dateOnly)
											]);

											$.append($$anchor, text_9);
										};

										$.if(node_23, ($$render) => {
											if ($.get(displayData).length > 0) $$render(consequent_4);
										});
									}

									$.reset(p_4);
									$.reset(div_9);
									$.reset(div_8);

									var node_24 = $.sibling(div_8, 2);

									{
										var consequent_5 = ($$anchor) => {
											var div_10 = root_5();
											var node_25 = $.child(div_10);

											GroupMonitorPopover(node_25, {
												get tags() {
													return groupTags();
												},

												get days() {
													return $.get(selectedDays);
												},

												get endOfDayTodayAtTz() {
													return $.get(endOfDayTodayAtTz);
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_17 = root();
													var text_10 = $.first_child(fragment_17);
													var node_26 = $.sibling(text_10);

													ArrowUp(node_26, { class: 'size-3' });

													$.template_effect(($0) => $.set_text(text_10, `${$0 ?? ''} `), [
														() => $t()("Included Monitors (%count)", { count: String(groupTags().length) })
													]);

													$.append($$anchor, fragment_17);
												},
												$$slots: { default: true }
											});

											$.reset(div_10);
											$.append($$anchor, div_10);
										};

										$.if(node_24, ($$render) => {
											if (groupTags().length > 0) $$render(consequent_5);
										});
									}

									var div_11 = $.sibling(node_24, 2);
									var p_5 = $.child(div_11);
									var text_11 = $.child(p_5);
									var node_27 = $.sibling(text_11);

									$.component(node_27, () => Popover.Root, ($$anchor, Popover_Root) => {
										Popover_Root($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_1();
												var node_28 = $.first_child(fragment_18);

												$.component(node_28, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
													Popover_Trigger($$anchor, {
														class: 'text-foreground cursor-pointer underline',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text();

															$.template_effect(() => $.set_text(text_12, $.get(latencyChartLabel)));
															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												var node_29 = $.sibling(node_28, 2);

												$.component(node_29, () => Popover.Content, ($$anchor, Popover_Content) => {
													Popover_Content($$anchor, {
														class: 'flex w-fit flex-col gap-2',
														children: ($$anchor, $$slotProps) => {
															var fragment_20 = root_7();
															var p_6 = $.first_child(fragment_20);
															var text_13 = $.only_child(p_6, true);
															var node_30 = $.sibling(p_6, 2);

															$.component(node_30, () => ToggleGroup.Root, ($$anchor, ToggleGroup_Root) => {
																ToggleGroup_Root($$anchor, {
																	type: 'single',
																	spacing: 2,
																	size: 'sm',
																	get value() {
																		return $.get(latencyMetric);
																	},

																	onValueChange: (v) => {
																		if (v) $.set(latencyMetric, v, true);
																	},
																	class: 'flex justify-between',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_21 = root_6();
																		var node_31 = $.first_child(fragment_21);

																		$.component(node_31, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item) => {
																			ToggleGroup_Item($$anchor, {
																				value: 'average',
																				'aria-label': 'Average latency',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_14 = $.text();

																					$.template_effect(($0) => $.set_text(text_14, $0), [() => $t()("Avg Latency")]);
																					$.append($$anchor, text_14);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_32 = $.sibling(node_31, 2);

																		$.component(node_32, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_1) => {
																			ToggleGroup_Item_1($$anchor, {
																				value: 'maximum',
																				'aria-label': 'Maximum latency',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_15 = $.text();

																					$.template_effect(($0) => $.set_text(text_15, $0), [() => $t()("Max Latency")]);
																					$.append($$anchor, text_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_33 = $.sibling(node_32, 2);

																		$.component(node_33, () => ToggleGroup.Item, ($$anchor, ToggleGroup_Item_2) => {
																			ToggleGroup_Item_2($$anchor, {
																				value: 'minimum',
																				'aria-label': 'Minimum latency',
																				children: ($$anchor, $$slotProps) => {
																					$.next();

																					var text_16 = $.text();

																					$.template_effect(($0) => $.set_text(text_16, $0), [() => $t()("Min Latency")]);
																					$.append($$anchor, text_16);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_21);
																	},
																	$$slots: { default: true }
																});
															});

															$.template_effect(($0) => $.set_text(text_13, $0), [() => $t()("Select latency metric to display")]);
															$.append($$anchor, fragment_20);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.reset(p_5);

									var div_12 = $.sibling(p_5, 2);
									var div_13 = $.child(div_12);
									var p_7 = $.child(div_13);
									var text_17 = $.only_child(p_7, true);
									var p_8 = $.sibling(p_7, 2);
									var text_18 = $.only_child(p_8, true);

									$.reset(div_13);

									var div_14 = $.sibling(div_13, 2);
									var p_9 = $.child(div_14);
									var text_19 = $.only_child(p_9, true);
									var p_10 = $.sibling(p_9, 2);
									var text_20 = $.only_child(p_10, true);

									$.reset(div_14);

									var div_15 = $.sibling(div_14, 2);
									var p_11 = $.child(div_15);
									var text_21 = $.only_child(p_11, true);
									var p_12 = $.sibling(p_11, 2);
									var text_22 = $.only_child(p_12, true);

									$.reset(div_15);
									$.reset(div_12);

									var node_34 = $.sibling(div_12, 2);

									LatencyTrendChart(node_34, {
										get data() {
											return $.get(latencyChartData);
										},

										get label() {
											return $.get(latencyChartLabel);
										},
										height: 128
									});

									$.reset(div_11);

									$.template_effect(
										($0, $1, $2, $3, $4) => {
											$.set_text(text_6, `${$.get(displayUptime) ?? ''}%`);
											$.set_text(text_7, $0);
											$.set_text(text_11, `${$1 ?? ''} `);
											$.set_text(text_17, $.get(displayMinLatency));
											$.set_text(text_18, $2);
											$.set_text(text_19, $.get(displayAvgLatency));
											$.set_text(text_20, $3);
											$.set_text(text_21, $.get(displayMaxLatency));
											$.set_text(text_22, $4);
										},
										[
											() => $t()("Uptime"),
											() => $t()("Latency Trend"),
											() => $t()("Minimum Latency"),
											() => $t()("Average Latency"),
											() => $t()("Maximum Latency")
										]
									);

									$.append($$anchor, fragment_14);
								};

								$.if(node_14, ($$render) => {
									if ($.get(loading)) $$render(consequent_1); else if ($.get(error)) $$render(consequent_2, 1); else if ($.get(overviewData)) $$render(consequent_6, 2);
								});
							}

							$.append($$anchor, fragment_13);
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
	$$cleanup();
}