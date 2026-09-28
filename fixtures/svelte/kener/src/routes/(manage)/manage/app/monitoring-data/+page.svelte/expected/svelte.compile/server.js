import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Label } from "$lib/components/ui/label/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import SearchIcon from "@lucide/svelte/icons/search";
import TrashIcon from "@lucide/svelte/icons/trash";
import FilterIcon from "@lucide/svelte/icons/filter";
import XIcon from "@lucide/svelte/icons/x";
import { format } from "date-fns";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";
import GC, { isMonitoringStatus } from "$lib/global-constants";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		// Helper to format datetime as YYYY-MM-DDTHH:mm for datetime-local input
		function formatDateTimeForInput(date) {
			return format(date, "yyyy-MM-dd'T'HH:mm");
		}

		// Helper to format date only as YYYY-MM-DD for min/max constraints
		function formatDateForInput(date) {
			return format(date, "yyyy-MM-dd");
		}

		// Helper to get date N days ago
		function getDaysAgo(days) {
			const date = new Date();

			date.setDate(date.getDate() - days);

			return date;
		}

		// Default date range: last 24 hours
		const now = new Date();

		const yesterday = getDaysAgo(1);
		const maxDaysAgoDate = getDaysAgo(30);

		// State
		let loading = true;

		let deleting = false;
		let deleteDialogOpen = false;
		let monitoringData = [];
		let monitors = [];
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let showFilters = false;
		let monitorTagFilter = "ALL";
		let statusFilter = "ALL";
		let startDateTime = formatDateTimeForInput(yesterday);
		let endDateTime = formatDateTimeForInput(now);
		const limit = 50;
		const hasActiveFilters = $.derived(() => monitorTagFilter !== "ALL" || statusFilter !== "ALL" || startDateTime !== formatDateTimeForInput(yesterday) || endDateTime !== formatDateTimeForInput(now));

		// Convert datetime string (YYYY-MM-DDTHH:mm) to Unix timestamp (seconds)
		function dateTimeStringToTimestamp(dateTimeStr) {
			const date = new Date(dateTimeStr);

			return Math.floor(date.getTime() / 1000);
		}

		// Validate date range (max 30 days) and clamp values
		function validateDates() {
			const start = new Date(startDateTime);
			const end = new Date(endDateTime);

			if (start > end) {
				startDateTime = endDateTime;
			}

			const daysDiff = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

			if (daysDiff > 30) {
				const newEnd = new Date(start);

				newEnd.setDate(newEnd.getDate() + 30);

				if (newEnd > now) {
					endDateTime = formatDateTimeForInput(now);
				} else {
					endDateTime = formatDateTimeForInput(newEnd);
				}
			}
		}

		function applyFilters() {
			validateDates();
			pageNo = 1;
			fetchData();
		}

		function clearFilters() {
			monitorTagFilter = "ALL";
			statusFilter = "ALL";
			startDateTime = formatDateTimeForInput(yesterday);
			endDateTime = formatDateTimeForInput(now);
			pageNo = 1;
			fetchData();
		}

		function openDeleteDialog() {
			validateDates();
			deleteDialogOpen = true;
		}

		async function deleteFilteredData() {
			deleteDialogOpen = false;

			const startTs = dateTimeStringToTimestamp(startDateTime);
			const endTs = dateTimeStringToTimestamp(endDateTime);

			deleting = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "deleteMonitorData",
						data: {
							tag: monitorTagFilter === "ALL" ? "" : monitorTagFilter,
							status: statusFilter === "ALL" ? undefined : statusFilter,
							start: startTs,
							end: endTs
						}
					})
				});

				const result = await response.json();

				if (result.error) {
					toast.error(result.error);
				} else {
					toast.success("Monitoring data deleted successfully");
					monitorTagFilter = "ALL";
					pageNo = 1;
					fetchData();
				}
			} catch(e) {
				toast.error("Failed to delete monitoring data");
			} finally {
				deleting = false;
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

		// Fetch monitoring data
		async function fetchData() {
			loading = true;

			try {
				const requestData = {
					page: pageNo,
					limit,
					monitor_tag: monitorTagFilter,
					status: statusFilter
				};

				if (startDateTime) {
					requestData.start_time = dateTimeStringToTimestamp(startDateTime);
				}

				if (endDateTime) {
					requestData.end_time = dateTimeStringToTimestamp(endDateTime);
				}

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitoringDataPaginated", data: requestData })
				});

				const result = await response.json();

				if (!result.error) {
					monitoringData = result.data;
					totalCount = result.total;
					totalPages = Math.ceil(result.total / limit);
				}
			} catch(error) {
				console.error("Error fetching monitoring data:", error);
			} finally {
				loading = false;
			}
		}

		// Format timestamp to date string
		function formatTimestamp(timestamp) {
			try {
				const date = new Date(timestamp * 1000);

				return format(date, "yyyy-MM-dd HH:mm:ss");
			} catch {
				return String(timestamp);
			}
		}

		function handleMonitorChange(value) {
			if (value) {
				monitorTagFilter = value;
			}
		}

		function handleStatusChange(value) {
			if (value === "ALL" || isMonitoringStatus(value)) {
				statusFilter = value;
			}
		}

		// Pagination
		function goToPage(page) {
			pageNo = page;
			fetchData();
		}

		onMount(() => {
			fetchMonitors();
			fetchData();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex flex-col gap-3"><div class="flex items-center gap-2">`);

			Button($$renderer, {
				variant: showFilters ? "default" : "outline",
				size: 'sm',
				onclick: () => showFilters = !showFilters,
				children: ($$renderer) => {
					FilterIcon($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----> Filters `);

					if (hasActiveFilters()) {
						$$renderer.push('<!--[0-->');

						Badge($$renderer, {
							variant: 'secondary',
							class: 'ml-1 px-1.5 py-0 text-[10px]',
							children: ($$renderer) => {
								$$renderer.push(`<!---->ON`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (loading) {
				$$renderer.push('<!--[0-->');
				Spinner($$renderer, { class: 'size-5' });
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (showFilters) {
				$$renderer.push(`<!--[0--><div class="bg-muted/50 flex flex-wrap items-end gap-3 rounded-lg border p-3"><div class="flex flex-col gap-1">`);

				Label($$renderer, {
					for: 'start-datetime',
					class: 'text-muted-foreground text-xs font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<!---->From`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'start-datetime',
					type: 'datetime-local',
					min: formatDateTimeForInput(maxDaysAgoDate),
					max: endDateTime,
					get value() {
						return startDateTime;
					},

					set value($$value) {
						startDateTime = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div class="flex flex-col gap-1">`);

				Label($$renderer, {
					for: 'end-datetime',
					class: 'text-muted-foreground text-xs font-medium',
					children: ($$renderer) => {
						$$renderer.push(`<!---->To`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Input($$renderer, {
					id: 'end-datetime',
					type: 'datetime-local',
					min: startDateTime,
					max: formatDateTimeForInput(now),
					get value() {
						return endDateTime;
					},

					set value($$value) {
						endDateTime = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Monitor</span> `);

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						value: monitorTagFilter,
						onValueChange: handleMonitorChange,
						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									class: 'w-48',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(monitorTagFilter === "ALL" ? "All Monitors" : monitorTagFilter)}`);
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
														$$renderer.push(`<!---->${$.escape(monitor.name || monitor.tag)}`);
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

				$$renderer.push(`</div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Status</span> `);

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
									'aria-label': 'Status',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(statusFilter === "ALL" ? "All Statuses" : statusFilter)}`);
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
													$$renderer.push(`<!---->All Statuses`);
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
												value: GC.UP,
												children: ($$renderer) => {
													$$renderer.push(`<!---->UP`);
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
												value: GC.DOWN,
												children: ($$renderer) => {
													$$renderer.push(`<!---->DOWN`);
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
												value: GC.DEGRADED,
												children: ($$renderer) => {
													$$renderer.push(`<!---->DEGRADED`);
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

				$$renderer.push(`</div> `);

				Button($$renderer, {
					size: 'sm',
					onclick: applyFilters,
					children: ($$renderer) => {
						SearchIcon($$renderer, { class: 'size-4' });
						$$renderer.push(`<!----> Search`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'destructive',
					onclick: openDeleteDialog,
					disabled: deleting,
					children: ($$renderer) => {
						if (deleting) {
							$$renderer.push('<!--[0-->');
							Spinner($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----> Deleting...`);
						} else {
							$$renderer.push('<!--[-1-->');
							TrashIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----> Delete`);
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (hasActiveFilters()) {
					$$renderer.push('<!--[0-->');

					Button($$renderer, {
						variant: 'ghost',
						size: 'sm',
						onclick: clearFilters,
						children: ($$renderer) => {
							XIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----> Clear`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> <div class="ktable rounded-xl border">`);

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
															$$renderer.push(`<!---->Monitor Tag`);
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
														class: 'w-48',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Timestamp`);
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
														class: 'w-24',
														children: ($$renderer) => {
															$$renderer.push(`<!---->Latency`);
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
															$$renderer.push(`<!---->Type`);
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
															$$renderer.push(`<!---->Error Message`);
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
									if (monitoringData.length === 0 && !loading) {
										$$renderer.push('<!--[0-->');

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															colspan: 6,
															class: 'text-muted-foreground py-8 text-center',
															children: ($$renderer) => {
																$$renderer.push(`<!---->No monitoring data found`);
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

										const each_array_1 = $.ensure_array_like(monitoringData);

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let row = each_array_1[$$index_1];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													class: 'hover:bg-muted/50',
													children: ($$renderer) => {
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
																							$$renderer.push(`<span class="line-clamp-1 max-w-xs font-medium">${$.escape(row.monitor_tag)}</span>`);
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
																							$$renderer.push(`<p>${$.escape(row.monitor_tag)}</p>`);
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
																	$$renderer.push(`<span class="text-muted-foreground text-sm">${$.escape(formatTimestamp(row.timestamp))}</span>`);
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
																	$$renderer.push(`<span${$.attr_class(`text-xs font-semibold text-${$.stringify(row.status?.toLowerCase())}`)}>${$.escape(row.status || "N/A")}</span>`);
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
																	if (row.latency !== null) {
																		$$renderer.push(`<!--[0--><span class="text-sm">${$.escape(row.latency)} ms</span>`);
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
																	if (row.type) {
																		$$renderer.push('<!--[0-->');

																		Badge($$renderer, {
																			variant: 'secondary',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->${$.escape(row.type)}`);
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
																	if (row.error_message) {
																		$$renderer.push('<!--[0-->');

																		if (Tooltip.Root) {
																			$$renderer.push('<!--[-->');

																			Tooltip.Root($$renderer, {
																				children: ($$renderer) => {
																					if (Tooltip.Trigger) {
																						$$renderer.push('<!--[-->');

																						Tooltip.Trigger($$renderer, {
																							children: ($$renderer) => {
																								$$renderer.push(`<span class="text-destructive line-clamp-1 max-w-xs text-sm">${$.escape(row.error_message)}</span>`);
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
																								$$renderer.push(`<p class="wrap-break-word">${$.escape(row.error_message)}</p>`);
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

					const each_array_2 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let page = each_array_2[$$index_2];

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
															$$renderer.push(`<!---->Delete Monitoring Data`);
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
															$$renderer.push(`<!---->This will delete monitoring data for `);

															if (monitorTagFilter === "ALL") {
																$$renderer.push(`<!--[0--><strong>all monitors</strong>`);
															} else {
																$$renderer.push(`<!--[-1--><strong>${$.escape(monitorTagFilter)}</strong>`);
															}

															$$renderer.push(`<!--]--> `);

															if (statusFilter !== "ALL") {
																$$renderer.push(`<!--[0-->with status <strong>${$.escape(statusFilter)}</strong>`);
															} else {
																$$renderer.push('<!--[-1-->');
															}

															$$renderer.push(`<!--]--> from ${$.escape(startDateTime)} to ${$.escape(endDateTime)}.
        This action cannot be undone.`);
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
														onclick: deleteFilteredData,
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