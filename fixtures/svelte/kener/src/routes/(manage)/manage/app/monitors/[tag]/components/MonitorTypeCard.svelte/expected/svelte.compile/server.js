import * as $ from 'svelte/internal/server';
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

export default function MonitorTypeCard($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Type-specific components
		// Dynamic per-monitor-type payload (parsed JSON). Keep as any so it can be bound into
		// the various strongly-typed type editors (API/PING/HEARTBEAT/etc.) without TS errors.
		let { monitor = void 0, typeData = void 0, availableMonitors } = $$props;

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

		if (monitor.monitor_type === "GROUP") {
			typeData = normalizeGroupTypeData(typeData);
		}

		let savingType = false;
		let testingMonitor = false;
		let testResult = null;

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
			if (!monitor.monitor_type || monitor.monitor_type === "NONE") return true;

			switch (monitor.monitor_type) {
				case "API":
					{
						const data = typeData;

						if (!data.url) return false;
						if (!IsValidURL(data.url)) return false;
						if (!data.timeout || data.timeout < 1) return false;

						return true;
					}

				case "PING":
					{
						const data = typeData;

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
						const data = typeData;

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
						const data = typeData;

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
						const data = typeData;

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
						const data = typeData;

						if (!data.host || !IsValidHost(data.host)) return false;
						if (!IsValidPort(data.port)) return false;
						if (!data.degradedRemainingHours || data.degradedRemainingHours < 0) return false;
						if (!data.downRemainingHours || data.downRemainingHours < 0) return false;
						if (data.degradedRemainingHours <= data.downRemainingHours) return false;

						return true;
					}

				case "SQL":
					{
						const data = typeData;

						if (!data.connectionString) return false;
						if (!data.connectionString.startsWith("postgresql://") && !data.connectionString.startsWith("mysql://")) return false;
						if (!data.timeout || data.timeout < 1) return false;
						if (!data.query) return false;

						return true;
					}

				case "HEARTBEAT":
					{
						const data = typeData;

						if (!data.degradedRemainingMinutes || data.degradedRemainingMinutes < 1) return false;
						if (!data.downRemainingMinutes || data.downRemainingMinutes <= data.degradedRemainingMinutes) return false;

						return true;
					}

				case "GAMEDIG":
					{
						const data = typeData;

						if (!data.host || ValidateIpAddress(data.host) === "Invalid") return false;
						if (!IsValidPort(data.port)) return false;
						if (!data.gameId) return false;
						if (!data.timeout || data.timeout < GAMEDIG_SOCKET_TIMEOUT) return false;

						return true;
					}

				case "GRPC":
					{
						const data = typeData;

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
			savingType = true;

			try {
				const payload = { ...monitor, type_data: JSON.stringify(typeData) };

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
				savingType = false;
			}
		}

		async function testMonitor() {
			if (!monitor.id || monitor.monitor_type === "NONE") return;

			testingMonitor = true;
			testResult = null;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "testMonitor", data: { monitor_id: monitor.id } })
				});

				const result = await response.json();

				testResult = result;
			} catch(e) {
				testResult = {
					error_message: "Failed to test monitor",
					status: "NO_DATA",
					latency: 0,
					type: "error"
				};
			} finally {
				testingMonitor = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->Monitor Type Configuration`);
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
												$$renderer.push(`<!---->Configure how this monitor checks your service`);
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
								class: 'space-y-4',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex flex-col gap-2">`);

									Label($$renderer, {
										for: 'monitor-type',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Monitor Type`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											value: monitor.monitor_type,
											onValueChange: (v) => {
												if (v) {
													monitor.monitor_type = v;
													typeData = v === "GROUP" ? createDefaultGroupTypeData() : {};
												}
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														id: 'monitor-type',
														class: 'w-full',
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(monitorTypeLabels[monitor.monitor_type])}`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(MONITOR_TYPES);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let type = each_array[$$index];

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: type,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(monitorTypeLabels[type])}`);
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

									$$renderer.push(`</div> <div class="border-t pt-4">`);

									if (monitor.monitor_type === "API") {
										$$renderer.push('<!--[0-->');

										MonitorApi($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "PING") {
										$$renderer.push('<!--[1-->');

										MonitorPing($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "TCP") {
										$$renderer.push('<!--[2-->');

										MonitorTcp($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "DNS") {
										$$renderer.push('<!--[3-->');

										MonitorDns($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "SSL") {
										$$renderer.push('<!--[4-->');

										MonitorSsl($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "SQL") {
										$$renderer.push('<!--[5-->');

										MonitorSql($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "HEARTBEAT") {
										$$renderer.push('<!--[6-->');

										MonitorHeartbeat($$renderer, {
											tag: monitor.tag,
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "GROUP") {
										$$renderer.push('<!--[7-->');

										MonitorGroup($$renderer, {
											availableMonitors,
											tag: monitor.tag,
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "GAMEDIG") {
										$$renderer.push('<!--[8-->');

										MonitorGamedig($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "GRPC") {
										$$renderer.push('<!--[9-->');

										MonitorGrpc($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
									} else if (monitor.monitor_type === "NONE") {
										$$renderer.push('<!--[10-->');

										MonitorNone($$renderer, {
											get data() {
												return typeData;
											},

											set data($$value) {
												typeData = $$value;
												$$settled = false;
											}
										});
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

						if (Card.Footer) {
							$$renderer.push('<!--[-->');

							Card.Footer($$renderer, {
								class: ' flex justify-between gap-2',
								children: ($$renderer) => {
									if (Dialog.Root) {
										$$renderer.push('<!--[-->');

										Dialog.Root($$renderer, {
											onOpenChange: (e) => {
												if (e) testMonitor();
											},

											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															props,
															{
																variant: 'secondary',
																children: ($$renderer) => {
																	PlayIcon($$renderer, { class: 'size-4' });
																	$$renderer.push(`<!----> Test Monitor`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (Dialog.Trigger) {
														$$renderer.push('<!--[-->');
														Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (Dialog.Content) {
													$$renderer.push('<!--[-->');

													Dialog.Content($$renderer, {
														children: ($$renderer) => {
															if (Dialog.Header) {
																$$renderer.push('<!--[-->');

																Dialog.Header($$renderer, {
																	children: ($$renderer) => {
																		if (Dialog.Title) {
																			$$renderer.push('<!--[-->');

																			Dialog.Title($$renderer, {
																				children: ($$renderer) => {
																					if (testingMonitor) {
																						$$renderer.push(`<!--[0-->Running Test`);
																					} else if (testResult) {
																						$$renderer.push(`<!--[1-->Test Result`);
																					} else {
																						$$renderer.push(`<!--[-1-->Test Monitor`);
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

															$$renderer.push(` <div class="kener-manage flex flex-col justify-center gap-2">`);

															if (testingMonitor) {
																$$renderer.push(`<!--[0--><div class="flex flex-col items-center gap-2 py-8">`);
																Loader($$renderer, { class: 'size-8 animate-spin' });
																$$renderer.push(`<!----> <p class="text-muted-foreground mt-4 text-center">Please wait while the test is being performed...</p></div>`);
															} else if (testResult) {
																$$renderer.push(`<!--[1--><div class="mt-4 flex flex-col gap-4">`);

																if (testResult.error_message) {
																	$$renderer.push(`<!--[0--><div class="bg-destructive/10 text-destructive rounded-md p-3 text-sm font-medium">${$.escape(testResult.error_message)}</div>`);
																} else {
																	$$renderer.push('<!--[-1-->');
																}

																$$renderer.push(`<!--]--> <div class="grid grid-cols-2 gap-4"><div class="rounded-lg border p-4 text-center"><div class="text-muted-foreground text-xs uppercase">Status</div> <div${$.attr_class(`mt-1 text-2xl font-bold text-${$.stringify(testResult.status.toLowerCase())}`)}>${$.escape(testResult.status)}</div></div> <div class="rounded-lg border p-4 text-center"><div class="text-muted-foreground text-xs uppercase">Latency (milliseconds)</div> <div class="mt-1 truncate text-2xl font-bold">${$.escape(testResult.latency)}</div></div></div> <div class="flex justify-end">`);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: testMonitor,
																	disabled: testingMonitor,
																	children: ($$renderer) => {
																		PlayIcon($$renderer, { class: 'size-3' });
																		$$renderer.push(`<!----> Run Test Again`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div></div>`);
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
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									Button($$renderer, {
										onclick: saveTypeSettings,
										disabled: savingType || !isTypeSettingsValid(),
										children: ($$renderer) => {
											if (savingType) {
												$$renderer.push('<!--[0-->');
												Loader($$renderer, { class: 'size-4 animate-spin' });
											} else {
												$$renderer.push('<!--[-1-->');
												SaveIcon($$renderer, { class: 'size-4' });
											}

											$$renderer.push(`<!--]--> Save Monitor Type Settings`);
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
		$.bind_props($$props, { monitor, typeData });
	});
}