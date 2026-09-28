import * as $ from 'svelte/internal/server';
import { Badge } from "$lib/components/ui/badge/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import * as Select from "$lib/components/ui/select/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
import Plus from "@lucide/svelte/icons/plus";
import SettingsIcon from "@lucide/svelte/icons/settings";
import SearchIcon from "@lucide/svelte/icons/search";
import FilterIcon from "@lucide/svelte/icons/filter";
import XIcon from "@lucide/svelte/icons/x";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import * as Item from "$lib/components/ui/item/index.js";
import { Switch } from "$lib/components/ui/switch/index.js";
import { resolve } from "$app/paths";
import { page } from "$app/state";
import clientResolver from "$lib/client/resolver.js";
import { GetInitials } from "$lib/clientTools.js";
import { onMount } from "svelte";
import { toast } from "svelte-sonner";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let monitors = [];
		let loading = true;
		let error = null;
		let toggling = {};
		const canWrite = $.derived(() => page.data.userPermissions?.includes("monitors.write") ?? false);
		let showFilters = false;
		let statusFilter = "ALL";
		let searchQuery = "";
		let pageNo = 1;
		const limit = 10;

		const statusOptions = [
			{ value: "ALL", label: "All Status" },
			{ value: "ACTIVE", label: "Active" },
			{ value: "INACTIVE", label: "Inactive" }
		];

		const totalCount = $.derived(() => monitors.length);
		const totalPages = $.derived(() => Math.max(1, Math.ceil(totalCount() / limit)));

		const paginatedMonitors = $.derived(() => {
			const safePageNo = Math.min(pageNo, totalPages());
			const start = (safePageNo - 1) * limit;

			return monitors.slice(start, start + limit);
		});

		const hasActiveFilters = $.derived(() => statusFilter !== "ALL" || searchQuery.trim() !== "");

		function goToPage(page) {
			if (page < 1 || page > totalPages()) return;

			pageNo = page;
		}

		function applyFilters() {
			pageNo = 1;
			fetchMonitors();
		}

		function clearFilters() {
			statusFilter = "ALL";
			searchQuery = "";
			pageNo = 1;
			fetchMonitors();
		}

		async function fetchMonitors() {
			loading = true;
			error = null;

			try {
				const data = {};

				if (statusFilter !== "ALL") {
					data.status = statusFilter;
				}

				const trimmed = searchQuery.trim();

				if (trimmed) {
					data.search = trimmed;
				}

				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ action: "getMonitors", data })
				});

				const result = await response.json();

				if (result.error) {
					error = result.error;
				} else {
					monitors = result;
				}
			} catch(e) {
				error = e instanceof Error ? e.message : "Failed to fetch monitors";
			} finally {
				loading = false;
			}
		}

		async function toggleMonitorField(monitor, field, checked) {
			const key = `${monitor.id}:${field}`;

			if (toggling[key]) return;

			// For is_hidden the switch shows visibility: on = visible = not hidden
			const previous = field === "status"
				? monitor.status || "INACTIVE"
				: monitor.is_hidden || "NO";

			const next = field === "status"
				? checked ? "ACTIVE" : "INACTIVE"
				: checked ? "NO" : "YES";

			if (previous === next) return;

			// Optimistic flip; rolled back on failure
			monitor[field] = next;

			toggling[key] = true;

			try {
				const response = await fetch(clientResolver(resolve, "/manage/api"), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						action: "storeMonitorData",
						data: { ...monitor, [field]: next }
					})
				});

				const result = await response.json();

				if (result.error) {
					throw new Error(result.error);
				}

				const stateLabel = field === "status"
					? next === "ACTIVE" ? "active" : "inactive"
					: next === "YES" ? "hidden" : "visible";

				toast.success(`${monitor.name} is now ${stateLabel}`);
			} catch(e) {
				monitor[field] = previous;
				toast.error(e instanceof Error ? e.message : "Failed to update monitor");
			} finally {
				delete toggling[key];
			}
		}

		onMount(() => {
			fetchMonitors();
		});

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex flex-col gap-3"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2">`);

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

			Button($$renderer, {
				class: 'cursor-pointer',
				href: clientResolver(resolve, "/manage/app/monitors/new"),
				children: ($$renderer) => {
					Plus($$renderer, { class: 'size-4' });
					$$renderer.push(`<!----> New Monitor`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			if (showFilters) {
				$$renderer.push(`<!--[0--><div class="bg-muted/50 flex flex-wrap items-end gap-3 rounded-lg border p-3"><div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Search</span> `);

				Input($$renderer, {
					type: 'text',
					placeholder: 'Search by name or tag...',
					class: 'w-60',
					get value() {
						return searchQuery;
					},

					set value($$value) {
						searchQuery = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Status</span> `);

				if (Select.Root) {
					$$renderer.push('<!--[-->');

					Select.Root($$renderer, {
						type: 'single',
						value: statusFilter,
						onValueChange: (v) => {
							if (v) statusFilter = v;
						},

						children: ($$renderer) => {
							if (Select.Trigger) {
								$$renderer.push('<!--[-->');

								Select.Trigger($$renderer, {
									class: 'w-40',
									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape(statusOptions.find((o) => o.value === statusFilter)?.label || "All Status")}`);
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

										const each_array = $.ensure_array_like(statusOptions);

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

			$$renderer.push(`<!--]--></div> `);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex w-full flex-col gap-4 [--radius:1rem]">`);

				if (Item.Root) {
					$$renderer.push('<!--[-->');

					Item.Root($$renderer, {
						variant: 'muted',
						class: 'mx-auto',
						children: ($$renderer) => {
							if (Item.Media) {
								$$renderer.push('<!--[-->');

								Item.Media($$renderer, {
									children: ($$renderer) => {
										Spinner($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Item.Content) {
								$$renderer.push('<!--[-->');

								Item.Content($$renderer, {
									children: ($$renderer) => {
										if (Item.Title) {
											$$renderer.push('<!--[-->');

											Item.Title($$renderer, {
												class: 'line-clamp-1',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Loading Monitors....`);
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

							if (Item.Content) {
								$$renderer.push('<!--[-->');
								Item.Content($$renderer, { class: 'flex-none justify-end' });
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
			} else if (error) {
				$$renderer.push(`<!--[1--><div class="text-destructive py-8 text-center">${$.escape(error)}</div>`);
			} else if (monitors.length === 0) {
				$$renderer.push(`<!--[2--><div class="text-muted-foreground py-8 text-center">No monitors found.</div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="ktable rounded-xl border">`);

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
															class: 'w-[300px]',
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
															class: 'w-[180px]',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Tag`);
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
															class: 'w-[130px]',
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
															class: 'w-[120px]',
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
															class: 'w-[120px]',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Visible`);
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
															class: 'w-[180px]',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cron`);
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
														Table.Head($$renderer, { class: 'w-[120px] text-right' });
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

										const each_array_1 = $.ensure_array_like(paginatedMonitors());

										for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
											let data = each_array_1[$$index_1];

											if (Table.Row) {
												$$renderer.push('<!--[-->');

												Table.Row($$renderer, {
													children: ($$renderer) => {
														if (Table.Cell) {
															$$renderer.push('<!--[-->');

															Table.Cell($$renderer, {
																children: ($$renderer) => {
																	$$renderer.push(`<div class="flex items-center gap-3">`);

																	if (Avatar.Root) {
																		$$renderer.push('<!--[-->');

																		Avatar.Root($$renderer, {
																			class: 'size-8',
																			children: ($$renderer) => {
																				if (data.image) {
																					$$renderer.push('<!--[0-->');

																					if (Avatar.Image) {
																						$$renderer.push('<!--[-->');

																						Avatar.Image($$renderer, {
																							src: clientResolver(resolve, data.image),
																							alt: data.name,
																							class: '  '
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

																				if (Avatar.Fallback) {
																					$$renderer.push('<!--[-->');

																					Avatar.Fallback($$renderer, {
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(GetInitials(data.name))}`);
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

																	$$renderer.push(` <div class="min-w-0"><div class="font-medium">${$.escape(data.name)}</div></div></div>`);
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
																			$$renderer.push(`<!---->${$.escape(data.tag)}`);
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
																		variant: 'secondary',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(data.monitor_type)}`);
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
																	$$renderer.push(`<div class="flex items-center gap-2">`);

																	Switch($$renderer, {
																		checked: (data.status || "INACTIVE") === "ACTIVE",
																		disabled: !canWrite() || !!toggling[`${data.id}:status`],
																		'aria-label': `Toggle status for ${$.stringify(data.name)}`,
																		onCheckedChange: (checked) => toggleMonitorField(data, "status", checked)
																	});

																	$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">${$.escape((data.status || "INACTIVE") === "ACTIVE" ? "Active" : "Inactive")}</span></div>`);
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

																	Switch($$renderer, {
																		checked: data.is_hidden !== "YES",
																		disabled: !canWrite() || !!toggling[`${data.id}:is_hidden`],
																		'aria-label': `Toggle status page visibility for ${$.stringify(data.name)}`,
																		onCheckedChange: (checked) => toggleMonitorField(data, "is_hidden", checked)
																	});

																	$$renderer.push(`<!----> <span class="text-muted-foreground text-xs">${$.escape(data.is_hidden === "YES" ? "Hidden" : "Visible")}</span></div>`);
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
																	$$renderer.push(`<span class="text-muted-foreground text-xs">${$.escape(data.cron || "-")}</span>`);
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
																		href: clientResolver(resolve, `/manage/app/monitors/${data.tag}`),
																		children: ($$renderer) => {
																			SettingsIcon($$renderer, { class: 'mr-1 size-4' });
																			$$renderer.push(`<!----> Configure`);
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

				$$renderer.push(`</div> `);

				if (totalPages() > 0) {
					$$renderer.push(`<!--[0--><div class="flex items-center justify-between"><p class="text-muted-foreground text-sm">Showing ${$.escape((pageNo - 1) * limit + 1)} - ${$.escape(Math.min(pageNo * limit, totalCount()))} of ${$.escape(totalCount())} monitors</p> `);

					if (totalPages() > 1) {
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

						if (totalPages() <= 7) {
							$$renderer.push(`<!--[0--><!--[-->`);

							const each_array_2 = $.ensure_array_like(Array.from({ length: totalPages() }, (_, i) => i + 1));

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let page = each_array_2[$$index_2];

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

							const each_array_3 = $.ensure_array_like(Array.from({ length: 3 }, (_, i) => pageNo - 1 + i).filter((p) => p > 1 && p < totalPages()));

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

							$$renderer.push(`<!--]--> `);

							if (pageNo < totalPages() - 2) {
								$$renderer.push(`<!--[0--><span class="text-muted-foreground px-2">...</span>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> `);

							Button($$renderer, {
								variant: pageNo === totalPages() ? "default" : "ghost",
								size: 'sm',
								onclick: () => goToPage(totalPages()),
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(totalPages())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						}

						$$renderer.push(`<!--]--></div> `);

						Button($$renderer, {
							variant: 'outline',
							size: 'icon',
							disabled: pageNo === totalPages(),
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

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}