import * as $ from 'svelte/internal/server';
import { goto } from "$app/navigation";
import { onMount } from "svelte";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import { Checkbox } from "$lib/components/ui/checkbox/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ArrowLeftIcon from "@lucide/svelte/icons/arrow-left";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import BellOffIcon from "@lucide/svelte/icons/bell-off";
import TrashIcon from "@lucide/svelte/icons/trash";
import { format } from "date-fns";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const alertConfigId = $.derived(() => data.alert_config_id);

		// State
		let loading = true;

		let alerts = [];
		let configInfo = null;
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let statusFilter = "ALL";
		const limit = 20;

		// Delete dialog state
		let deleteDialogOpen = false;

		let alertToDelete = null;
		let deleteIncident = false;

		// Fetch config info
		async function fetchConfigInfo() {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getMonitorAlertConfigById",
						data: { id: parseInt(alertConfigId()) }
					})
				});

				const result = await response.json();

				if (!result.error) {
					configInfo = result;
				}
			} catch(error) {
				console.error("Error fetching config info:", error);
			}
		}

		// Fetch alerts
		async function fetchAlerts() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getAllAlertsPaginated",
						data: {
							page: pageNo,
							limit,
							config_id: parseInt(alertConfigId()),
							status: statusFilter
						}
					})
				});

				const result = await response.json();

				if (!result.error) {
					alerts = result.alerts || [];
					totalCount = result.total || 0;
					totalPages = Math.ceil(totalCount / limit);
				}
			} catch(error) {
				console.error("Error fetching alerts:", error);
			} finally {
				loading = false;
			}
		}

		// Update alert status
		async function updateAlertStatus(alertId, newStatus) {
			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "updateMonitorAlertV2Status",
						data: { id: alertId, status: newStatus }
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success(`Status updated to ${newStatus}`);
					await fetchAlerts();
				}
			} catch(error) {
				toast.error("Failed to update status");
			}
		}

		// Open delete dialog
		function openDeleteDialog(alert) {
			alertToDelete = alert;
			deleteIncident = false;
			deleteDialogOpen = true;
		}

		// Delete alert
		async function confirmDelete() {
			if (!alertToDelete) return;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteMonitorAlertV2",
						data: {
							id: alertToDelete.id,
							deleteIncident,
							incident_id: alertToDelete.incident_id
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Alert deleted successfully");
					await fetchAlerts();
				}
			} catch(error) {
				toast.error("Failed to delete alert");
			} finally {
				deleteDialogOpen = false;
				alertToDelete = null;
			}
		}

		// Format date
		function formatDate(dateStr) {
			try {
				const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;

				return format(date, "yyyy-MM-dd HH:mm:ss");
			} catch {
				return String(dateStr);
			}
		}

		// Handle filter change
		function handleStatusChange(value) {
			if (value) {
				statusFilter = value;
				pageNo = 1;
				fetchAlerts();
			}
		}

		// Pagination
		function goToPage(page) {
			pageNo = page;
			fetchAlerts();
		}

		onMount(async () => {
			await Promise.all([fetchConfigInfo(), fetchAlerts()]);
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6">`);

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
														href: clientResolver(resolve, "/manage/app/alerts"),
														children: ($$renderer) => {
															$$renderer.push(`<!---->Alerts`);
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
															$$renderer.push(`<!---->Alert Logs`);
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

			$$renderer.push(`  <div class="flex items-center gap-3">`);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					value: statusFilter,
					onValueChange: handleStatusChange,
					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								class: 'w-36',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(statusFilter === "ALL" ? "All Status" : statusFilter)}`);
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
											value: 'ALL',
											children: ($$renderer) => {
												$$renderer.push(`<!---->All Status`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'TRIGGERED',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Triggered`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: 'RESOLVED',
											children: ($$renderer) => {
												$$renderer.push(`<!---->Resolved`);
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

			if (loading) {
				$$renderer.push('<!--[0-->');
				Spinner($$renderer, { class: 'size-5' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (!loading && alerts.length === 0) {
				$$renderer.push(`<!--[0--><div class="flex flex-col items-center gap-4 py-16 text-center">`);
				BellOffIcon($$renderer, { class: 'text-muted-foreground size-16' });

				$$renderer.push(`<!----> <div class="space-y-2"><h3 class="text-lg font-semibold">No alert logs</h3> <p class="text-muted-foreground text-sm">${$.escape(statusFilter !== "ALL"
					? `No ${statusFilter.toLowerCase()} alerts found.`
					: "This alert has not been triggered yet.")}</p></div></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="ktable rounded-lg border">`);

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
															class: 'w-16',
															children: ($$renderer) => {
																$$renderer.push(`<!---->ID`);
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
															class: 'w-40',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Monitor`);
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
															class: 'w-40',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Status`);
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
															class: 'w-32',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Incident`);
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
															class: 'w-44',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Created At`);
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
															class: 'w-44',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Updated At`);
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
															class: 'w-20 text-right',
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
										$$renderer.push(`<!--[-->`);

										const each_array = $.ensure_array_like(alerts);

										for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
											let alert = each_array[$$index];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													class: 'hover:bg-muted/50',
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																class: 'font-medium',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(alert.id)}`);
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
																	if (alert.monitor_tag) {
																		$$renderer.push('<!--[0-->');

																		Badge($$renderer, {
																			variant: 'outline',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(alert.monitor_tag)}`);
																			},
																			$$slots: { default: true }
																		});
																	} else {
																		$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">—</span>`);
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
																	if (Select.Root) {
																		$$renderer.push('<!--[-->');

																		Select.Root($$renderer, {
																			type: 'single',
																			value: alert.alert_status,
																			onValueChange: (v) => v && updateAlertStatus(alert.id, v),
																			children: ($$renderer) => {
																				if (Select.Trigger) {
																					$$renderer.push('<!--[-->');

																					Select.Trigger($$renderer, {
																						class: 'h-8 w-32',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(alert.alert_status)}`);
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
																									value: 'TRIGGERED',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->TRIGGERED`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` `);

																							if (Select.Item) {
																								$$renderer.push('<!--[-->');

																								Select.Item($$renderer, {
																									value: 'RESOLVED',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->RESOLVED`);
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

														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	if (alert.incident_id) {
																		$$renderer.push(`<!--[0--><a${$.attr('href', clientResolver(resolve, `/manage/app/incidents/${alert.incident_id}`))} class="text-primary inline-flex items-center gap-1 text-sm hover:underline">#${$.escape(alert.incident_id)} `);
																		ExternalLinkIcon($$renderer, { class: 'size-3' });
																		$$renderer.push(`<!----></a>`);
																	} else {
																		$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">—</span>`);
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
																class: 'text-muted-foreground text-sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(formatDate(alert.created_at))}`);
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
																class: 'text-muted-foreground text-sm',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->${$.escape(formatDate(alert.updated_at))}`);
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
																	Button($$renderer, {
																		variant: 'destructive',
																		size: 'sm',
																		class: 'text-xs',
																		onclick: () => openDeleteDialog(alert),
																		children: ($$renderer) => {
																			TrashIcon($$renderer, { class: 'size-3' });
																			$$renderer.push(`<!----> Delete`);
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

				$$renderer.push(`</div>`);
			}

			$$renderer.push(`<!--]--> `);

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

					const each_array_1 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

					for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
						let page = each_array_1[$$index_1];

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

			$$renderer.push(`<!--]--></div> `);

			if (AlertDialog.Root) {
				$$renderer.push('<!--[-->');

				AlertDialog.Root($$renderer, {
					get open() {
						return deleteDialogOpen;
					},

					set open($$value) {
						deleteDialogOpen = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (AlertDialog.Content) {
							$$renderer.push('<!--[-->');

							AlertDialog.Content($$renderer, {
								children: ($$renderer) => {
									if (AlertDialog.Header) {
										$$renderer.push('<!--[-->');

										AlertDialog.Header($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Title) {
													$$renderer.push('<!--[-->');

													AlertDialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete Alert`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Description) {
													$$renderer.push('<!--[-->');

													AlertDialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Are you sure you want to delete this alert? This action cannot be undone.`);
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

									if (alertToDelete?.incident_id) {
										$$renderer.push(`<!--[0--><div class="flex items-center gap-3 py-2">`);

										Checkbox($$renderer, {
											id: 'delete-incident',
											get checked() {
												return deleteIncident;
											},

											set checked($$value) {
												deleteIncident = $$value;
												$$settled = false;
											}
										});

										$$renderer.push(`<!----> <label for="delete-incident" class="text-sm">Also delete associated incident <span class="text-primary font-medium">#${$.escape(alertToDelete.incident_id)}</span></label></div>`);
									} else {
										$$renderer.push('<!--[-1-->');
									}

									$$renderer.push(`<!--]--> `);

									if (AlertDialog.Footer) {
										$$renderer.push('<!--[-->');

										AlertDialog.Footer($$renderer, {
											children: ($$renderer) => {
												if (AlertDialog.Cancel) {
													$$renderer.push('<!--[-->');

													AlertDialog.Cancel($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Cancel`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (AlertDialog.Action) {
													$$renderer.push('<!--[-->');

													AlertDialog.Action($$renderer, {
														onclick: confirmDelete,
														children: ($$renderer) => {
															$$renderer.push(`<!---->Delete`);
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
	});
}