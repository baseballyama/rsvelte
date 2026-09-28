import * as $ from 'svelte/internal/server';
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Tooltip from "$lib/components/ui/tooltip/index.js";
import PlusIcon from "@lucide/svelte/icons/plus";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import PencilIcon from "@lucide/svelte/icons/pencil";
import SirenIcon from "@lucide/svelte/icons/siren";
import { goto } from "$app/navigation";
import { formatDistanceToNow } from "date-fns";
import { formatDate } from "$lib/stores/datetime";
import GC from "$lib/global-constants";
import { resolve } from "$app/paths";
import clientResolver from "$lib/client/resolver.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		// State
		let loading = true;

		let incidents = [];
		let totalPages = 0;
		let totalCount = 0;
		let pageNo = 1;
		let stateFilter = "ALL";
		const limit = 10;

		const stateOptions = [
			{ value: "ALL", label: "All States" },
			{ value: GC.INVESTIGATING, label: "Investigating" },
			{ value: GC.IDENTIFIED, label: "Identified" },
			{ value: GC.MONITORING, label: "Monitoring" },
			{ value: GC.RESOLVED, label: "Resolved" }
		];

		// Fetch incidents
		async function fetchData() {
			loading = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "getIncidents",
						data: {
							page: pageNo,
							limit,
							filter: {
								status: "OPEN",
								state: stateFilter === "ALL" ? undefined : stateFilter
							}
						}
					})
				});

				const result = await response.json();

				if (!result.error) {
					incidents = result.incidents.map((incident) => {
						// Calculate duration
						let duration;

						if (!incident.end_date_time) {
							duration = formatDistanceToNow(new Date(incident.start_date_time * 1000), { addSuffix: false });
						} else {
							const durationMs = (incident.end_date_time - incident.start_date_time) * 1000;

							duration = formatDuration(durationMs);
						}

						return { ...incident, duration };
					});

					totalCount = result.total;
					totalPages = Math.ceil(result.total / limit);
				}
			} catch(error) {
				console.error("Error fetching incidents:", error);
			} finally {
				loading = false;
			}
		}

		// Format duration from milliseconds
		function formatDuration(ms) {
			const seconds = Math.floor(ms / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const days = Math.floor(hours / 24);

			if (days > 0) return `${days}d ${hours % 24}h`;
			if (hours > 0) return `${hours}h ${minutes % 60}m`;
			if (minutes > 0) return `${minutes}m`;

			return `${seconds}s`;
		}

		// Get state badge variant
		function getStateBadgeVariant(state) {
			switch (state) {
				case GC.RESOLVED:
					return "default";

				case GC.MONITORING:
					return "secondary";

				case GC.IDENTIFIED:
					return "outline";

				case GC.INVESTIGATING:

				default:
					return "destructive";
			}
		}

		// Navigate to incident
		function openIncident(id) {
			goto(clientResolver(resolve, `/manage/app/incidents/${id}`));
		}

		// Create new incident
		function createNewIncident() {
			goto(clientResolver(resolve, "/manage/app/incidents/new"));
		}

		// Handle state filter change
		function handleStateFilterChange(value) {
			if (value) {
				stateFilter = value;
				pageNo = 1;
				fetchData();
			}
		}

		// Pagination
		function goToPage(page) {
			pageNo = page;
			fetchData();
		}

		$$renderer.push(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center gap-3">`);

		if (Select.Root) {
			$$renderer.push('<!--[-->');

			Select.Root($$renderer, {
				type: 'single',
				value: stateFilter,
				onValueChange: handleStateFilterChange,
				children: ($$renderer) => {
					if (Select.Trigger) {
						$$renderer.push('<!--[-->');

						Select.Trigger($$renderer, {
							class: 'w-44',
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(stateOptions.find((o) => o.value === stateFilter)?.label || "All States")}`);
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

								const each_array = $.ensure_array_like(stateOptions);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let option = each_array[$$index];

									if (Select.Item) {
										$$renderer.push('<!--[-->');

										Select.Item($$renderer, {
											value: option.value,
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(option.label)}`);
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

		$$renderer.push(`<!--]--></div> <div class="flex items-center gap-3">`);

		Button($$renderer, {
			onclick: createNewIncident,
			children: ($$renderer) => {
				PlusIcon($$renderer, { class: 'size-4' });
				$$renderer.push(`<!----> New Incident`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <div class="ktable rounded-2xl border">`);

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
													class: 'w-40',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Started`);
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
													class: 'w-36',
													children: ($$renderer) => {
														$$renderer.push(`<!---->State`);
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
														$$renderer.push(`<!---->Affects`);
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
								if (incidents.length === 0 && !loading) {
									$$renderer.push('<!--[0-->');

									if (Table.Row) {
										$$renderer.push('<!--[-->');

										Table.Row($$renderer, {
											children: ($$renderer) => {
												if (Table.Cell) {
													$$renderer.push('<!--[-->');

													Table.Cell($$renderer, {
														colspan: 7,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$renderer) => {
															$$renderer.push(`<!---->No incidents found`);
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

									const each_array_1 = $.ensure_array_like(incidents);

									for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
										let incident = each_array_1[$$index_2];

										if (Table.Row) {
											$$renderer.push('<!--[-->');

											Table.Row($$renderer, {
												class: 'hover:bg-muted/50 cursor-pointer',
												onclick: () => openIncident(incident.id),
												children: ($$renderer) => {
													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															class: 'font-medium',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(incident.id)}`);
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
																						$$renderer.push(`<span class="line-clamp-1 max-w-xs">${$.escape(incident.title)}</span>`);
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
																						$$renderer.push(`<p class="max-w-md">${$.escape(incident.title)}</p>`);
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
																$$renderer.push(`<span class="text-muted-foreground text-sm">${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.start_date_time, "yyyy-MM-dd HH:mm"))}</span>`);
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
																						$$renderer.push(`<span class="text-muted-foreground text-sm">${$.escape(incident.duration)}</span>`);
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
																						$$renderer.push(`<div class="text-sm"><span class="text-muted-foreground">From:</span> ${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.start_date_time, "yyyy-MM-dd HH:mm"))} <br/> <span class="text-muted-foreground">To:</span> `);

																						if (incident.end_date_time) {
																							$$renderer.push(`<!--[0-->${$.escape($.store_get($$store_subs ??= {}, '$formatDate', formatDate)(incident.end_date_time, "yyyy-MM-dd HH:mm"))}`);
																						} else {
																							$$renderer.push(`<!--[-1-->Ongoing`);
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
																$$renderer.push(`<div class="flex items-center gap-2">`);

																Badge($$renderer, {
																	variant: getStateBadgeVariant(incident.state),
																	class: 'gap-1',
																	children: ($$renderer) => {
																		SirenIcon($$renderer, { class: 'size-3' });
																		$$renderer.push(`<!----> ${$.escape(incident.state)}`);
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

													$$renderer.push(` `);

													if (Table.Cell) {
														$$renderer.push('<!--[-->');

														Table.Cell($$renderer, {
															children: ($$renderer) => {
																if (incident.monitors && incident.monitors.length > 0) {
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
																								variant: 'outline',
																								children: ($$renderer) => {
																									$$renderer.push(`<!---->${$.escape(incident.monitors.length)} monitor(s)`);
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

																							const each_array_2 = $.ensure_array_like(incident.monitors);

																							for (let $$index_1 = 0, $$length = each_array_2.length; $$index_1 < $$length; $$index_1++) {
																								let monitor = each_array_2[$$index_1];

																								$$renderer.push(`<div class="text-sm"><span class="font-medium">${$.escape(monitor.tag || monitor.monitor_tag)}</span> <span class="text-muted-foreground ml-1">(${$.escape(monitor.impact_type || monitor.monitor_impact)})</span></div>`);
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
															class: 'text-right',
															children: ($$renderer) => {
																Button($$renderer, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: (e) => {
																		e.stopPropagation();
																		openIncident(incident.id);
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

		if (totalPages > 0) {
			$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><p class="text-muted-foreground text-sm">Showing ${$.escape((pageNo - 1) * limit + 1)} - ${$.escape(Math.min(pageNo * limit, totalCount))} of ${$.escape(totalCount)} incidents</p> `);

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

				$$renderer.push(`<!----> <div class="flex items-center gap-1">`);

				if (totalPages <= 7) {
					$$renderer.push(`<!--[0--><!--[-->`);

					const each_array_3 = $.ensure_array_like(Array.from({ length: totalPages }, (_, i) => i + 1));

					for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
						let page = each_array_3[$$index_3];

						Button($$renderer, {
							variant: page === pageNo ? "default" : "ghost",
							size: 'sm',
							onclick: () => goToPage(page),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]-->`);
				} else {
					$$renderer.push('<!--[-1-->');

					Button($$renderer, {
						variant: pageNo === 1 ? "default" : "ghost",
						size: 'sm',
						onclick: () => goToPage(1),
						children: ($$renderer) => {
							$$renderer.push(`<!---->1`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (pageNo > 3) {
						$$renderer.push(`<!--[0--><span class="text-muted-foreground px-2">...</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <!--[-->`);

					const each_array_4 = $.ensure_array_like(Array.from({ length: 3 }, (_, i) => pageNo - 1 + i).filter((p) => p > 1 && p < totalPages));

					for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
						let page = each_array_4[$$index_4];

						Button($$renderer, {
							variant: page === pageNo ? "default" : "ghost",
							size: 'sm',
							onclick: () => goToPage(page),
							children: ($$renderer) => {
								$$renderer.push(`<!---->${$.escape(page)}`);
							},
							$$slots: { default: true }
						});
					}

					$$renderer.push(`<!--]--> `);

					if (pageNo < totalPages - 2) {
						$$renderer.push(`<!--[0--><span class="text-muted-foreground px-2">...</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> `);

					Button($$renderer, {
						variant: pageNo === totalPages ? "default" : "ghost",
						size: 'sm',
						onclick: () => goToPage(totalPages),
						children: ($$renderer) => {
							$$renderer.push(`<!---->${$.escape(totalPages)}`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}