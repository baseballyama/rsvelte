import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import PlusIcon from "@lucide/svelte/icons/plus";
import EditIcon from "@lucide/svelte/icons/pencil";
import ListIcon from "@lucide/svelte/icons/list";
import BellOffIcon from "@lucide/svelte/icons/bell-off";
import { goto } from "$app/navigation";
import { toast } from "svelte-sonner";
import GC from "$lib/global-constants";
import { getAlertText } from "$lib/alerts/alert-text";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// State
		let loading = true;

		let configs = [];
		let monitors = [];
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let monitorFilter = "";
		const limit = 20;

		// Fetch alert configs
		async function fetchConfigs() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getAlertConfigsPaginated",
						data: { page: pageNo, limit, monitor_tag: monitorFilter || undefined }
					})
				});

				const result = await response.json();

				if (!result.error) {
					configs = result.configs;
					totalCount = result.total;
					totalPages = Math.ceil(result.total / limit);
				}
			} catch(error) {
				console.error("Error fetching alert configs:", error);
			} finally {
				loading = false;
			}
		}

		// Fetch monitors for filter dropdown
		async function fetchMonitors() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitors", data: {} })
				});

				const result = await response.json();

				if (!result.error && Array.isArray(result)) {
					monitors = result.map((m) => ({ tag: m.tag, name: m.name }));
				}
			} catch(error) {
				console.error("Error fetching monitors:", error);
			}
		}

		// Toggle alert status
		async function toggleAlertStatus(config) {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "toggleMonitorAlertConfigStatus",
						data: { id: config.id }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success(result.is_active === "YES" ? "Alert activated" : "Alert deactivated");
					await fetchConfigs();
				}
			} catch(error) {
				toast.error("Failed to toggle alert status");
			}
		}

		// Get badge variant for severity
		function getSeverityBadgeVariant(severity) {
			switch (severity) {
				case "CRITICAL":
					return "destructive";

				case "WARNING":
					return "secondary";

				default:
					return "default";
			}
		}

		// Handle monitor filter change
		function handleMonitorChange(value) {
			monitorFilter = value || "";
			pageNo = 1;
			fetchConfigs();
		}

		// Pagination
		function goToPage(page) {
			pageNo = page;
			fetchConfigs();
		}

		$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);

		if (Select.Root) {
			$$renderer.push('<!--[-->');

			Select.Root($$renderer, {
				type: 'single',
				value: monitorFilter,
				onValueChange: handleMonitorChange,
				children: ($$renderer) => {
					if (Select.Trigger) {
						$$renderer.push('<!--[-->');

						Select.Trigger($$renderer, {
							class: 'w-48',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(monitorFilter
									? monitors.find((m) => m.tag === monitorFilter)?.name || monitorFilter
									: "All Monitors")}`);
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
								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: '',
										children: ($$renderer) => {
											$$renderer.push(`<!---->All Monitors`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` <!--[-->`);

								const each_array = $.ensure_array_like(monitors);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let monitor = each_array[$$index];

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: monitor.tag,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(monitor.name)}`);
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

		$$renderer.push(` `);

		if (loading) {
			$$renderer.push('<!--[0-->');
			Spinner($$renderer, { class: 'size-5' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		Button($$renderer, {
			onclick: () => goto(clientResolver(resolve, "/manage/app/alerts/new")),
			children: ($$renderer) => {
				PlusIcon($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> Create Alert`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="ktable rounded-lg border">`);

		if (Table.Root) {
			$$renderer.push('<!--[-->');

			Table.Root($$renderer, {
				children: ($$renderer) => {
					if (Table.Header) {
						$$renderer.push('<!--[-->');

						Table.Header($$renderer, {
							children: ($$renderer) => {
								if (Table.Row) {
									$$renderer.push('<!--[-->');

									Table.Row($$renderer, {
										children: ($$renderer) => {
											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
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

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Alert Type`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Severity`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<!---->Description`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													class: 'w-24',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Triggers`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													class: 'w-20 text-center',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Active`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Table.Head) {
												$$renderer.push('<!--[-->');

												Table.Head($$renderer, {
													class: 'w-32 text-right',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Actions`);
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

					if (Table.Body) {
						$$renderer.push('<!--[-->');

						Table.Body($$renderer, {
							children: ($$renderer) => {
								if (configs.length === 0 && !loading) {
									$$renderer.push('<!--[0-->');

									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														colspan: 7,
														class: 'text-muted-foreground py-16 text-center',
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex flex-col items-center gap-4">`);
															BellOffIcon($$renderer, { class: 'text-muted-foreground size-16' });

															$$renderer.push(`<!----> <div class="space-y-2"><h3 class="text-lg font-semibold">No alert configurations</h3> <p class="text-muted-foreground text-sm">${$.escape(monitorFilter
																? "No alerts found for this monitor."
																: "Create an alert to get notified when your monitors have issues.")}</p></div> `);

															Button($$renderer, {
																onclick: () => goto(clientResolver(resolve, "/manage/app/alerts/new")),
																children: ($$renderer) => {
																	PlusIcon($$renderer, { class: 'size-4' });
																	$$renderer.push(`<!----> Create Alert`);
																},
																$$slots: { default: true }
															});

															$$renderer.push(`<!----></div>`);
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
									$$renderer.push(`<!--[-1--><!--[-->`);

									const each_array_1 = $.ensure_array_like(configs);

									for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
										let config = each_array_1[$$index_3];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												class: config.is_active === GC.NO ? "opacity-60" : "",
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (config.monitor_tags && config.monitor_tags.length > 0) {
																	$$renderer.push(`<!--[0--><div class="flex flex-wrap gap-1"><!--[-->`);

																	const each_array_2 = $.ensure_array_like(config.monitor_tags);

																	for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																		let tag = each_array_2[$$index_1];

																		$$renderer.push(`<a${$.attr('href', clientResolver(resolve, `/manage/app/monitors/${tag}`))} class="text-primary text-sm font-medium hover:underline">${$.escape(monitors.find((m) => m.tag === tag)?.name || tag)}</a> `);

																		if (config.monitor_tags.indexOf(tag) < config.monitor_tags.length - 1) {
																			$$renderer.push(`<!--[0--><span class="text-muted-foreground">,</span>`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																		}

																		$$renderer.push(`<!--]-->`);
																	}

																	$$renderer.push(`<!--]--></div>`);
																} else {
																	$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">-</span>`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																Badge($$renderer, {
																	variant: 'outline',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(config.alert_for)}`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																Badge($$renderer, {
																	variant: getSeverityBadgeVariant(config.severity),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(config.severity)}`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (Tooltip.Root) {
																	$$renderer.push('<!--[-->');

																	Tooltip.Root($$renderer, {
																		children: ($$renderer) => {
																			if (Tooltip.Trigger) {
																				$$renderer.push('<!--[-->');

																				Tooltip.Trigger($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<div class="max-w-xs space-y-1"><p class="text-muted-foreground line-clamp-2 text-sm">${$.escape(getAlertText({
																							kind: "description",
																							alert_for: config.alert_for,
																							alert_value: config.alert_value,
																							failure_threshold: config.failure_threshold,
																							success_threshold: config.success_threshold
																						}))}</p></div>`);
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
																					class: 'max-w-md',
																					children: ($$renderer) => {
																						$$renderer.push(`<div class="space-y-2"><p class="text-sm">${$.escape(getAlertText({
																							kind: "description",
																							alert_for: config.alert_for,
																							alert_value: config.alert_value,
																							failure_threshold: config.failure_threshold,
																							success_threshold: config.success_threshold
																						}))}</p></div>`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (config.triggers && config.triggers.length > 0) {
																	$$renderer.push('<!--[0-->');

																	if (Tooltip.Root) {
																		$$renderer.push('<!--[-->');

																		Tooltip.Root($$renderer, {
																			children: ($$renderer) => {
																				if (Tooltip.Trigger) {
																					$$renderer.push('<!--[-->');

																					Tooltip.Trigger($$renderer, {
																						children: ($$renderer) => {
																							Badge($$renderer, {
																								variant: 'secondary',
																								class: 'cursor-pointer text-xs',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(config.triggers.length)} trigger${$.escape(config.triggers.length > 1 ? "s" : "")}`);
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

																				if (Tooltip.Content) {
																					$$renderer.push('<!--[-->');

																					Tooltip.Content($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<div class="space-y-1"><!--[-->`);

																							const each_array_3 = $.ensure_array_like(config.triggers);

																							for (let $$index_2 = 0, $$length = each_array_3.length; $$index_2 < $$length; $$index_2++) {
																								let trigger = each_array_3[$$index_2];

																								$$renderer.push(`<div class="text-sm">${$.escape(trigger.name)}</div>`);
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
																} else {
																	$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">-</span>`);
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'text-center',
															children: ($$renderer) => {
																Switch($$renderer, {
																	checked: config.is_active === GC.YES,
																	onCheckedChange: () => toggleAlertStatus(config)
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

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'text-right',
															children: ($$renderer) => {
																$$renderer.push(`<div class="flex items-center justify-end gap-1">`);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => goto(clientResolver(resolve, `/manage/app/alerts/${config.id}`)),
																	children: ($$renderer) => {
																		EditIcon($$renderer, { class: 'size-3' });
																		$$renderer.push(`<!----> Edit`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----> `);

																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: () => goto(clientResolver(resolve, `/manage/app/alerts/logs/${config.id}`)),
																	children: ($$renderer) => {
																		ListIcon($$renderer, { class: 'size-3' });
																		$$renderer.push(`<!----> Logs`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push(`<!----></div>`);
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

									$$renderer.push(`<!--]-->`);
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

		$$renderer.push(`</div> `);

		if (totalCount > 0) {
			$$renderer.push('<!--[0-->');

			const startItem = (pageNo - 1) * limit + 1;
			const endItem = Math.min(pageNo * limit, totalCount);

			$$renderer.push(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm">Showing ${$.escape(startItem)}-${$.escape(endItem)} of ${$.escape(totalCount)}</span> `);

			if (totalPages > 1) {
				$$renderer.push(`<!--[0--><div class="flex items-center gap-2">`);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					disabled: pageNo === 1,
					onclick: () => goToPage(pageNo - 1),
					children: ($$renderer) => {
						ChevronLeftIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="flex items-center gap-1"><!--[-->`);

				const each_array_4 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let page = each_array_4[$$index_4];

					if (page === 1 || page === totalPages || page >= pageNo - 1 && page <= pageNo + 1) {
						$$renderer.push('<!--[0-->');

						Button($$renderer, {
							variant: page === pageNo ? "default" : "ghost",
							size: 'sm',
							onclick: () => goToPage(page),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page)}`);
							},
							$$slots: { default: true }
						});
					} else if (page === pageNo - 2 || page === pageNo + 2) {
						$$renderer.push(`<!--[1--><span class="text-muted-foreground px-1">...</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div> `);

				Button($$renderer, {
					variant: 'outline',
					size: 'icon',
					disabled: pageNo === totalPages,
					onclick: () => goToPage(pageNo + 1),
					children: ($$renderer) => {
						ChevronRightIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}