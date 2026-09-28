import * as $ from 'svelte/internal/server';
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

export default function MonitorOverview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		let {
			monitorTag,
			class: className = "",
			maxDays = 90,
			groupTags = []
		} = $$props;

		// State
		let loading = true;

		let overviewData = null;
		let error = null;

		// All possible day range options (ascending)
		const allDayOptions = [1, 7, 14, 30, 60, 90];

		// Filter options up to maxDays, always include maxDays itself
		let dayOptions = $.derived(() => {
			const filtered = allDayOptions.filter((d) => d <= maxDays);

			if (!filtered.includes(maxDays)) {
				filtered.push(maxDays);
			}

			// Sort descending for dropdown display
			filtered.sort((a, b) => b - a);

			return filtered.map((d) => ({
				days: d,
				text: `${d} ${d === 1
					? $.store_get($$store_subs ??= {}, '$t', t)("Day")
					: $.store_get($$store_subs ??= {}, '$t', t)("Days")}`
			}));
		});

		// Default to maxDays (first item since sorted descending)
		let selectedDayIndex = 0;

		let selectedDays = $.derived(() => dayOptions()[selectedDayIndex]?.days ?? maxDays);
		let endOfDayTodayAtTz = $.derived(() => getEndOfDayAtTz($.store_get($$store_subs ??= {}, '$selectedTimezone', selectedTimezone)));

		// Latency metric toggle: "average" | "maximum" | "minimum"
		let latencyMetric = "average";

		// Display values from API response (already formatted as strings)
		let displayUptime = $.derived(() => overviewData?.uptime ?? "--");

		let displayAvgLatency = $.derived(() => overviewData?.avgLatency ?? "--");
		let displayMaxLatency = $.derived(() => overviewData?.maxLatency ?? "--");
		let displayMinLatency = $.derived(() => overviewData?.minLatency ?? "--");

		// Data for calendar/chart comes directly from API
		let displayData = $.derived(() => overviewData?.uptimeData ?? []);

		// Latency metric label map
		const metricLabels = {
			average: $.store_get($$store_subs ??= {}, '$t', t)("Avg Latency"),
			maximum: $.store_get($$store_subs ??= {}, '$t', t)("Max Latency"),
			minimum: $.store_get($$store_subs ??= {}, '$t', t)("Min Latency")
		};

		// Transform uptimeData into chart-ready points based on selected metric
		let latencyChartData = $.derived(() => {
			if (!displayData()) return [];

			return displayData().map((d) => ({
				date: new Date(d.ts * 1000),
				value: latencyMetric === "maximum"
					? d.maxLatency
					: latencyMetric === "minimum" ? d.minLatency : d.avgLatency
			}));
		});

		let latencyChartLabel = $.derived(() => metricLabels[latencyMetric] ?? metricLabels.average);

		// Fetch data with days parameter
		async function fetchData(days) {
			loading = true;
			error = null;

			try {
				overviewData = await requestMonitorBar(monitorTag, days, endOfDayTodayAtTz());
			} catch(e) {
				console.error("Failed to fetch monitor data:", e);
				error = e instanceof Error ? e.message : "Failed to load data";
			} finally {
				loading = false;
			}
		}

		// Handle dropdown selection
		function handleDayChange(index) {
			if (index !== selectedDayIndex) {
				selectedDayIndex = index;

				// Evict cache so the new range fetches fresh data
				clearMonitorBarCache();

				fetchData(dayOptions()[index].days);
			}
		}

		onMount(() => {
			fetchData(dayOptions()[selectedDayIndex].days);
		});

		// Re-fetch when timezone changes
		let initialLoad = true;

		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				class: `bg-background rounded-3xl shadow-none ${$.stringify(className)}`,
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							class: 'pb-2',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex items-center justify-between"><div>`);

								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										class: 'text-base font-medium',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(dayOptions()[selectedDayIndex].text)}`);
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
										class: 'text-xs',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Status history and latency trend"))}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(`</div> `);

								if (!loading && overviewData) {
									$$renderer.push('<!--[0-->');

									if (DropdownMenu.Root) {
										$$renderer.push('<!--[-->');

										DropdownMenu.Root($$renderer, {
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																variant: 'outline',
																class: 'rounded-btn cursor-pointer gap-1 text-xs',
																size: 'sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(dayOptions()[selectedDayIndex].text)} `);
																	ChevronDown($$renderer, { class: 'size-4' });
																	$$renderer.push(`<!---->`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (DropdownMenu.Trigger) {
														$$renderer.push('<!--[-->');
														DropdownMenu.Trigger($$renderer, { class: 'cursor-pointer', child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (DropdownMenu.Content) {
													$$renderer.push('<!--[-->');

													DropdownMenu.Content($$renderer, {
														align: 'end',
														children: ($$renderer) => {
															if (DropdownMenu.Label) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Label($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Select Range"))}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (DropdownMenu.Group) {
																$$renderer.push('<!--[-->');

																DropdownMenu.Group($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(dayOptions());

																		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																			let option = each_array[i];

																			if (DropdownMenu.Item) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Item($$renderer, {
																					class: `cursor-pointer text-xs ${selectedDayIndex === i ? 'bg-secondary' : ''}`,
																					onclick: () => handleDayChange(i),
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->${$.escape(option.text)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
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
								} else {
									$$renderer.push('<!--[-1-->');
								}

								$$renderer.push(`<!--]--></div>`);
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
							class: 'space-y-4',
							children: ($$renderer) => {
								if (loading) {
									$$renderer.push(`<!--[0--><div class="space-y-4"><div class="flex gap-4">`);
									Skeleton($$renderer, { class: 'h-16 flex-1 rounded-lg' });
									$$renderer.push(`<!----> `);
									Skeleton($$renderer, { class: 'h-16 flex-1 rounded-lg' });
									$$renderer.push(`<!----></div> `);
									Skeleton($$renderer, { class: 'h-10 w-full rounded-lg' });
									$$renderer.push(`<!----> <div class="flex justify-between">`);
									Skeleton($$renderer, { class: 'h-4 w-24' });
									$$renderer.push(`<!----> `);
									Skeleton($$renderer, { class: 'h-4 w-24' });
									$$renderer.push(`<!----></div> `);
									Skeleton($$renderer, { class: 'h-32 w-full rounded-lg' });
									$$renderer.push(`<!----></div>`);
								} else if (error) {
									$$renderer.push(`<!--[1--><div class="py-12 text-center"><p class="text-muted-foreground">${$.escape(error)}</p></div>`);
								} else if (overviewData) {
									$$renderer.push(`<!--[2--><div class="flex gap-4"><div class="flex flex-1 flex-col items-start gap-1"><p class="text-2xl font-semibold">${$.escape(displayUptime())}%</p> <p class="text-muted-foreground text-sm font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Uptime"))}</p></div></div> <div class="flex flex-col gap-1">`);
									StatusBarCalendar($$renderer, { data: displayData(), monitorTag, barHeight: 40, radius: 8 });
									$$renderer.push(`<!----> <div class="flex justify-between"><p class="text-muted-foreground text-xs font-medium">`);

									if (displayData().length > 0) {
										$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(displayData()[0].ts, page.data.dateAndTimeFormat.dateOnly))}`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></p> <p class="text-muted-foreground text-xs font-medium">`);

									if (displayData().length > 0) {
										$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(displayData()[displayData().length - 1].ts, page.data.dateAndTimeFormat.dateOnly))}`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--></p></div></div> `);

									if (groupTags.length > 0) {
										$$renderer.push(`<!--[0--><div class="flex justify-center">`);

										GroupMonitorPopover($$renderer, {
											tags: groupTags,
											days: selectedDays(),
											endOfDayTodayAtTz: endOfDayTodayAtTz(),
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Included Monitors (%count)", { count: String(groupTags.length) }))} `);
												ArrowUp($$renderer, { class: 'size-3' });
												$$renderer.push(`<!---->`);
											},
											$$slots: { default: true }
										});

										$$renderer.push(`<!----></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> <div class="pt-2"><p class="text-muted-foreground mb-2 text-sm font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latency Trend"))} `);

									if (Popover.Root) {
										$$renderer.push('<!--[-->');

										Popover.Root($$renderer, {
											children: ($$renderer) => {
												if (Popover.Trigger) {
													$$renderer.push('<!--[-->');

													Popover.Trigger($$renderer, {
														class: 'text-foreground cursor-pointer underline',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(latencyChartLabel())}`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Popover.Content) {
													$$renderer.push('<!--[-->');

													Popover.Content($$renderer, {
														class: 'flex w-fit flex-col gap-2',
														children: ($$renderer) => {
															$$renderer.push(`<p class="text-muted-foreground text-xs font-medium">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Select latency metric to display"))}</p> `);

															if (ToggleGroup.Root) {
																$$renderer.push('<!--[-->');

																ToggleGroup.Root($$renderer, {
																	type: 'single',
																	spacing: 2,
																	size: 'sm',
																	value: latencyMetric,
																	onValueChange: (v) => {
																		if (v) latencyMetric = v;
																	},
																	class: 'flex justify-between',
																	children: ($$renderer) => {
																		if (ToggleGroup.Item) {
																			$$renderer.push('<!--[-->');

																			ToggleGroup.Item($$renderer, {
																				value: 'average',
																				'aria-label': 'Average latency',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Avg Latency"))}`);
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
																				value: 'maximum',
																				'aria-label': 'Maximum latency',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Max Latency"))}`);
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
																				value: 'minimum',
																				'aria-label': 'Minimum latency',
																				children: ($$renderer) => {
																					$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Min Latency"))}`);
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

									$$renderer.push(`</p> <div class="mb-3 flex justify-between gap-4"><div class="flex flex-col items-start gap-1"><p class="text-lg font-semibold">${$.escape(displayMinLatency())}</p> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Minimum Latency"))}</p></div> <div class="flex flex-col items-center gap-1"><p class="text-lg font-semibold">${$.escape(displayAvgLatency())}</p> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Average Latency"))}</p></div> <div class="flex flex-col items-end gap-1"><p class="text-lg font-semibold">${$.escape(displayMaxLatency())}</p> <p class="text-muted-foreground text-xs">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Maximum Latency"))}</p></div></div> `);

									LatencyTrendChart($$renderer, {
										data: latencyChartData(),
										label: latencyChartLabel(),
										height: 128
									});

									$$renderer.push(`<!----></div>`);
								} else {
									$$renderer.push('<!--[-1-->');
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}