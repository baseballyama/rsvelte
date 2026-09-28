import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/components/ui/button/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import SaveIcon from "@lucide/svelte/icons/save";
import Loader from "@lucide/svelte/icons/loader";
import PlayIcon from "@lucide/svelte/icons/play";
import { MONITOR_TYPES } from "$lib/types/monitor.js";
import { toast } from "svelte-sonner";

import {
	ValidateIpAddress,
	IsValidHost,
	IsValidNameServer,
	IsValidDnsResolver,
	IsValidURL,
	IsValidPort
} from "$lib/clientTools";

import { GAMEDIG_SOCKET_TIMEOUT } from "$lib/anywhere";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

import {
	MonitorApi,
	MonitorPing,
	MonitorTcp,
	MonitorDns,
	MonitorSsl,
	MonitorSql,
	MonitorHeartbeat,
	MonitorGroup,
	MonitorGamedig,
	MonitorNone,
	MonitorGrpc
} from "../types/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-2"><!> <!></div> <div class="border-t pt-4"><!></div>`, 1);
var root_2 = $.from_html(`<!> Test Monitor`, 1);
var root_3 = $.from_html(`<div class="flex flex-col items-center gap-2 py-8"><!> <p class="text-muted-foreground mt-4 text-center">Please wait while the test is being performed...</p></div>`);
var root_4 = $.from_html(`<div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium"> </div>`);
var root_5 = $.from_html(`<!> Run Test Again`, 1);
var root_6 = $.from_html(`<div class="mt-4 flex flex-col gap-4"><!> <div class="grid grid-cols-2 gap-4"><div class="rounded-lg border p-4 text-center"><div class="text-muted-foreground text-xs uppercase">Status</div> <div> </div></div> <div class="rounded-lg border p-4 text-center"><div class="text-muted-foreground text-xs uppercase">Latency (milliseconds)</div> <div class="mt-1 truncate text-2xl font-bold"> </div></div></div> <div class="flex justify-end"><!></div></div>`);
var root_7 = $.from_html(`<!> <div class="kener-manage flex flex-col justify-center gap-2"><!></div>`, 1);
var root_8 = $.from_html(`<!> Save Monitor Type Settings`, 1);
var root_9 = $.from_html(`<!> <!> <!>`, 1);

export default function MonitorTypeCard($$anchor, $$props) {
	$.push($$props, true);

	// Type-specific components
	// Dynamic per-monitor-type payload (parsed JSON). Keep as any so it can be bound into
	// the various strongly-typed type editors (API/PING/HEARTBEAT/etc.) without TS errors.
	let monitor = $.prop($$props, 'monitor', 15),
		typeData = $.prop($$props, 'typeData', 15);

	const GROUP_MIN_MONITORS = 2;
	const GROUP_MIN_TIMEOUT_MS = 1000;
	const GROUP_LATENCY_CALCULATION_OPTIONS = ["AVG", "MAX", "MIN"];

	function isGroupLatencyCalculation(value) {
		return typeof value === "string" && GROUP_LATENCY_CALCULATION_OPTIONS.includes(value);
	}

	function createDefaultGroupTypeData() {
		return {
			monitors: [],
			executionDelay: GROUP_MIN_TIMEOUT_MS,
			latencyCalculation: "AVG"
		};
	}

	function normalizeGroupTypeData(raw) {
		const candidate = raw ?? {};

		const monitors = Array.isArray(candidate.monitors)
			? candidate.monitors.reduce(
				(acc, monitor) => {
					if (monitor && typeof monitor.tag === "string" && monitor.tag.trim().length > 0) {
						const weight = typeof monitor.weight === "number" && Number.isFinite(monitor.weight) ? monitor.weight : 0;

						acc.push({ tag: monitor.tag, weight });
					}

					return acc;
				},
				[]
			)
			: [];

		const latencyCalculation = isGroupLatencyCalculation(candidate.latencyCalculation) ? candidate.latencyCalculation : "AVG";
		const executionDelay = typeof candidate.executionDelay === "number" && Number.isFinite(candidate.executionDelay) && candidate.executionDelay >= GROUP_MIN_TIMEOUT_MS ? candidate.executionDelay : GROUP_MIN_TIMEOUT_MS;

		return { monitors, latencyCalculation, executionDelay };
	}

	if (monitor().monitor_type === "GROUP") {
		typeData(normalizeGroupTypeData(typeData()));
	}

	let savingType = $.state(false);
	let testingMonitor = $.state(false);
	let testResult = $.state(null);

	const monitorTypeLabels = {
		API: "HTTP/API",
		PING: "Ping",
		TCP: "TCP Port",
		DNS: "DNS",
		NONE: "Manual",
		GROUP: "Group",
		SSL: "SSL Certificate",
		SQL: "Database",
		HEARTBEAT: "Heartbeat",
		GAMEDIG: "Game Server",
		GRPC: "gRPC Health"
	};

	// Validation for each monitor type
	const isTypeSettingsValid = $.derived(() => {
		if (!monitor().monitor_type || monitor().monitor_type === "NONE") return true;

		switch (monitor().monitor_type) {
			case "API":
				{
					const data = typeData();

					if (!data.url) return false;
					if (!IsValidURL(data.url)) return false;
					if (!data.timeout || data.timeout < 1) return false;

					return true;
				}

			case "PING":
				{
					const data = typeData();

					if (!data.hosts || !Array.isArray(data.hosts) || data.hosts.length === 0) return false;

					for (const host of data.hosts) {
						if (!host.host) return false;
						if (ValidateIpAddress(host.host) !== host.type) return false;
						if (!host.timeout || host.timeout < 1) return false;
						if (!host.count || host.count < 1) return false;
					}

					return true;
				}

			case "TCP":
				{
					const data = typeData();

					if (!data.hosts || !Array.isArray(data.hosts) || data.hosts.length === 0) return false;

					for (const host of data.hosts) {
						if (!host.host) return false;
						if (ValidateIpAddress(host.host) !== host.type) return false;
						if (!host.timeout || host.timeout < 1) return false;
						if (!IsValidPort(host.port)) return false;
					}

					return true;
				}

			case "DNS":
				{
					const data = typeData();

					if (!data.host || !IsValidHost(data.host)) return false;

					const nameServer = (data.nameServer || "").trim();
					const transport = data.transport || "UDP";

					if (transport === "TLS") {
						if (!nameServer || !IsValidDnsResolver(nameServer)) return false;

						const tlsPort = Number(data.tlsPort ?? 853);

						if (!IsValidPort(String(tlsPort))) return false;

						const tlsServername = (data.tlsServername || "").trim();

						if (tlsServername && !IsValidHost(tlsServername)) return false;
					} else if (nameServer && !IsValidNameServer(nameServer)) {
						return false;
					}

					if (!data.lookupRecord) return false;
					if (!data.values || !Array.isArray(data.values) || data.values.length === 0) return false;

					const hasNonEmptyValue = data.values.some((val) => val && val.trim() !== "");

					if (!hasNonEmptyValue) return false;

					return true;
				}

			case "GROUP":
				{
					const data = typeData();

					if (!data.monitors || !Array.isArray(data.monitors) || data.monitors.length < GROUP_MIN_MONITORS) return false;
					if (typeof data.executionDelay !== "number" || data.executionDelay < GROUP_MIN_TIMEOUT_MS) return false;
					if (!isGroupLatencyCalculation(data.latencyCalculation)) return false;

					// Weights must sum to 1
					const totalWeight = data.monitors.reduce((sum, m) => sum + (m.weight ?? 0), 0);

					if (Math.abs(totalWeight - 1) >= 0.01) return false;

					return true;
				}

			case "SSL":
				{
					const data = typeData();

					if (!data.host || !IsValidHost(data.host)) return false;
					if (!IsValidPort(data.port)) return false;
					if (!data.degradedRemainingHours || data.degradedRemainingHours < 0) return false;
					if (!data.downRemainingHours || data.downRemainingHours < 0) return false;
					if (data.degradedRemainingHours <= data.downRemainingHours) return false;

					return true;
				}

			case "SQL":
				{
					const data = typeData();

					if (!data.connectionString) return false;
					if (!data.connectionString.startsWith("postgresql://") && !data.connectionString.startsWith("mysql://")) return false;
					if (!data.timeout || data.timeout < 1) return false;
					if (!data.query) return false;

					return true;
				}

			case "HEARTBEAT":
				{
					const data = typeData();

					if (!data.degradedRemainingMinutes || data.degradedRemainingMinutes < 1) return false;
					if (!data.downRemainingMinutes || data.downRemainingMinutes <= data.degradedRemainingMinutes) return false;

					return true;
				}

			case "GAMEDIG":
				{
					const data = typeData();

					if (!data.host || ValidateIpAddress(data.host) === "Invalid") return false;
					if (!IsValidPort(data.port)) return false;
					if (!data.gameId) return false;
					if (!data.timeout || data.timeout < GAMEDIG_SOCKET_TIMEOUT) return false;

					return true;
				}

			case "GRPC":
				{
					const data = typeData();

					if (!data.host) return false;
					if (!data.port || data.port < 1 || data.port > 65535) return false;
					if (!data.timeout || data.timeout < 1) return false;

					return true;
				}

			default:
				return true;
		}
	});

	async function saveTypeSettings() {
		$.set(savingType, true);

		try {
			const payload = { ...monitor(), type_data: JSON.stringify(typeData()) };

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "storeMonitorData", data: payload })
			});

			const result = await response.json();

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success("Monitor type settings saved successfully");
			}
		} catch(e) {
			const message = e instanceof Error ? e.message : "Failed to save monitor type settings";

			toast.error(message);
		} finally {
			$.set(savingType, false);
		}
	}

	async function testMonitor() {
		if (!monitor().id || monitor().monitor_type === "NONE") return;

		$.set(testingMonitor, true);
		$.set(testResult, null);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "testMonitor", data: { monitor_id: monitor().id } })
			});

			const result = await response.json();

			$.set(testResult, result, true);
		} catch(e) {
			$.set(
				testResult,
				{
					error_message: "Failed to test monitor",
					status: "NO_DATA",
					latency: 0,
					type: "error"
				},
				true
			);
		} finally {
			$.set(testingMonitor, false);
		}
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_9();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Monitor Type Configuration');

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

										var text_1 = $.text('Configure how this monitor checks your service');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_4 = $.sibling(node_1, 2);

				$.component(node_4, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						class: 'space-y-4',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var div = $.first_child(fragment_3);
							var node_5 = $.child(div);

							Label(node_5, {
								for: 'monitor-type',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('Monitor Type');

									$.append($$anchor, text_2);
								},
								$$slots: { default: true }
							});

							var node_6 = $.sibling(node_5, 2);

							$.component(node_6, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return monitor().monitor_type;
									},

									onValueChange: (v) => {
										if (v) {
											monitor(monitor().monitor_type = v, true);
											typeData(v === "GROUP" ? createDefaultGroupTypeData() : {});
										}
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_7 = $.first_child(fragment_4);

										$.component(node_7, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												id: 'monitor-type',
												class: 'w-full',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text();

													$.template_effect(() => $.set_text(text_3, monitorTypeLabels[monitor().monitor_type]));
													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										var node_8 = $.sibling(node_7, 2);

										$.component(node_8, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_9 = $.first_child(fragment_6);

													$.each(node_9, 16, () => MONITOR_TYPES, (type) => type, ($$anchor, type) => {
														var fragment_7 = $.comment();
														var node_10 = $.first_child(fragment_7);

														$.component(node_10, () => Select.Item, ($$anchor, Select_Item) => {
															Select_Item($$anchor, {
																get value() {
																	return type;
																},

																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text_4 = $.text();

																	$.template_effect(() => $.set_text(text_4, monitorTypeLabels[type]));
																	$.append($$anchor, text_4);
																},
																$$slots: { default: true }
															});
														});

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							$.reset(div);

							var div_1 = $.sibling(div, 2);
							var node_11 = $.child(div_1);

							{
								var consequent = ($$anchor) => {
									MonitorApi($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_1 = ($$anchor) => {
									MonitorPing($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_2 = ($$anchor) => {
									MonitorTcp($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_3 = ($$anchor) => {
									MonitorDns($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_4 = ($$anchor) => {
									MonitorSsl($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_5 = ($$anchor) => {
									MonitorSql($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_6 = ($$anchor) => {
									MonitorHeartbeat($$anchor, {
										get tag() {
											return monitor().tag;
										},

										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_7 = ($$anchor) => {
									MonitorGroup($$anchor, {
										get availableMonitors() {
											return $$props.availableMonitors;
										},

										get tag() {
											return monitor().tag;
										},

										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_8 = ($$anchor) => {
									MonitorGamedig($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_9 = ($$anchor) => {
									MonitorGrpc($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								var consequent_10 = ($$anchor) => {
									MonitorNone($$anchor, {
										get data() {
											return typeData();
										},

										set data($$value) {
											typeData($$value);
										}
									});
								};

								$.if(node_11, ($$render) => {
									if (monitor().monitor_type === "API") $$render(consequent); else if (monitor().monitor_type === "PING") $$render(consequent_1, 1); else if (monitor().monitor_type === "TCP") $$render(consequent_2, 2); else if (monitor().monitor_type === "DNS") $$render(consequent_3, 3); else if (monitor().monitor_type === "SSL") $$render(consequent_4, 4); else if (monitor().monitor_type === "SQL") $$render(consequent_5, 5); else if (monitor().monitor_type === "HEARTBEAT") $$render(consequent_6, 6); else if (monitor().monitor_type === "GROUP") $$render(consequent_7, 7); else if (monitor().monitor_type === "GAMEDIG") $$render(consequent_8, 8); else if (monitor().monitor_type === "GRPC") $$render(consequent_9, 9); else if (monitor().monitor_type === "NONE") $$render(consequent_10, 10);
								});
							}

							$.reset(div_1);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				var node_12 = $.sibling(node_4, 2);

				$.component(node_12, () => Card.Footer, ($$anchor, Card_Footer) => {
					Card_Footer($$anchor, {
						class: ' flex justify-between gap-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_20 = root();
							var node_13 = $.first_child(fragment_20);

							$.component(node_13, () => Dialog.Root, ($$anchor, Dialog_Root) => {
								Dialog_Root($$anchor, {
									onOpenChange: (e) => {
										if (e) testMonitor();
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_21 = root();
										var node_14 = $.first_child(fragment_21);

										{
											const child = ($$anchor, $$arg0) => {
												let props = () => ($$arg0?.()).props;

												Button($$anchor, $.spread_props(props, {
													variant: 'secondary',
													children: ($$anchor, $$slotProps) => {
														var fragment_23 = root_2();
														var node_15 = $.first_child(fragment_23);

														PlayIcon(node_15, { class: 'size-4' });
														$.next();
														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												}));
											};

											$.component(node_14, () => Dialog.Trigger, ($$anchor, Dialog_Trigger) => {
												Dialog_Trigger($$anchor, { child, $$slots: { child: true } });
											});
										}

										var node_16 = $.sibling(node_14, 2);

										$.component(node_16, () => Dialog.Content, ($$anchor, Dialog_Content) => {
											Dialog_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_24 = root_7();
													var node_17 = $.first_child(fragment_24);

													$.component(node_17, () => Dialog.Header, ($$anchor, Dialog_Header) => {
														Dialog_Header($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_25 = $.comment();
																var node_18 = $.first_child(fragment_25);

																$.component(node_18, () => Dialog.Title, ($$anchor, Dialog_Title) => {
																	Dialog_Title($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_26 = $.comment();
																			var node_19 = $.first_child(fragment_26);

																			{
																				var consequent_11 = ($$anchor) => {
																					var text_5 = $.text('Running Test');

																					$.append($$anchor, text_5);
																				};

																				var consequent_12 = ($$anchor) => {
																					var text_6 = $.text('Test Result');

																					$.append($$anchor, text_6);
																				};

																				var alternate = ($$anchor) => {
																					var text_7 = $.text('Test Monitor');

																					$.append($$anchor, text_7);
																				};

																				$.if(node_19, ($$render) => {
																					if ($.get(testingMonitor)) $$render(consequent_11); else if ($.get(testResult)) $$render(consequent_12, 1); else $$render(alternate, -1);
																				});
																			}

																			$.append($$anchor, fragment_26);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_25);
															},
															$$slots: { default: true }
														});
													});

													var div_2 = $.sibling(node_17, 2);
													var node_20 = $.child(div_2);

													{
														var consequent_13 = ($$anchor) => {
															var div_3 = root_3();
															var node_21 = $.child(div_3);

															Loader(node_21, { class: 'size-8 animate-spin' });
															$.next(2);
															$.reset(div_3);
															$.append($$anchor, div_3);
														};

														var consequent_15 = ($$anchor) => {
															var div_4 = root_6();
															var node_22 = $.child(div_4);

															{
																var consequent_14 = ($$anchor) => {
																	var div_5 = root_4();
																	var text_8 = $.only_child(div_5, true);

																	$.template_effect(() => $.set_text(text_8, $.get(testResult).error_message));
																	$.append($$anchor, div_5);
																};

																$.if(node_22, ($$render) => {
																	if ($.get(testResult).error_message) $$render(consequent_14);
																});
															}

															var div_6 = $.sibling(node_22, 2);
															var div_7 = $.child(div_6);
															var div_8 = $.sibling($.child(div_7), 2);
															var text_9 = $.only_child(div_8, true);

															$.reset(div_7);

															var div_9 = $.sibling(div_7, 2);
															var div_10 = $.sibling($.child(div_9), 2);
															var text_10 = $.only_child(div_10, true);

															$.reset(div_9);
															$.reset(div_6);

															var div_11 = $.sibling(div_6, 2);
															var node_23 = $.child(div_11);

															Button(node_23, {
																variant: 'outline',
																size: 'sm',
																onclick: testMonitor,
																get disabled() {
																	return $.get(testingMonitor);
																},

																children: ($$anchor, $$slotProps) => {
																	var fragment_27 = root_5();
																	var node_24 = $.first_child(fragment_27);

																	PlayIcon(node_24, { class: 'size-3' });
																	$.next();
																	$.append($$anchor, fragment_27);
																},
																$$slots: { default: true }
															});

															$.reset(div_11);
															$.reset(div_4);

															$.template_effect(
																($0) => {
																	$.set_class(div_8, 1, `mt-1 text-2xl font-bold text-${$0 ?? ''}`);
																	$.set_text(text_9, $.get(testResult).status);
																	$.set_text(text_10, $.get(testResult).latency);
																},
																[() => $.get(testResult).status.toLowerCase()]
															);

															$.append($$anchor, div_4);
														};

														$.if(node_20, ($$render) => {
															if ($.get(testingMonitor)) $$render(consequent_13); else if ($.get(testResult)) $$render(consequent_15, 1);
														});
													}

													$.reset(div_2);
													$.append($$anchor, fragment_24);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_21);
									},
									$$slots: { default: true }
								});
							});

							var node_25 = $.sibling(node_13, 2);

							{
								let $0 = $.derived(() => $.get(savingType) || !$.get(isTypeSettingsValid));

								Button(node_25, {
									onclick: saveTypeSettings,
									get disabled() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_28 = root_8();
										var node_26 = $.first_child(fragment_28);

										{
											var consequent_16 = ($$anchor) => {
												Loader($$anchor, { class: 'size-4 animate-spin' });
											};

											var alternate_1 = ($$anchor) => {
												SaveIcon($$anchor, { class: 'size-4' });
											};

											$.if(node_26, ($$render) => {
												if ($.get(savingType)) $$render(consequent_16); else $$render(alternate_1, -1);
											});
										}

										$.next();
										$.append($$anchor, fragment_28);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_20);
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