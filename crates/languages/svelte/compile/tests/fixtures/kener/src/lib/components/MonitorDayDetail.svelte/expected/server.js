import * as $ from 'svelte/internal/server';
import { t } from "$lib/stores/i18n";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import { resolve } from "$app/paths";
import Clock from "@lucide/svelte/icons/clock";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Skeleton } from "$lib/components/ui/skeleton/index.js";
import LoaderBoxes from "$lib/components/loaderbox.svelte";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import { page } from "$app/state";
import { AreaChart, Area, LinearGradient } from "layerchart";
import { curveCatmullRom } from "d3-shape";
import { scaleTime } from "d3-scale";
import IncidentItem from "$lib/components/IncidentItem.svelte";
import MaintenanceItem from "$lib/components/MaintenanceItem.svelte";
import MinuteGrid from "$lib/components/MinuteGrid.svelte";
import clientResolver from "$lib/client/resolver.js";
import { ParseLatency } from "$lib/clientTools";
import * as Chart from "$lib/components/ui/chart/index.js";
import { formatDate } from "$lib/stores/datetime";
import trackEvent from "$lib/beacon";

export default function MonitorDayDetail($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { open = void 0, monitorTag, selectedDay } = $$props;
		let loading = false;
		let latencyLoading = false;
		let incidentsLoading = false;
		let maintenancesLoading = false;
		let activeView = "status";
		let lastTrackedView = "status";
		let dayDetailData = null;
		let dayLatencyData = null;
		let dayIncidentsData = [];
		let dayMaintenancesData = [];

		// Chart config for latency
		const chartConfig = { latency: { label: "Latency", color: "var(--chart-1)" } };

		// Transform latency data for chart
		let chartData = $.derived(() => {
			if (!dayLatencyData?.minutes) return [];

			return dayLatencyData.minutes.filter((d) => d.latency > 0).map((d) => ({ date: new Date(d.timestamp * 1000), latency: d.latency }));
		});

		// Fetch day detail data
		async function fetchDayDetail() {
			if (!selectedDay) return;

			loading = true;
			dayDetailData = null;

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-status"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tag: monitorTag,
						dayTimestamp: selectedDay.timestamp,
						startOfDayTodayAtTz: selectedDay.timestamp,
						nowAtTz: Math.min(selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
					})
				});

				if (response.ok) {
					dayDetailData = await response.json();
				}
			} catch(error) {
				console.error("Failed to fetch day detail:", error);
			} finally {
				loading = false;
			}
		}

		// Fetch day latency data
		async function fetchDayLatency() {
			if (!selectedDay) return;

			latencyLoading = true;
			dayLatencyData = null;

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-latency"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tag: monitorTag,
						startOfDayTodayAtTz: selectedDay.timestamp,
						nowAtTz: Math.min(selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
					})
				});

				if (response.ok) {
					dayLatencyData = await response.json();
				}
			} catch(error) {
				console.error("Failed to fetch day latency:", error);
			} finally {
				latencyLoading = false;
			}
		}

		//// Fetch day incident data
		async function fetchDayIncidents() {
			if (!selectedDay) return;

			incidentsLoading = true;
			dayIncidentsData = [];

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-incidents"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tag: monitorTag,
						startOfDayTodayAtTz: selectedDay.timestamp,
						nowAtTz: Math.min(selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
					})
				});

				if (response.ok) {
					const result = await response.json();

					dayIncidentsData = result.incidents;
				}
			} catch(error) {
				console.error("Failed to fetch day incidents:", error);
			} finally {
				incidentsLoading = false;
			}
		}

		// Fetch day maintenance data
		async function fetchDayMaintenances() {
			if (!selectedDay) return;

			maintenancesLoading = true;
			dayMaintenancesData = [];

			try {
				const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-maintenances"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						tag: monitorTag,
						startOfDayTodayAtTz: selectedDay.timestamp,
						nowAtTz: Math.min(selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
					})
				});

				if (response.ok) {
					const result = await response.json();

					dayMaintenancesData = result.maintenances;
				}
			} catch(error) {
				console.error("Failed to fetch day maintenances:", error);
			} finally {
				maintenancesLoading = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Overlay) {
							$$renderer.push('<!--[-->');
							Dialog.Overlay($$renderer, { class: 'backdrop-blur-[2px]' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'max-h-[90vh] overflow-y-auto rounded-3xl p-4 sm:max-w-[46.5rem] sm:p-6',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														class: 'flex items-center gap-2 text-base sm:text-lg',
														children: ($$renderer) => {
															$$renderer.push(`<span class="truncate">${$.escape(selectedDay
																? $.store_get($$store_subs ??= {}, '$formatDate', formatDate)(new Date(selectedDay.timestamp * 1000), page.data.dateAndTimeFormat.dateOnly)
																: "")}</span>`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														class: 'text-xs sm:text-sm',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Minute-by-minute status data for this day"))}`);
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

									if (Tabs.Root) {
										$$renderer.push('<!--[-->');

										Tabs.Root($$renderer, {
											value: activeView,
											class: 'bg-background ktabs w-full   overflow-hidden rounded-3xl border',
											children: ($$renderer) => {
												if (Tabs.List) {
													$$renderer.push('<!--[-->');

													Tabs.List($$renderer, {
														class: 'scrollbar-hidden h-auto w-full justify-start gap-1 overflow-x-auto rounded-none px-2 py-2 sm:justify-end',
														children: ($$renderer) => {
															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'status',
																	class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Status"))}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'latency',
																	class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latency"))}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'incidents',
																	class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Incidents"))}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Tabs.Trigger) {
																$$renderer.push('<!--[-->');

																Tabs.Trigger($$renderer, {
																	value: 'maintenances',
																	class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Maintenances"))}`);
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

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'status',
														class: 'p-2 sm:p-4',
														children: ($$renderer) => {
															if (loading) {
																$$renderer.push(`<!--[0--><div class="space-y-4 py-4"><div class="flex items-center justify-between">`);
																Skeleton($$renderer, { class: 'h-6 w-32' });
																$$renderer.push(`<!----> `);
																Skeleton($$renderer, { class: 'h-6 w-24' });
																$$renderer.push(`<!----></div> <div class="flex flex-wrap">`);
																LoaderBoxes($$renderer, {});
																$$renderer.push(`<!----></div></div>`);
															} else if (dayDetailData) {
																$$renderer.push('<!--[1-->');
																MinuteGrid($$renderer, { minutes: dayDetailData.minutes, uptime: dayDetailData.uptime });
															} else {
																$$renderer.push(`<!--[-1--><div class="py-8 text-center"><p class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Failed to load status data for this day"))}</p></div>`);
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

												$$renderer.push(` `);

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'latency',
														class: 'p-2 sm:p-4',
														children: ($$renderer) => {
															if (latencyLoading) {
																$$renderer.push(`<!--[0--><div class="space-y-4 py-4"><div class="flex items-center justify-between">`);
																Skeleton($$renderer, { class: 'h-6 w-32' });
																$$renderer.push(`<!----> `);
																Skeleton($$renderer, { class: 'h-6 w-24' });
																$$renderer.push(`<!----></div> `);
																Skeleton($$renderer, { class: 'h-64 w-full' });
																$$renderer.push(`<!----></div>`);
															} else if (dayLatencyData && chartData().length > 0) {
																$$renderer.push(`<!--[1--><div class="space-y-4"><div class="text-foreground mb-2 flex items-center justify-between text-sm font-medium"><p>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Latency Over Time"))}</p> <div class="flex items-center gap-1">`);

																if (Tooltip.Root) {
																	$$renderer.push('<!--[-->');

																	Tooltip.Root($$renderer, {
																		children: ($$renderer) => {
																			if (Tooltip.Trigger) {
																				$$renderer.push('<!--[-->');

																				Tooltip.Trigger($$renderer, {
																					class: 'flex items-center gap-1',
																					children: ($$renderer) => {
																						Clock($$renderer, { class: 'h-3 w-3' });
																						$$renderer.push(`<!----> ${$.escape(dayLatencyData.avgLatency)}`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` `);

																			if (Tooltip.Content) {
																				$$renderer.push('<!--[-->');

																				Tooltip.Content($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<p>${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Average Latency"))}</p>`);
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

																$$renderer.push(`</div></div> `);

																if (Chart.Container) {
																	$$renderer.push('<!--[-->');

																	Chart.Container($$renderer, {
																		config: chartConfig,
																		class: 'min-h-48 w-full sm:min-h-64',
																		children: ($$renderer) => {
																			{
																				function marks($$renderer, { series, getAreaProps }) {
																					$$renderer.push(`<!--[-->`);

																					const each_array = $.ensure_array_like(series);

																					for (let i = 0, $$length = each_array.length; i < $$length; i++) {
																						let s = each_array[i];

																						{
																							function children($$renderer, { gradient }) {
																								Area($$renderer, $.spread_props([getAreaProps(s, i), { fill: gradient }]));
																							}

																							LinearGradient($$renderer, {
																								stops: [
																									s.color ?? "",
																									"color-mix(in lch, " + s.color + " 10%, transparent)"
																								],
																								vertical: true,
																								children,
																								$$slots: { default: true }
																							});
																						}
																					}

																					$$renderer.push(`<!--]-->`);
																				}

																				function tooltip($$renderer) {
																					{
																						function formatter($$renderer, { value, name, item }) {
																							$$renderer.push(`<div class="flex w-full items-start gap-2"><div${$.attr_style(`--color-bg: ${$.stringify(item.color)}; --color-border: ${$.stringify(item.color)};`)} class="mt-0.5 size-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"></div> <div class="flex flex-1 flex-col items-start justify-between gap-1 leading-none"><span class="text-muted-foreground text-xs">${$.escape(item.payload?.date
																								? $.store_get($$store_subs ??= {}, '$formatDate', formatDate)(item.payload.date, page.data.dateAndTimeFormat.timeOnly)
																								: "")}</span> <div class="flex items-center gap-2"><span class="text-foreground font-mono font-medium tabular-nums">${$.escape(ParseLatency(Math.round(Number(value))))}</span></div></div></div>`);
																						}

																						if (Chart.Tooltip) {
																							$$renderer.push('<!--[-->');
																							Chart.Tooltip($$renderer, { hideLabel: true, formatter, $$slots: { formatter: true } });
																							$$renderer.push('<!--]-->');
																						} else {
																							$$renderer.push('<!--[!-->');
																							$$renderer.push('<!--]-->');
																						}
																					}
																				}

																				AreaChart($$renderer, {
																					data: chartData(),
																					x: 'date',
																					xScale: scaleTime(),
																					y: 'latency',
																					yDomain: [0, null],
																					yNice: true,
																					axis: 'x',
																					grid: false,
																					series: [
																						{
																							key: "latency",
																							label: $.store_get($$store_subs ??= {}, '$t', t)("Latency"),
																							color: "var(--color-latency)"
																						}
																					],
																					props: {
																						area: {
																							curve: curveCatmullRom,
																							"fill-opacity": 0.4,
																							line: { class: "stroke-1" }
																						},
																						xAxis: {
																							format: (d) => $.store_get($$store_subs ??= {}, '$formatDate', formatDate)(d, page.data.dateAndTimeFormat.timeOnly)
																						}
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

																$$renderer.push(`</div>`);
															} else if (dayLatencyData && chartData().length === 0) {
																$$renderer.push(`<!--[2--><div class="py-8 text-center"><p class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No latency data available for this day"))}</p></div>`);
															} else {
																$$renderer.push(`<!--[-1--><div class="py-8 text-center"><p class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("Failed to load latency data"))}</p></div>`);
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

												$$renderer.push(` `);

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'incidents',
														class: 'p-2 sm:p-4',
														children: ($$renderer) => {
															if (incidentsLoading) {
																$$renderer.push(`<!--[0--><div class="space-y-4 py-4"><div class="flex items-center justify-between">`);
																Skeleton($$renderer, { class: 'h-6 w-32' });
																$$renderer.push(`<!----> `);
																Skeleton($$renderer, { class: 'h-6 w-24' });
																$$renderer.push(`<!----></div> `);
																Skeleton($$renderer, { class: 'h-64 w-full' });
																$$renderer.push(`<!----></div>`);
															} else if (dayIncidentsData.length > 0) {
																$$renderer.push(`<!--[1--><div class="space-y-4"><div><div class="scrollbar-hidden flex max-h-100 flex-col gap-4 overflow-y-auto"><!--[-->`);

																const each_array_1 = $.ensure_array_like(dayIncidentsData);

																for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																	let incident = each_array_1[$$index_1];

																	$$renderer.push(`<div class="border-b pb-5 last:border-b-0">`);

																	IncidentItem($$renderer, {
																		incident,
																		hideMonitors: true,
																		showComments: false,
																		showSummary: false
																	});

																	$$renderer.push(`<!----></div>`);
																}

																$$renderer.push(`<!--]--></div></div></div>`);
															} else {
																$$renderer.push(`<!--[-1--><div class="py-8 text-center"><p class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No incidents for this day"))}</p></div>`);
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

												$$renderer.push(` `);

												if (Tabs.Content) {
													$$renderer.push('<!--[-->');

													Tabs.Content($$renderer, {
														value: 'maintenances',
														class: 'p-2 sm:p-4',
														children: ($$renderer) => {
															if (maintenancesLoading) {
																$$renderer.push(`<!--[0--><div class="space-y-4 py-4"><div class="flex items-center justify-between">`);
																Skeleton($$renderer, { class: 'h-6 w-32' });
																$$renderer.push(`<!----> `);
																Skeleton($$renderer, { class: 'h-6 w-24' });
																$$renderer.push(`<!----></div> `);
																Skeleton($$renderer, { class: 'h-64 w-full' });
																$$renderer.push(`<!----></div>`);
															} else if (dayMaintenancesData.length > 0) {
																$$renderer.push(`<!--[1--><div class="scrollbar-hidden flex max-h-100 flex-col gap-4 space-y-4 overflow-y-auto"><!--[-->`);

																const each_array_2 = $.ensure_array_like(dayMaintenancesData);

																for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																	let maintenance = each_array_2[$$index_2];

																	$$renderer.push(`<div class="border-b pb-5 last:border-b-0">`);
																	MaintenanceItem($$renderer, { maintenance, hideMonitors: true });
																	$$renderer.push(`<!----></div>`);
																}

																$$renderer.push(`<!--]--></div>`);
															} else {
																$$renderer.push(`<!--[-1--><div class="py-8 text-center"><p class="text-muted-foreground">${$.escape($.store_get($$store_subs ??= {}, '$t', t)("No maintenances for this day"))}</p></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);

		$.bind_props($$props, { open });
	});
}