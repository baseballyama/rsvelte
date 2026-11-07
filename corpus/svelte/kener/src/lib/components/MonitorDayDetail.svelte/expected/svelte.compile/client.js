import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<span class="truncate"> </span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-4 py-4"><div class="flex items-center justify-between"><!> <!></div> <div class="flex flex-wrap"><!></div></div>`);
var root_4 = $.from_html(`<div class="py-8 text-center"><p class="text-muted-foreground"> </p></div>`);
var root_5 = $.from_html(`<div class="space-y-4 py-4"><div class="flex items-center justify-between"><!> <!></div> <!></div>`);
var root_6 = $.from_html(`<!> `, 1);
var root_7 = $.from_html(`<p> </p>`);
var root_8 = $.from_html(`<div class="flex w-full items-start gap-2"><div class="mt-0.5 size-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"></div> <div class="flex flex-1 flex-col items-start justify-between gap-1 leading-none"><span class="text-muted-foreground text-xs"> </span> <div class="flex items-center gap-2"><span class="text-foreground font-mono font-medium tabular-nums"> </span></div></div></div>`);
var root_9 = $.from_html(`<div class="space-y-4"><div class="text-foreground mb-2 flex items-center justify-between text-sm font-medium"><p> </p> <div class="flex items-center gap-1"><!></div></div> <!></div>`);
var root_10 = $.from_html(`<div class="border-b pb-5 last:border-b-0"><!></div>`);
var root_11 = $.from_html(`<div class="space-y-4"><div><div class="scrollbar-hidden flex max-h-100 flex-col gap-4 overflow-y-auto"></div></div></div>`);
var root_12 = $.from_html(`<div class="scrollbar-hidden flex max-h-100 flex-col gap-4 space-y-4 overflow-y-auto"></div>`);
var root_13 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function MonitorDayDetail($$anchor, $$props) {
	$.push($$props, true);

	const $formatDate = () => $.store_get(formatDate, '$formatDate', $$stores);
	const $t = () => $.store_get(t, '$t', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let open = $.prop($$props, 'open', 15);
	let loading = $.state(false);
	let latencyLoading = $.state(false);
	let incidentsLoading = $.state(false);
	let maintenancesLoading = $.state(false);
	let activeView = "status";
	let lastTrackedView = $.state("status");
	let dayDetailData = $.state(null);
	let dayLatencyData = $.state(null);
	let dayIncidentsData = $.state($.proxy([]));
	let dayMaintenancesData = $.state($.proxy([]));

	// Chart config for latency
	const chartConfig = { latency: { label: "Latency", color: "var(--chart-1)" } };

	// Transform latency data for chart
	let chartData = $.derived(() => {
		if (!$.get(dayLatencyData)?.minutes) return [];

		return $.get(dayLatencyData).minutes.filter((d) => d.latency > 0).map((d) => ({ date: new Date(d.timestamp * 1000), latency: d.latency }));
	});

	// Fetch day detail data
	async function fetchDayDetail() {
		if (!$$props.selectedDay) return;

		$.set(loading, true);
		$.set(dayDetailData, null);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-status"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tag: $$props.monitorTag,
					dayTimestamp: $$props.selectedDay.timestamp,
					startOfDayTodayAtTz: $$props.selectedDay.timestamp,
					nowAtTz: Math.min($$props.selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
				})
			});

			if (response.ok) {
				$.set(dayDetailData, await response.json(), true);
			}
		} catch(error) {
			console.error("Failed to fetch day detail:", error);
		} finally {
			$.set(loading, false);
		}
	}

	// Fetch day latency data
	async function fetchDayLatency() {
		if (!$$props.selectedDay) return;

		$.set(latencyLoading, true);
		$.set(dayLatencyData, null);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-latency"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tag: $$props.monitorTag,
					startOfDayTodayAtTz: $$props.selectedDay.timestamp,
					nowAtTz: Math.min($$props.selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
				})
			});

			if (response.ok) {
				$.set(dayLatencyData, await response.json(), true);
			}
		} catch(error) {
			console.error("Failed to fetch day latency:", error);
		} finally {
			$.set(latencyLoading, false);
		}
	}

	//// Fetch day incident data
	async function fetchDayIncidents() {
		if (!$$props.selectedDay) return;

		$.set(incidentsLoading, true);
		$.set(dayIncidentsData, [], true);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-incidents"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tag: $$props.monitorTag,
					startOfDayTodayAtTz: $$props.selectedDay.timestamp,
					nowAtTz: Math.min($$props.selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
				})
			});

			if (response.ok) {
				const result = await response.json();

				$.set(dayIncidentsData, result.incidents, true);
			}
		} catch(error) {
			console.error("Failed to fetch day incidents:", error);
		} finally {
			$.set(incidentsLoading, false);
		}
	}

	// Fetch day maintenance data
	async function fetchDayMaintenances() {
		if (!$$props.selectedDay) return;

		$.set(maintenancesLoading, true);
		$.set(dayMaintenancesData, [], true);

		try {
			const response = await fetch(clientResolver(resolve, "/dashboard-apis/monitor-day-maintenances"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tag: $$props.monitorTag,
					startOfDayTodayAtTz: $$props.selectedDay.timestamp,
					nowAtTz: Math.min($$props.selectedDay.timestamp + 86400 - 60, page.data.nowAtTz)
				})
			});

			if (response.ok) {
				const result = await response.json();

				$.set(dayMaintenancesData, result.maintenances, true);
			}
		} catch(error) {
			console.error("Failed to fetch day maintenances:", error);
		} finally {
			$.set(maintenancesLoading, false);
		}
	}

	// Fetch data when dialog opens with a new day
	$.user_effect(() => {
		if (open() && $$props.selectedDay) {
			fetchDayDetail();
			fetchDayLatency();
			fetchDayIncidents();
			fetchDayMaintenances();
		}
	});

	$.user_effect(() => {
		if (open() && activeView !== $.get(lastTrackedView)) {
			trackEvent("monitor_day_tab_changed", { view: activeView, monitorTag: $$props.monitorTag });
			$.set(lastTrackedView, activeView, true);
		}
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Dialog.Root, ($$anchor, Dialog_Root) => {
		Dialog_Root($$anchor, {
			get open() {
				return open();
			},

			set open($$value) {
				open($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Dialog.Overlay, ($$anchor, Dialog_Overlay) => {
					Dialog_Overlay($$anchor, { class: 'backdrop-blur-[2px]' });
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Dialog.Content, ($$anchor, Dialog_Content) => {
					Dialog_Content($$anchor, {
						class: 'max-h-[90vh] overflow-y-auto rounded-3xl p-4 sm:max-w-[46.5rem] sm:p-6',
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Dialog.Header, ($$anchor, Dialog_Header) => {
								Dialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_1();
										var node_4 = $.first_child(fragment_3);

										$.component(node_4, () => Dialog.Title, ($$anchor, Dialog_Title) => {
											Dialog_Title($$anchor, {
												class: 'flex items-center gap-2 text-base sm:text-lg',
												children: ($$anchor, $$slotProps) => {
													var span = root();
													var text = $.only_child(span, true);

													$.template_effect(($0) => $.set_text(text, $0), [
														() => $$props.selectedDay
															? $formatDate()(new Date($$props.selectedDay.timestamp * 1000), page.data.dateAndTimeFormat.dateOnly)
															: ""
													]);

													$.append($$anchor, span);
												},
												$$slots: { default: true }
											});
										});

										var node_5 = $.sibling(node_4, 2);

										$.component(node_5, () => Dialog.Description, ($$anchor, Dialog_Description) => {
											Dialog_Description($$anchor, {
												class: 'text-xs sm:text-sm',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(($0) => $.set_text(text_1, $0), [() => $t()("Minute-by-minute status data for this day")]);
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});

							var node_6 = $.sibling(node_3, 2);

							$.component(node_6, () => Tabs.Root, ($$anchor, Tabs_Root) => {
								Tabs_Root($$anchor, {
									value: activeView,
									class: 'bg-background ktabs w-full   overflow-hidden rounded-3xl border',
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = root_13();
										var node_7 = $.first_child(fragment_5);

										$.component(node_7, () => Tabs.List, ($$anchor, Tabs_List) => {
											Tabs_List($$anchor, {
												class: 'scrollbar-hidden h-auto w-full justify-start gap-1 overflow-x-auto rounded-none px-2 py-2 sm:justify-end',
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root_2();
													var node_8 = $.first_child(fragment_6);

													$.component(node_8, () => Tabs.Trigger, ($$anchor, Tabs_Trigger) => {
														Tabs_Trigger($$anchor, {
															value: 'status',
															class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text();

																$.template_effect(($0) => $.set_text(text_2, $0), [() => $t()("Status")]);
																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_9 = $.sibling(node_8, 2);

													$.component(node_9, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_1) => {
														Tabs_Trigger_1($$anchor, {
															value: 'latency',
															class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_3 = $.text();

																$.template_effect(($0) => $.set_text(text_3, $0), [() => $t()("Latency")]);
																$.append($$anchor, text_3);
															},
															$$slots: { default: true }
														});
													});

													var node_10 = $.sibling(node_9, 2);

													$.component(node_10, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_2) => {
														Tabs_Trigger_2($$anchor, {
															value: 'incidents',
															class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_4 = $.text();

																$.template_effect(($0) => $.set_text(text_4, $0), [() => $t()("Incidents")]);
																$.append($$anchor, text_4);
															},
															$$slots: { default: true }
														});
													});

													var node_11 = $.sibling(node_10, 2);

													$.component(node_11, () => Tabs.Trigger, ($$anchor, Tabs_Trigger_3) => {
														Tabs_Trigger_3($$anchor, {
															value: 'maintenances',
															class: 'shrink-0 rounded-3xl px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_5 = $.text();

																$.template_effect(($0) => $.set_text(text_5, $0), [() => $t()("Maintenances")]);
																$.append($$anchor, text_5);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										var node_12 = $.sibling(node_7, 2);

										$.component(node_12, () => Tabs.Content, ($$anchor, Tabs_Content) => {
											Tabs_Content($$anchor, {
												value: 'status',
												class: 'p-2 sm:p-4',
												children: ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_13 = $.first_child(fragment_11);

													{
														var consequent = ($$anchor) => {
															var div = root_3();
															var div_1 = $.child(div);
															var node_14 = $.child(div_1);

															Skeleton(node_14, { class: 'h-6 w-32' });

															var node_15 = $.sibling(node_14, 2);

															Skeleton(node_15, { class: 'h-6 w-24' });
															$.reset(div_1);

															var div_2 = $.sibling(div_1, 2);
															var node_16 = $.child(div_2);

															LoaderBoxes(node_16, {});
															$.reset(div_2);
															$.reset(div);
															$.append($$anchor, div);
														};

														var consequent_1 = ($$anchor) => {
															MinuteGrid($$anchor, {
																get minutes() {
																	return $.get(dayDetailData).minutes;
																},

																get uptime() {
																	return $.get(dayDetailData).uptime;
																}
															});
														};

														var alternate = ($$anchor) => {
															var div_3 = root_4();
															var p = $.child(div_3);
															var text_6 = $.only_child(p, true);

															$.reset(div_3);
															$.template_effect(($0) => $.set_text(text_6, $0), [() => $t()("Failed to load status data for this day")]);
															$.append($$anchor, div_3);
														};

														$.if(node_13, ($$render) => {
															if ($.get(loading)) $$render(consequent); else if ($.get(dayDetailData)) $$render(consequent_1, 1); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_11);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_12, 2);

										$.component(node_17, () => Tabs.Content, ($$anchor, Tabs_Content_1) => {
											Tabs_Content_1($$anchor, {
												value: 'latency',
												class: 'p-2 sm:p-4',
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = $.comment();
													var node_18 = $.first_child(fragment_13);

													{
														var consequent_2 = ($$anchor) => {
															var div_4 = root_5();
															var div_5 = $.child(div_4);
															var node_19 = $.child(div_5);

															Skeleton(node_19, { class: 'h-6 w-32' });

															var node_20 = $.sibling(node_19, 2);

															Skeleton(node_20, { class: 'h-6 w-24' });
															$.reset(div_5);

															var node_21 = $.sibling(div_5, 2);

															Skeleton(node_21, { class: 'h-64 w-full' });
															$.reset(div_4);
															$.append($$anchor, div_4);
														};

														var consequent_3 = ($$anchor) => {
															var div_6 = root_9();
															var div_7 = $.child(div_6);
															var p_1 = $.child(div_7);
															var text_7 = $.only_child(p_1, true);
															var div_8 = $.sibling(p_1, 2);
															var node_22 = $.child(div_8);

															$.component(node_22, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																Tooltip_Root($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		var fragment_14 = root_1();
																		var node_23 = $.first_child(fragment_14);

																		$.component(node_23, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																			Tooltip_Trigger($$anchor, {
																				class: 'flex items-center gap-1',
																				children: ($$anchor, $$slotProps) => {
																					var fragment_15 = root_6();
																					var node_24 = $.first_child(fragment_15);

																					Clock(node_24, { class: 'h-3 w-3' });

																					var text_8 = $.sibling(node_24);

																					$.template_effect(() => $.set_text(text_8, ` ${$.get(dayLatencyData).avgLatency ?? ''}`));
																					$.append($$anchor, fragment_15);
																				},
																				$$slots: { default: true }
																			});
																		});

																		var node_25 = $.sibling(node_23, 2);

																		$.component(node_25, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																			Tooltip_Content($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var p_2 = root_7();
																					var text_9 = $.only_child(p_2, true);

																					$.template_effect(($0) => $.set_text(text_9, $0), [() => $t()("Average Latency")]);
																					$.append($$anchor, p_2);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_14);
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div_8);
															$.reset(div_7);

															var node_26 = $.sibling(div_7, 2);

															$.component(node_26, () => Chart.Container, ($$anchor, Chart_Container) => {
																Chart_Container($$anchor, {
																	get config() {
																		return chartConfig;
																	},
																	class: 'min-h-48 w-full sm:min-h-64',
																	children: ($$anchor, $$slotProps) => {
																		{
																			const marks = ($$anchor, $$arg0) => {
																				let series = () => ($$arg0?.()).series;
																				let getAreaProps = () => ($$arg0?.()).getAreaProps;
																				var fragment_17 = $.comment();
																				var node_27 = $.first_child(fragment_17);

																				$.each(node_27, 19, series, (s) => s.key, ($$anchor, s, i) => {
																					{
																						const children = ($$anchor, $$arg0) => {
																							let gradient = () => ($$arg0?.()).gradient;

																							{
																								let $0 = $.derived(() => getAreaProps()($.get(s), $.get(i)));

																								Area($$anchor, $.spread_props(() => $.get($0), {
																									get fill() {
																										return gradient();
																									}
																								}));
																							}
																						};

																						let $0 = $.derived(() => [
																							$.get(s).color ?? "",
																							"color-mix(in lch, " + $.get(s).color + " 10%, transparent)"
																						]);

																						LinearGradient($$anchor, {
																							get stops() {
																								return $.get($0);
																							},
																							vertical: true,
																							children,
																							$$slots: { default: true }
																						});
																					}
																				});

																				$.append($$anchor, fragment_17);
																			};

																			const tooltip = ($$anchor) => {
																				var fragment_20 = $.comment();
																				var node_28 = $.first_child(fragment_20);

																				{
																					const formatter = ($$anchor, $$arg0) => {
																						let value = () => ($$arg0?.()).value;
																						let name = () => ($$arg0?.()).name;
																						let item = () => ($$arg0?.()).item;
																						var div_9 = root_8();
																						var div_10 = $.child(div_9);
																						var div_11 = $.sibling(div_10, 2);
																						var span_1 = $.child(div_11);
																						var text_10 = $.only_child(span_1, true);
																						var div_12 = $.sibling(span_1, 2);
																						var span_2 = $.child(div_12);
																						var text_11 = $.only_child(span_2, true);

																						$.reset(div_12);
																						$.reset(div_11);
																						$.reset(div_9);

																						$.template_effect(
																							($0, $1) => {
																								$.set_style(div_10, `--color-bg: ${item().color ?? ''}; --color-border: ${item().color ?? ''};`);
																								$.set_text(text_10, $0);
																								$.set_text(text_11, $1);
																							},
																							[
																								() => item().payload?.date
																									? $formatDate()(item().payload.date, page.data.dateAndTimeFormat.timeOnly)
																									: "",
																								() => ParseLatency(Math.round(Number(value())))
																							]
																						);

																						$.append($$anchor, div_9);
																					};

																					$.component(node_28, () => Chart.Tooltip, ($$anchor, Chart_Tooltip) => {
																						Chart_Tooltip($$anchor, { hideLabel: true, formatter, $$slots: { formatter: true } });
																					});
																				}

																				$.append($$anchor, fragment_20);
																			};

																			let $0 = $.derived(scaleTime);

																			let $1 = $.derived(() => [
																				{
																					key: "latency",
																					label: $t()("Latency"),
																					color: "var(--color-latency)"
																				}
																			]);

																			let $2 = $.derived(() => ({
																				area: {
																					curve: curveCatmullRom,
																					"fill-opacity": 0.4,
																					line: { class: "stroke-1" }
																				},
																				xAxis: {
																					format: (d) => $formatDate()(d, page.data.dateAndTimeFormat.timeOnly)
																				}
																			}));

																			AreaChart($$anchor, {
																				get data() {
																					return $.get(chartData);
																				},
																				x: 'date',
																				get xScale() {
																					return $.get($0);
																				},
																				y: 'latency',
																				yDomain: [0, null],
																				yNice: true,
																				axis: 'x',
																				grid: false,
																				get series() {
																					return $.get($1);
																				},

																				get props() {
																					return $.get($2);
																				},
																				marks,
																				tooltip,
																				$$slots: { marks: true, tooltip: true }
																			});
																		}
																	},
																	$$slots: { default: true }
																});
															});

															$.reset(div_6);
															$.template_effect(($0) => $.set_text(text_7, $0), [() => $t()("Latency Over Time")]);
															$.append($$anchor, div_6);
														};

														var consequent_4 = ($$anchor) => {
															var div_13 = root_4();
															var p_3 = $.child(div_13);
															var text_12 = $.only_child(p_3, true);

															$.reset(div_13);
															$.template_effect(($0) => $.set_text(text_12, $0), [() => $t()("No latency data available for this day")]);
															$.append($$anchor, div_13);
														};

														var alternate_1 = ($$anchor) => {
															var div_14 = root_4();
															var p_4 = $.child(div_14);
															var text_13 = $.only_child(p_4, true);

															$.reset(div_14);
															$.template_effect(($0) => $.set_text(text_13, $0), [() => $t()("Failed to load latency data")]);
															$.append($$anchor, div_14);
														};

														$.if(node_18, ($$render) => {
															if ($.get(latencyLoading)) $$render(consequent_2); else if ($.get(dayLatencyData) && $.get(chartData).length > 0) $$render(consequent_3, 1); else if ($.get(dayLatencyData) && $.get(chartData).length === 0) $$render(consequent_4, 2); else $$render(alternate_1, -1);
														});
													}

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										var node_29 = $.sibling(node_17, 2);

										$.component(node_29, () => Tabs.Content, ($$anchor, Tabs_Content_2) => {
											Tabs_Content_2($$anchor, {
												value: 'incidents',
												class: 'p-2 sm:p-4',
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = $.comment();
													var node_30 = $.first_child(fragment_21);

													{
														var consequent_5 = ($$anchor) => {
															var div_15 = root_5();
															var div_16 = $.child(div_15);
															var node_31 = $.child(div_16);

															Skeleton(node_31, { class: 'h-6 w-32' });

															var node_32 = $.sibling(node_31, 2);

															Skeleton(node_32, { class: 'h-6 w-24' });
															$.reset(div_16);

															var node_33 = $.sibling(div_16, 2);

															Skeleton(node_33, { class: 'h-64 w-full' });
															$.reset(div_15);
															$.append($$anchor, div_15);
														};

														var consequent_6 = ($$anchor) => {
															var div_17 = root_11();
															var div_18 = $.child(div_17);
															var div_19 = $.child(div_18);

															$.each(div_19, 21, () => $.get(dayIncidentsData), (incident) => incident.id, ($$anchor, incident) => {
																var div_20 = root_10();
																var node_34 = $.child(div_20);

																IncidentItem(node_34, {
																	get incident() {
																		return $.get(incident);
																	},
																	hideMonitors: true,
																	showComments: false,
																	showSummary: false
																});

																$.reset(div_20);
																$.append($$anchor, div_20);
															});

															$.reset(div_19);
															$.reset(div_18);
															$.reset(div_17);
															$.append($$anchor, div_17);
														};

														var alternate_2 = ($$anchor) => {
															var div_21 = root_4();
															var p_5 = $.child(div_21);
															var text_14 = $.only_child(p_5, true);

															$.reset(div_21);
															$.template_effect(($0) => $.set_text(text_14, $0), [() => $t()("No incidents for this day")]);
															$.append($$anchor, div_21);
														};

														$.if(node_30, ($$render) => {
															if ($.get(incidentsLoading)) $$render(consequent_5); else if ($.get(dayIncidentsData).length > 0) $$render(consequent_6, 1); else $$render(alternate_2, -1);
														});
													}

													$.append($$anchor, fragment_21);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_29, 2);

										$.component(node_35, () => Tabs.Content, ($$anchor, Tabs_Content_3) => {
											Tabs_Content_3($$anchor, {
												value: 'maintenances',
												class: 'p-2 sm:p-4',
												children: ($$anchor, $$slotProps) => {
													var fragment_22 = $.comment();
													var node_36 = $.first_child(fragment_22);

													{
														var consequent_7 = ($$anchor) => {
															var div_22 = root_5();
															var div_23 = $.child(div_22);
															var node_37 = $.child(div_23);

															Skeleton(node_37, { class: 'h-6 w-32' });

															var node_38 = $.sibling(node_37, 2);

															Skeleton(node_38, { class: 'h-6 w-24' });
															$.reset(div_23);

															var node_39 = $.sibling(div_23, 2);

															Skeleton(node_39, { class: 'h-64 w-full' });
															$.reset(div_22);
															$.append($$anchor, div_22);
														};

														var consequent_8 = ($$anchor) => {
															var div_24 = root_12();

															$.each(div_24, 21, () => $.get(dayMaintenancesData), (maintenance) => maintenance.id, ($$anchor, maintenance) => {
																var div_25 = root_10();
																var node_40 = $.child(div_25);

																MaintenanceItem(node_40, {
																	get maintenance() {
																		return $.get(maintenance);
																	},
																	hideMonitors: true
																});

																$.reset(div_25);
																$.append($$anchor, div_25);
															});

															$.reset(div_24);
															$.append($$anchor, div_24);
														};

														var alternate_3 = ($$anchor) => {
															var div_26 = root_4();
															var p_6 = $.child(div_26);
															var text_15 = $.only_child(p_6, true);

															$.reset(div_26);
															$.template_effect(($0) => $.set_text(text_15, $0), [() => $t()("No maintenances for this day")]);
															$.append($$anchor, div_26);
														};

														$.if(node_36, ($$render) => {
															if ($.get(maintenancesLoading)) $$render(consequent_7); else if ($.get(dayMaintenancesData).length > 0) $$render(consequent_8, 1); else $$render(alternate_3, -1);
														});
													}

													$.append($$anchor, fragment_22);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
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