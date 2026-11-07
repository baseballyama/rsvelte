import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import BlendIcon from "@lucide/svelte/icons/blend";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import PlusIcon from "@lucide/svelte/icons/plus";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import PencilIcon from "@lucide/svelte/icons/pencil";
import CalendarIcon from "@lucide/svelte/icons/calendar";
import RepeatIcon from "@lucide/svelte/icons/repeat";
import ClockIcon from "@lucide/svelte/icons/clock";
import UsersIcon from "@lucide/svelte/icons/users";
import { goto } from "$app/navigation";

import {
	format,
	formatDistanceToNow,
	isPast,
	isFuture,
	isWithinInterval
} from "date-fns";

import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// Types
		// State
		let loading = true;

		let maintenances = [];
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let status = "ACTIVE";
		const limit = 10;

		// Fetch maintenances
		async function fetchData() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getMaintenances",
						data: {
							page: pageNo,
							limit,
							filter: { status: status === "ALL" ? undefined : status }
						}
					})
				});

				const result = await response.json();

				if (!result.error) {
					maintenances = result.maintenances;
					totalCount = result.total;
					totalPages = Math.ceil(result.total / limit);
				}
			} catch(error) {
				console.error("Error fetching maintenances:", error);
			} finally {
				loading = false;
			}
		}

		// Check if RRULE is one-time (contains COUNT=1)
		function isOneTime(rrule) {
			return rrule.includes("COUNT=1");
		}

		// Format duration in seconds
		function formatDuration(seconds) {
			if (seconds < 60) return `${seconds}s`;

			const minutes = Math.floor(seconds / 60);

			if (minutes < 60) return `${minutes}m`;

			const hours = Math.floor(minutes / 60);
			const mins = minutes % 60;

			if (mins === 0) return `${hours}h`;

			return `${hours}h ${mins}m`;
		}

		// Get status badge variant
		function getStatusBadgeVariant(status) {
			switch (status) {
				case "ACTIVE":
					return "default";

				case "INACTIVE":
					return "secondary";

				default:
					return "outline";
			}
		}

		// Compute event display status based on current time
		function getEventDisplayStatus(event) {
			const now = new Date();
			const startDate = new Date(event.start_date_time * 1000);
			const endDate = new Date(event.end_date_time * 1000);

			// Check if currently ongoing
			if (isWithinInterval(now, { start: startDate, end: endDate })) {
				return { label: "Ongoing", variant: "default" };
			}

			// Check if in the future (upcoming)
			if (isFuture(startDate)) {
				const distance = formatDistanceToNow(startDate, { addSuffix: false });

				return { label: `In ${distance}`, variant: "outline" };
			}

			// If in the past (completed)
			if (isPast(endDate)) {
				return { label: "Completed", variant: "secondary" };
			}

			// Fallback
			return { label: "Scheduled", variant: "outline" };
		}

		// Navigate to maintenance
		function openMaintenance(id) {
			goto(clientResolver(resolve, `/manage/app/maintenances/${id}`));
		}

		// Create new maintenance
		function createNewMaintenance() {
			goto(clientResolver(resolve, "/manage/app/maintenances/new"));
		}

		// Handle status filter change
		function handleStatusChange(value) {
			if (value) {
				status = value;
				pageNo = 1;
				fetchData();
			}
		}

		// Pagination
		function goToPage(page) {
			pageNo = page;
			fetchData();
		}

		$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);

		if (Select.Root) {
			$$renderer.push('<!--[-->');

			Select.Root($$renderer, {
				type: 'single',
				value: status,
				onValueChange: handleStatusChange,
				children: ($$renderer) => {
					if (Select.Trigger) {
						$$renderer.push('<!--[-->');

						Select.Trigger($$renderer, {
							class: 'w-40',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(status === "ALL" ? "All" : status === "ACTIVE" ? "Active" : "Inactive")}`);
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
											$$renderer.push(`<!---->All`);
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
										value: 'ACTIVE',
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

								if (Select.Item) {
									$$renderer.push('<!--[-->');

									Select.Item($$renderer, {
										value: 'INACTIVE',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Inactive`);
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

		if (loading) {
			$$renderer.push('<!--[0-->');
			Spinner($$renderer, { class: 'size-5' });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-3">`);

		Button($$renderer, {
			onclick: createNewMaintenance,
			children: ($$renderer) => {
				PlusIcon($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> New Maintenance`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div>  <div class="ktable rounded-xl border">`);

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
													children: ($$renderer) => {
														$$renderer.push(`<!---->Title`);
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
													class: 'w-40',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Duration`);
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
													class: 'w-40',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Next Event`);
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
													class: 'w-24 text-right',
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
								if (maintenances.length === 0 && !loading) {
									$$renderer.push('<!--[0-->');

									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														colspan: 8,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->No maintenances found`);
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

									const each_array = $.ensure_array_like(maintenances);

									for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
										let maintenance = each_array[$$index_1];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												class: 'hover:bg-muted/50 cursor-pointer',
												onclick: () => openMaintenance(maintenance.id),
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'font-medium',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(maintenance.id)}`);
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
																						$$renderer.push(`<span class="line-clamp-1 max-w-xs">${$.escape(maintenance.title)}</span>`);
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
																						$$renderer.push(`<p class="max-w-md">${$.escape(maintenance.title)}</p> `);

																						if (maintenance.description) {
																							$$renderer.push(`<!--[0--><p class="text-muted-foreground mt-1 text-sm">${$.escape(maintenance.description)}</p>`);
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
																	class: 'gap-1',
																	children: ($$renderer) => {
																		if (isOneTime(maintenance.rrule)) {
																			$$renderer.push('<!--[0-->');
																			CalendarIcon($$renderer, { class: 'size-3' });
																			$$renderer.push(`<!----> One-Time`);
																		} else {
																			$$renderer.push('<!--[-1-->');
																			RepeatIcon($$renderer, { class: 'size-3' });
																			$$renderer.push(`<!----> Recurring`);
																		}

																		$$renderer.push(`<!--]-->`);
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
																						$$renderer.push(`<div class="flex items-center gap-1">`);
																						ClockIcon($$renderer, { class: 'text-muted-foreground size-3' });
																						$$renderer.push(`<!----> <span class="text-muted-foreground text-sm">${$.escape(formatDuration(maintenance.duration_seconds))}</span></div>`);
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
																						$$renderer.push(`<div class="text-sm"><div><span class="text-muted-foreground">Start:</span> ${$.escape(format(new Date(maintenance.start_date_time * 1000), "yyyy-MM-dd HH:mm"))}</div> <div><span class="text-muted-foreground">Duration:</span> ${$.escape(formatDuration(maintenance.duration_seconds))}</div> <div><span class="text-muted-foreground">RRULE:</span> ${$.escape(maintenance.rrule)}</div></div>`);
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
																if (maintenance.monitors && maintenance.monitors.length > 0) {
																	$$renderer.push('<!--[0-->');

																	if (Tooltip.Root) {
																		$$renderer.push('<!--[-->');

																		Tooltip.Root($$renderer, {
																			children: ($$renderer) => {
																				if (Tooltip.Trigger) {
																					$$renderer.push('<!--[-->');

																					Tooltip.Trigger($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<div class="flex items-center gap-1">`);
																							BlendIcon($$renderer, { class: 'text-muted-foreground size-3' });
																							$$renderer.push(`<!----> <span class="text-sm">${$.escape(maintenance.monitors.length)}</span></div>`);
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
																							$$renderer.push(`<div class="text-sm"><!--[-->`);

																							const each_array_1 = $.ensure_array_like(maintenance.monitors);

																							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																								let monitor = each_array_1[$$index];

																								$$renderer.push(`<div>${$.escape(monitor.monitor_tag)}</div>`);
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
																	$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">None</span>`);
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
																if (maintenance.upcoming_event) {
																	$$renderer.push('<!--[0-->');

																	const displayStatus = getEventDisplayStatus(maintenance.upcoming_event);

																	if (Tooltip.Root) {
																		$$renderer.push('<!--[-->');

																		Tooltip.Root($$renderer, {
																			children: ($$renderer) => {
																				if (Tooltip.Trigger) {
																					$$renderer.push('<!--[-->');

																					Tooltip.Trigger($$renderer, {
																						children: ($$renderer) => {
																							Badge($$renderer, {
																								variant: displayStatus.variant,
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(displayStatus.label)}`);
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
																							$$renderer.push(`<div class="text-sm"><div><span class="text-muted-foreground">Start:</span> ${$.escape(format(new Date(maintenance.upcoming_event.start_date_time * 1000), "MMM d, yyyy HH:mm"))}</div> <div><span class="text-muted-foreground">End:</span> ${$.escape(format(new Date(maintenance.upcoming_event.end_date_time * 1000), "MMM d, yyyy HH:mm"))}</div></div>`);
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
																	$$renderer.push(`<!--[-1--><span class="text-muted-foreground text-sm">No events</span>`);
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
																	variant: getStatusBadgeVariant(maintenance.status),
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(maintenance.status)}`);
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
															class: 'text-right',
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: (e) => {
																		e.stopPropagation();
																		openMaintenance(maintenance.id);
																	},

																	children: ($$renderer) => {
																		PencilIcon($$renderer, { class: 'size-4' });
																		$$renderer.push(`<!----> Edit`);
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

		$$renderer.push(`<!--]--></div>`);
	});
}