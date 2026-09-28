import * as $ from 'svelte/internal/server';
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";
import AlertTriangleIcon from "@lucide/svelte/icons/alert-triangle";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import * as Accordion from "$lib/components/ui/accordion/index.js";
import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import * as HoverCard from "$lib/components/ui/hover-card/index.js";
import * as Dialog from "$lib/components/ui/dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import { toast } from "svelte-sonner";
import { goto } from "$app/navigation";
import GeneralSettingsCard from "./components/GeneralSettingsCard.svelte";
import MonitorTypeCard from "./components/MonitorTypeCard.svelte";
import UptimeSettingsCard from "./components/UptimeSettingsCard.svelte";
import PageVisibilityCard from "./components/PageVisibilityCard.svelte";
import ModifyDataCard from "./components/ModifyDataCard.svelte";
import DangerZoneCard from "./components/DangerZoneCard.svelte";
import MonitorRecentLogs from "./components/MonitorRecentLogs.svelte";
import StatusHistoryDaysCard from "./components/StatusHistoryDaysCard.svelte";
import MonitorSharingOptionsCard from "./components/MonitorSharingOptionsCard.svelte";
import GC from "$lib/global-constants.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Card components
		let { params } = $$props;

		const isNew = $.derived(() => params.tag === "new");

		// Form state
		let loading = true;

		let error = null;
		let availableMonitors = [];
		let subMenuOptions = null;

		// Uptime settings state
		let uptimeSettings = {
			uptime_formula_numerator: "up + maintenance",
			uptime_formula_denominator: "up + maintenance + down + degraded"
		};

		// Status history days state
		let statusHistoryDays = {
			desktop: GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP,
			mobile: GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
		};

		// Pages state
		let allPages = [];

		// Monitor data
		let monitor = {
			id: 0,
			tag: "",
			name: "",
			description: "",
			image: "",
			cron: "* * * * *",
			default_status: "UP",
			status: "ACTIVE",
			category_name: "Home",
			monitor_type: "",
			is_hidden: "NO",
			confirmation_threshold: 1,
			monitor_settings_json: "",
			external_url: ""
		};

		// Type-specific data
		let typeData = {};

		// Get pages this monitor is on
		const monitorPages = $.derived(() => allPages.filter((p) => p.monitors?.some((m) => m.monitor_tag === monitor.tag)));

		async function fetchMonitor() {
			if (isNew()) {
				loading = false;

				return;
			}

			loading = true;
			error = null;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitors", data: { tag: params.tag } })
				});

				const result = await response.json();

				if (result.error) {
					error = result.error;
				} else if (result.length > 0) {
					const m = result[0];

					monitor = {
						id: m.id,
						tag: m.tag,
						name: m.name,
						description: m.description || "",
						image: m.image || "",
						cron: m.cron || "* * * * *",
						default_status: m.default_status || "UP",
						status: m.status || "ACTIVE",
						category_name: m.category_name || "Home",
						monitor_type: m.monitor_type || "",
						is_hidden: m.is_hidden || "NO",
						confirmation_threshold: m.confirmation_threshold ?? 1,
						monitor_settings_json: m.monitor_settings_json || "",
						external_url: m.external_url || ""
					};

					// Parse type_data
					if (m.type_data) {
						try {
							typeData = JSON.parse(m.type_data);
						} catch(e) {
							console.error("Failed to parse type_data:", e);
							typeData = {};
						}
					}

					// Parse monitor_settings_json
					if (m.monitor_settings_json) {
						try {
							const settings = JSON.parse(m.monitor_settings_json);

							uptimeSettings = {
								uptime_formula_numerator: settings.uptime_formula_numerator || "up + maintenance",
								uptime_formula_denominator: settings.uptime_formula_denominator || "up + maintenance + down + degraded"
							};

							if (settings.monitor_status_history_days) {
								statusHistoryDays = {
									desktop: settings.monitor_status_history_days.desktop ?? GC.DEFAULT_STATUS_HISTORY_DAYS_DESKTOP,
									mobile: settings.monitor_status_history_days.mobile ?? GC.DEFAULT_STATUS_HISTORY_DAYS_MOBILE
								};
							}
						} catch(e) {
							console.error("Failed to parse monitor_settings_json:", e);
						}
					}
				} else {
					error = "Monitor not found";
				}
			} catch(e) {
				error = e instanceof Error ? e.message : "Failed to fetch monitor";
			} finally {
				loading = false;
			}
		}

		async function fetchAvailableMonitors() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitors", data: { status: "ACTIVE" } })
				});

				const result = await response.json();

				if (!result.error) {
					availableMonitors = result;
				}
			} catch {
				// Ignore errors for available monitors
			}
		}

		async function fetchPages() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getPages" })
				});

				const result = await response.json();

				if (!result.error) {
					allPages = result;
				}
			} catch {
				// Ignore errors for pages
			}
		}

		//fetch sharing options from site data
		async function getSiteLevelSharingConfig() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getSiteDataByKey", data: { key: "subMenuOptions" } })
				});

				const result = await response.json();

				if (result.error) {
					throw new Error(result.error);
				}

				subMenuOptions = result;
			} catch(e) {
				console.error("Failed to fetch site level sharing config:", e);

				return {};
			}
		}

		let activeAccordionItem = $.derived(() => isNew() ? "general" : "configuration");
		let cloneDialogOpen = false;
		let cloneTag = "";
		let cloneName = "";
		let cloning = false;

		function openCloneDialog() {
			cloneTag = "";
			cloneName = monitor.name ? `${monitor.name} Copy` : "Copy";
			cloneDialogOpen = true;
		}

		async function cloneMonitor() {
			const newTag = cloneTag.trim();
			const newName = cloneName.trim();

			if (!newTag || !newName) {
				toast.error("Tag and name are required");

				return;
			}

			cloning = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "cloneMonitor",
						data: { sourceTag: monitor.tag, newTag, newName }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);

					return;
				}

				toast.success("Monitor cloned successfully");
				cloneDialogOpen = false;
				goto(clientResolver(resolve, `/manage/app/monitors/${newTag}`));
			} catch(e) {
				const message = e instanceof Error ? e.message : "Failed to clone monitor";

				toast.error(message);
			} finally {
				cloning = false;
			}
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex items-center justify-between">`);

			if (Breadcrumb.Root) {
				$$renderer.push('<!--[-->');

				Breadcrumb.Root($$renderer, {
					children: ($$renderer) => {
						if (Breadcrumb.List) {
							$$renderer.push('<!--[-->');

							Breadcrumb.List($$renderer, {
								children: ($$renderer) => {
									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Link) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Link($$renderer, {
														href: clientResolver(resolve, "/manage/app/monitors"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Monitors`);
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

									if (Breadcrumb.Separator) {
										$$renderer.push('<!--[-->');
										Breadcrumb.Separator($$renderer, {});
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Breadcrumb.Item) {
										$$renderer.push('<!--[-->');

										Breadcrumb.Item($$renderer, {
											children: ($$renderer) => {
												if (Breadcrumb.Page) {
													$$renderer.push('<!--[-->');

													Breadcrumb.Page($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(isNew() ? "New Monitor" : monitor.name || params.tag)}`);
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

			$$renderer.push(` <div class="flex gap-2">`);

			if (!isNew()) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					size: 'sm',
					variant: 'outline',
					onclick: openCloneDialog,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Clone`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (HoverCard.Root) {
				$$renderer.push('<!--[-->');

				HoverCard.Root($$renderer, {
					children: ($$renderer) => {
						if (HoverCard.Trigger) {
							$$renderer.push('<!--[-->');

							HoverCard.Trigger($$renderer, {
								children: ($$renderer) => {
									Button($$renderer, {
										size: 'sm',
										target: '_blank',
										href: clientResolver(resolve, `/monitors/${params.tag}`),
										variant: 'outline',
										children: ($$renderer) => {
											$$renderer.push(`<!---->View`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (HoverCard.Content) {
							$$renderer.push('<!--[-->');

							HoverCard.Content($$renderer, {
								class: 'w-80',
								children: ($$renderer) => {
									$$renderer.push(`<div class="flex justify-between space-x-4 text-xs">`);

									if (monitor.is_hidden === "YES") {
										$$renderer.push(`<!--[0--><p class="text-destructive">This monitor is hidden and won't appear on status pages.</p>`);
									} else if (monitor.status !== "ACTIVE") {
										$$renderer.push(`<!--[1--><p class="text-destructive">This monitor is not active and won't appear on status pages.</p>`);
									} else {
										$$renderer.push(`<!--[-1--><p class="text-success">This monitor is visible on status pages.</p>`);
									}

									$$renderer.push(`<!--]--> <p class="text-xs"></p></div>`);
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

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-12">`);
				Spinner($$renderer, { class: 'size-8' });
				$$renderer.push(`<!----></div>`);
			} else if (error) {
				$$renderer.push('<!--[1-->');

				if (Card.Root) {
					$$renderer.push('<!--[-->');

					Card.Root($$renderer, {
						class: 'border-destructive',
						children: ($$renderer) => {
							if (Card.Content) {
								$$renderer.push('<!--[-->');

								Card.Content($$renderer, {
									class: 'pt-6',
									children: ($$renderer) => {
										$$renderer.push(`<p class="text-destructive">${$.escape(error)}</p>`);
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

				if (!isNew() && monitorPages().length === 0) {
					$$renderer.push('<!--[0-->');

					if (Alert.Root) {
						$$renderer.push('<!--[-->');

						Alert.Root($$renderer, {
							variant: 'destructive',
							children: ($$renderer) => {
								AlertTriangleIcon($$renderer, { class: 'size-4' });
								$$renderer.push(`<!----> `);

								if (Alert.Title) {
									$$renderer.push('<!--[-->');

									Alert.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Monitor Not Visible`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Alert.Description) {
									$$renderer.push('<!--[-->');

									Alert.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->This monitor is not added to any page. It won't be visible on your status page until you add it to at least
          one page.`);
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

				$$renderer.push(`<!--]--> `);

				if (Accordion.Root) {
					$$renderer.push('<!--[-->');

					Accordion.Root($$renderer, {
						type: 'single',
						class: 'w-full ',
						onValueChange: (value) => activeAccordionItem(value),
						get value() {
							return activeAccordionItem();
						},

						set value($$value) {
							activeAccordionItem($$value);
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Accordion.Item) {
								$$renderer.push('<!--[-->');

								Accordion.Item($$renderer, {
									value: 'general',
									children: ($$renderer) => {
										if (Accordion.Trigger) {
											$$renderer.push('<!--[-->');

											Accordion.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->General Settings`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Accordion.Content) {
											$$renderer.push('<!--[-->');

											Accordion.Content($$renderer, {
												class: 'flex flex-col gap-4 text-balance',
												children: ($$renderer) => {
													GeneralSettingsCard($$renderer, {
														typeData,
														isNew: isNew(),
														get monitor() {
															return monitor;
														},

														set monitor($$value) {
															monitor = $$value;
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

							$$renderer.push(` `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'configuration',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Configuration`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														MonitorTypeCard($$renderer, {
															availableMonitors,
															get monitor() {
																return monitor;
															},

															set monitor($$value) {
																monitor = $$value;
																$$settled = false;
															},

															get typeData() {
																return typeData;
															},

															set typeData($$value) {
																typeData = $$value;
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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'calculation',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Uptime Calculation`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														UptimeSettingsCard($$renderer, {
															monitor,
															typeData,
															get uptimeSettings() {
																return uptimeSettings;
															},

															set uptimeSettings($$value) {
																uptimeSettings = $$value;
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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'status-history',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Status History`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														StatusHistoryDaysCard($$renderer, {
															typeData,
															get monitor() {
																return monitor;
															},

															set monitor($$value) {
																monitor = $$value;
																$$settled = false;
															},

															get statusHistoryDays() {
																return statusHistoryDays;
															},

															set statusHistoryDays($$value) {
																statusHistoryDays = $$value;
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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'logs-recent',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Recent Logs`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														MonitorRecentLogs($$renderer, { monitor_tag: params.tag });
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

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'pages-visibility',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Page Visibility`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														PageVisibilityCard($$renderer, {
															monitorTag: monitor.tag,
															allPages,
															onPagesUpdated: fetchPages
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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'sharing-options',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Sharing Options`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														MonitorSharingOptionsCard($$renderer, {
															typeData,
															subMenuOptions,
															get monitor() {
																return monitor;
															},

															set monitor($$value) {
																monitor = $$value;
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
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'modify-data',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Modify Data`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														ModifyDataCard($$renderer, { monitorTag: monitor.tag });
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

							$$renderer.push(`<!--]--> `);

							if (!isNew()) {
								$$renderer.push('<!--[0-->');

								if (Accordion.Item) {
									$$renderer.push('<!--[-->');

									Accordion.Item($$renderer, {
										value: 'danger-zone',
										children: ($$renderer) => {
											if (Accordion.Trigger) {
												$$renderer.push('<!--[-->');

												Accordion.Trigger($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Danger Zone`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Accordion.Content) {
												$$renderer.push('<!--[-->');

												Accordion.Content($$renderer, {
													class: 'flex flex-col gap-4 text-balance',
													children: ($$renderer) => {
														DangerZoneCard($$renderer, { monitor, status: monitor.status || "INACTIVE" });
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

							$$renderer.push(`<!--]-->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]--></div> `);

			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					get open() {
						return cloneDialogOpen;
					},

					set open($$value) {
						cloneDialogOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								class: 'sm:max-w-md',
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Clone Monitor`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!---->Enter a new tag and name for the cloned monitor.`);
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

									$$renderer.push(` <div class="space-y-4 py-2"><div class="space-y-2">`);

									Label($$renderer, {
										for: 'clone-tag',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Tag`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'clone-tag',
										placeholder: 'my-monitor-copy',
										get value() {
											return cloneTag;
										},

										set value($$value) {
											cloneTag = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div> <div class="space-y-2">`);

									Label($$renderer, {
										for: 'clone-name',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Name`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Input($$renderer, {
										id: 'clone-name',
										placeholder: 'Monitor Name Copy',
										get value() {
											return cloneName;
										},

										set value($$value) {
											cloneName = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div></div> `);

									if (Dialog.Footer) {
										$$renderer.push('<!--[-->');

										Dialog.Footer($$renderer, {
											children: ($$renderer) => {
												Button($$renderer, {
													variant: 'outline',
													onclick: () => cloneDialogOpen = false,
													disabled: cloning,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cancel`);
													},
													$$slots: { default: true }
												});

												$$renderer.push(`<!----> `);

												Button($$renderer, {
													onclick: cloneMonitor,
													disabled: cloning || !cloneTag.trim() || !cloneName.trim(),
													children: ($$renderer) => {
														if (cloning) {
															$$renderer.push('<!--[0-->');
															Spinner($$renderer, { class: 'size-4' });
															$$renderer.push(`<!----> Cloning...`);
														} else {
															$$renderer.push(`<!--[-1-->Clone`);
														}

														$$renderer.push(`<!--]-->`);
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