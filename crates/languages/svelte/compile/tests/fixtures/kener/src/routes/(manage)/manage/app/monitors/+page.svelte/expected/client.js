import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> Filters <!>`, 1);
var root_1 = $.from_html(`<!> New Monitor`, 1);
var root_2 = $.from_html(`<!> <!>`, 1);
var root_3 = $.from_html(`<!> Search`, 1);
var root_4 = $.from_html(`<!> Clear`, 1);
var root_5 = $.from_html(`<div class="bg-muted/50 flex flex-wrap items-end gap-3 rounded-lg border p-3"><div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Search</span> <!></div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Status</span> <!></div> <!> <!></div>`);
var root_6 = $.from_html(`<!> <!> <!>`, 1);
var root_7 = $.from_html(`<div class="flex w-full flex-col gap-4 [--radius:1rem]"><!></div>`);
var root_8 = $.from_html(`<div class="text-destructive py-8 text-center"> </div>`);
var root_9 = $.from_html(`<div class="text-muted-foreground py-8 text-center">No monitors found.</div>`);
var root_10 = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);
var root_11 = $.from_html(`<div class="flex items-center gap-3"><!> <div class="min-w-0"><div class="font-medium"> </div></div></div>`);
var root_12 = $.from_html(`<div class="flex items-center gap-2"><!> <span class="text-muted-foreground text-xs"> </span></div>`);
var root_13 = $.from_html(`<span class="text-muted-foreground text-xs"> </span>`);
var root_14 = $.from_html(`<!> Configure`, 1);
var root_15 = $.from_html(`<span class="text-muted-foreground px-2">...</span>`);
var root_16 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_17 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"><!></div> <!></div>`);
var root_18 = $.from_html(`<div class="flex items-center justify-between"><p class="text-muted-foreground text-sm"> </p> <!></div>`);
var root_19 = $.from_html(`<div class="ktable rounded-xl border"><!></div> <!>`, 1);
var root_20 = $.from_html(`<div class="flex w-full flex-col gap-4 p-4"><div class="mb-4 flex flex-col gap-3"><div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2"><!> <!></div> <!></div> <!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let monitors = $.state($.proxy([]));
	let loading = $.state(true);
	let error = $.state(null);
	let toggling = $.proxy({});
	const canWrite = $.derived(() => page.data.userPermissions?.includes("monitors.write") ?? false);
	let showFilters = $.state(false);
	let statusFilter = $.state("ALL");
	let searchQuery = $.state("");
	let pageNo = $.state(1);
	const limit = 10;

	const statusOptions = [
		{ value: "ALL", label: "All Status" },
		{ value: "ACTIVE", label: "Active" },
		{ value: "INACTIVE", label: "Inactive" }
	];

	const totalCount = $.derived(() => $.get(monitors).length);
	const totalPages = $.derived(() => Math.max(1, Math.ceil($.get(totalCount) / limit)));

	const paginatedMonitors = $.derived(() => {
		const safePageNo = Math.min($.get(pageNo), $.get(totalPages));
		const start = (safePageNo - 1) * limit;

		return $.get(monitors).slice(start, start + limit);
	});

	const hasActiveFilters = $.derived(() => $.get(statusFilter) !== "ALL" || $.get(searchQuery).trim() !== "");

	function goToPage(page) {
		if (page < 1 || page > $.get(totalPages)) return;

		$.set(pageNo, page, true);
	}

	function applyFilters() {
		$.set(pageNo, 1);
		fetchMonitors();
	}

	function clearFilters() {
		$.set(statusFilter, "ALL");
		$.set(searchQuery, "");
		$.set(pageNo, 1);
		fetchMonitors();
	}

	async function fetchMonitors() {
		$.set(loading, true);
		$.set(error, null);

		try {
			const data = {};

			if ($.get(statusFilter) !== "ALL") {
				data.status = $.get(statusFilter);
			}

			const trimmed = $.get(searchQuery).trim();

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
				$.set(error, result.error, true);
			} else {
				$.set(monitors, result, true);
			}
		} catch(e) {
			$.set(error, e instanceof Error ? e.message : "Failed to fetch monitors", true);
		} finally {
			$.set(loading, false);
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

	var div = root_20();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	{
		let $0 = $.derived(() => $.get(showFilters) ? "default" : "outline");

		Button(node, {
			get variant() {
				return $.get($0);
			},
			size: 'sm',
			onclick: () => $.set(showFilters, !$.get(showFilters)),
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				FilterIcon(node_1, { class: 'size-4' });

				var node_2 = $.sibling(node_1, 2);

				{
					var consequent = ($$anchor) => {
						Badge($$anchor, {
							variant: 'secondary',
							class: 'ml-1 px-1.5 py-0 text-[10px]',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text = $.text('ON');

								$.append($$anchor, text);
							},
							$$slots: { default: true }
						});
					};

					$.if(node_2, ($$render) => {
						if ($.get(hasActiveFilters)) $$render(consequent);
					});
				}

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	}

	var node_3 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_3, ($$render) => {
			if ($.get(loading)) $$render(consequent_1);
		});
	}

	$.reset(div_3);

	var node_4 = $.sibling(div_3, 2);

	{
		let $0 = $.derived(() => clientResolver(resolve, "/manage/app/monitors/new"));

		Button(node_4, {
			class: 'cursor-pointer',
			get href() {
				return $.get($0);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node_5 = $.first_child(fragment_3);

				Plus(node_5, { class: 'size-4' });
				$.next();
				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	}

	$.reset(div_2);

	var node_6 = $.sibling(div_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_4 = root_5();
			var div_5 = $.child(div_4);
			var node_7 = $.sibling($.child(div_5), 2);

			Input(node_7, {
				type: 'text',
				placeholder: 'Search by name or tag...',
				class: 'w-60',
				get value() {
					return $.get(searchQuery);
				},

				set value($$value) {
					$.set(searchQuery, $$value, true);
				}
			});

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_8 = $.sibling($.child(div_6), 2);

			$.component(node_8, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(statusFilter);
					},

					onValueChange: (v) => {
						if (v) $.set(statusFilter, v, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_2();
						var node_9 = $.first_child(fragment_4);

						$.component(node_9, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-40',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text();

									$.template_effect(($0) => $.set_text(text_1, $0), [
										() => statusOptions.find((o) => o.value === $.get(statusFilter))?.label || "All Status"
									]);

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});
						});

						var node_10 = $.sibling(node_9, 2);

						$.component(node_10, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = $.comment();
									var node_11 = $.first_child(fragment_6);

									$.each(node_11, 17, () => statusOptions, (option) => option.value, ($$anchor, option) => {
										var fragment_7 = $.comment();
										var node_12 = $.first_child(fragment_7);

										$.component(node_12, () => Select.Item, ($$anchor, Select_Item) => {
											Select_Item($$anchor, {
												get value() {
													return $.get(option).value;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text();

													$.template_effect(() => $.set_text(text_2, $.get(option).label));
													$.append($$anchor, text_2);
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

			$.reset(div_6);

			var node_13 = $.sibling(div_6, 2);

			Button(node_13, {
				size: 'sm',
				onclick: applyFilters,
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_3();
					var node_14 = $.first_child(fragment_9);

					SearchIcon(node_14, { class: 'size-4' });
					$.next();
					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_13, 2);

			{
				var consequent_2 = ($$anchor) => {
					Button($$anchor, {
						variant: 'ghost',
						size: 'sm',
						onclick: clearFilters,
						children: ($$anchor, $$slotProps) => {
							var fragment_11 = root_4();
							var node_16 = $.first_child(fragment_11);

							XIcon(node_16, { class: 'size-4' });
							$.next();
							$.append($$anchor, fragment_11);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_15, ($$render) => {
					if ($.get(hasActiveFilters)) $$render(consequent_2);
				});
			}

			$.reset(div_4);
			$.append($$anchor, div_4);
		};

		$.if(node_6, ($$render) => {
			if ($.get(showFilters)) $$render(consequent_3);
		});
	}

	$.reset(div_1);

	var node_17 = $.sibling(div_1, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_7 = root_7();
			var node_18 = $.child(div_7);

			$.component(node_18, () => Item.Root, ($$anchor, Item_Root) => {
				Item_Root($$anchor, {
					variant: 'muted',
					class: 'mx-auto',
					children: ($$anchor, $$slotProps) => {
						var fragment_12 = root_6();
						var node_19 = $.first_child(fragment_12);

						$.component(node_19, () => Item.Media, ($$anchor, Item_Media) => {
							Item_Media($$anchor, {
								children: ($$anchor, $$slotProps) => {
									Spinner($$anchor, {});
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_19, 2);

						$.component(node_20, () => Item.Content, ($$anchor, Item_Content) => {
							Item_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = $.comment();
									var node_21 = $.first_child(fragment_14);

									$.component(node_21, () => Item.Title, ($$anchor, Item_Title) => {
										Item_Title($$anchor, {
											class: 'line-clamp-1',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Loading Monitors....');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						var node_22 = $.sibling(node_20, 2);

						$.component(node_22, () => Item.Content, ($$anchor, Item_Content_1) => {
							Item_Content_1($$anchor, { class: 'flex-none justify-end' });
						});

						$.append($$anchor, fragment_12);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		var consequent_5 = ($$anchor) => {
			var div_8 = root_8();
			var text_4 = $.only_child(div_8, true);

			$.template_effect(() => $.set_text(text_4, $.get(error)));
			$.append($$anchor, div_8);
		};

		var consequent_6 = ($$anchor) => {
			var div_9 = root_9();

			$.append($$anchor, div_9);
		};

		var alternate_1 = ($$anchor) => {
			var fragment_15 = root_19();
			var div_10 = $.first_child(fragment_15);
			var node_23 = $.child(div_10);

			$.component(node_23, () => Table.Root, ($$anchor, Table_Root) => {
				Table_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_16 = root_2();
						var node_24 = $.first_child(fragment_16);

						$.component(node_24, () => Table.Header, ($$anchor, Table_Header) => {
							Table_Header($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = $.comment();
									var node_25 = $.first_child(fragment_17);

									$.component(node_25, () => Table.Row, ($$anchor, Table_Row) => {
										Table_Row($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_18 = root_10();
												var node_26 = $.first_child(fragment_18);

												$.component(node_26, () => Table.Head, ($$anchor, Table_Head) => {
													Table_Head($$anchor, {
														class: 'w-[300px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_5 = $.text('Monitor');

															$.append($$anchor, text_5);
														},
														$$slots: { default: true }
													});
												});

												var node_27 = $.sibling(node_26, 2);

												$.component(node_27, () => Table.Head, ($$anchor, Table_Head_1) => {
													Table_Head_1($$anchor, {
														class: 'w-[180px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_6 = $.text('Tag');

															$.append($$anchor, text_6);
														},
														$$slots: { default: true }
													});
												});

												var node_28 = $.sibling(node_27, 2);

												$.component(node_28, () => Table.Head, ($$anchor, Table_Head_2) => {
													Table_Head_2($$anchor, {
														class: 'w-[130px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_7 = $.text('Type');

															$.append($$anchor, text_7);
														},
														$$slots: { default: true }
													});
												});

												var node_29 = $.sibling(node_28, 2);

												$.component(node_29, () => Table.Head, ($$anchor, Table_Head_3) => {
													Table_Head_3($$anchor, {
														class: 'w-[120px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_8 = $.text('Status');

															$.append($$anchor, text_8);
														},
														$$slots: { default: true }
													});
												});

												var node_30 = $.sibling(node_29, 2);

												$.component(node_30, () => Table.Head, ($$anchor, Table_Head_4) => {
													Table_Head_4($$anchor, {
														class: 'w-[120px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_9 = $.text('Visible');

															$.append($$anchor, text_9);
														},
														$$slots: { default: true }
													});
												});

												var node_31 = $.sibling(node_30, 2);

												$.component(node_31, () => Table.Head, ($$anchor, Table_Head_5) => {
													Table_Head_5($$anchor, {
														class: 'w-[180px]',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text('Cron');

															$.append($$anchor, text_10);
														},
														$$slots: { default: true }
													});
												});

												var node_32 = $.sibling(node_31, 2);

												$.component(node_32, () => Table.Head, ($$anchor, Table_Head_6) => {
													Table_Head_6($$anchor, { class: 'w-[120px] text-right' });
												});

												$.append($$anchor, fragment_18);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});
						});

						var node_33 = $.sibling(node_24, 2);

						$.component(node_33, () => Table.Body, ($$anchor, Table_Body) => {
							Table_Body($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_19 = $.comment();
									var node_34 = $.first_child(fragment_19);

									$.each(node_34, 17, () => $.get(paginatedMonitors), (data) => data.id, ($$anchor, data) => {
										var fragment_20 = $.comment();
										var node_35 = $.first_child(fragment_20);

										$.component(node_35, () => Table.Row, ($$anchor, Table_Row_1) => {
											Table_Row_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_21 = root_10();
													var node_36 = $.first_child(fragment_21);

													$.component(node_36, () => Table.Cell, ($$anchor, Table_Cell) => {
														Table_Cell($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_11 = root_11();
																var node_37 = $.child(div_11);

																$.component(node_37, () => Avatar.Root, ($$anchor, Avatar_Root) => {
																	Avatar_Root($$anchor, {
																		class: 'size-8',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_22 = root_2();
																			var node_38 = $.first_child(fragment_22);

																			{
																				var consequent_7 = ($$anchor) => {
																					var fragment_23 = $.comment();
																					var node_39 = $.first_child(fragment_23);

																					{
																						let $0 = $.derived(() => clientResolver(resolve, $.get(data).image));

																						$.component(node_39, () => Avatar.Image, ($$anchor, Avatar_Image) => {
																							Avatar_Image($$anchor, {
																								get src() {
																									return $.get($0);
																								},

																								get alt() {
																									return $.get(data).name;
																								},
																								class: '  '
																							});
																						});
																					}

																					$.append($$anchor, fragment_23);
																				};

																				$.if(node_38, ($$render) => {
																					if ($.get(data).image) $$render(consequent_7);
																				});
																			}

																			var node_40 = $.sibling(node_38, 2);

																			$.component(node_40, () => Avatar.Fallback, ($$anchor, Avatar_Fallback) => {
																				Avatar_Fallback($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_11 = $.text();

																						$.template_effect(($0) => $.set_text(text_11, $0), [() => GetInitials($.get(data).name)]);
																						$.append($$anchor, text_11);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_22);
																		},
																		$$slots: { default: true }
																	});
																});

																var div_12 = $.sibling(node_37, 2);
																var div_13 = $.child(div_12);
																var text_12 = $.only_child(div_13, true);

																$.reset(div_12);
																$.reset(div_11);
																$.template_effect(() => $.set_text(text_12, $.get(data).name));
																$.append($$anchor, div_11);
															},
															$$slots: { default: true }
														});
													});

													var node_41 = $.sibling(node_36, 2);

													$.component(node_41, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																Badge($$anchor, {
																	variant: 'outline',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_13 = $.text();

																		$.template_effect(() => $.set_text(text_13, $.get(data).tag));
																		$.append($$anchor, text_13);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_42 = $.sibling(node_41, 2);

													$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																Badge($$anchor, {
																	variant: 'secondary',
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_14 = $.text();

																		$.template_effect(() => $.set_text(text_14, $.get(data).monitor_type));
																		$.append($$anchor, text_14);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_43 = $.sibling(node_42, 2);

													$.component(node_43, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_14 = root_12();
																var node_44 = $.child(div_14);

																{
																	let $0 = $.derived(() => ($.get(data).status || "INACTIVE") === "ACTIVE");
																	let $1 = $.derived(() => !$.get(canWrite) || !!toggling[`${$.get(data).id}:status`]);

																	Switch(node_44, {
																		get checked() {
																			return $.get($0);
																		},

																		get disabled() {
																			return $.get($1);
																		},

																		get 'aria-label'() {
																			return `Toggle status for ${$.get(data).name ?? ''}`;
																		},
																		onCheckedChange: (checked) => toggleMonitorField($.get(data), "status", checked)
																	});
																}

																var span = $.sibling(node_44, 2);
																var text_15 = $.only_child(span, true);

																$.reset(div_14);
																$.template_effect(() => $.set_text(text_15, ($.get(data).status || "INACTIVE") === "ACTIVE" ? "Active" : "Inactive"));
																$.append($$anchor, div_14);
															},
															$$slots: { default: true }
														});
													});

													var node_45 = $.sibling(node_43, 2);

													$.component(node_45, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var div_15 = root_12();
																var node_46 = $.child(div_15);

																{
																	let $0 = $.derived(() => $.get(data).is_hidden !== "YES");
																	let $1 = $.derived(() => !$.get(canWrite) || !!toggling[`${$.get(data).id}:is_hidden`]);

																	Switch(node_46, {
																		get checked() {
																			return $.get($0);
																		},

																		get disabled() {
																			return $.get($1);
																		},

																		get 'aria-label'() {
																			return `Toggle status page visibility for ${$.get(data).name ?? ''}`;
																		},
																		onCheckedChange: (checked) => toggleMonitorField($.get(data), "is_hidden", checked)
																	});
																}

																var span_1 = $.sibling(node_46, 2);
																var text_16 = $.only_child(span_1, true);

																$.reset(div_15);
																$.template_effect(() => $.set_text(text_16, $.get(data).is_hidden === "YES" ? "Hidden" : "Visible"));
																$.append($$anchor, div_15);
															},
															$$slots: { default: true }
														});
													});

													var node_47 = $.sibling(node_45, 2);

													$.component(node_47, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var span_2 = root_13();
																var text_17 = $.only_child(span_2, true);

																$.template_effect(() => $.set_text(text_17, $.get(data).cron || "-"));
																$.append($$anchor, span_2);
															},
															$$slots: { default: true }
														});
													});

													var node_48 = $.sibling(node_47, 2);

													$.component(node_48, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => clientResolver(resolve, `/manage/app/monitors/${$.get(data).tag}`));

																	Button($$anchor, {
																		variant: 'outline',
																		size: 'sm',
																		get href() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			var fragment_30 = root_14();
																			var node_49 = $.first_child(fragment_30);

																			SettingsIcon(node_49, { class: 'mr-1 size-4' });
																			$.next();
																			$.append($$anchor, fragment_30);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_21);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_20);
									});

									$.append($$anchor, fragment_19);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_16);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_10);

			var node_50 = $.sibling(div_10, 2);

			{
				var consequent_12 = ($$anchor) => {
					var div_16 = root_18();
					var p_1 = $.child(div_16);
					var text_18 = $.only_child(p_1);
					var node_51 = $.sibling(p_1, 2);

					{
						var consequent_11 = ($$anchor) => {
							var div_17 = root_17();
							var node_52 = $.child(div_17);

							{
								let $0 = $.derived(() => $.get(pageNo) === 1);

								Button(node_52, {
									variant: 'outline',
									size: 'icon',
									get disabled() {
										return $.get($0);
									},
									onclick: () => goToPage($.get(pageNo) - 1),
									children: ($$anchor, $$slotProps) => {
										ChevronLeftIcon($$anchor, { class: 'size-4' });
									},
									$$slots: { default: true }
								});
							}

							var div_18 = $.sibling(node_52, 2);
							var node_53 = $.child(div_18);

							{
								var consequent_8 = ($$anchor) => {
									var fragment_32 = $.comment();
									var node_54 = $.first_child(fragment_32);

									$.each(node_54, 16, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), (page) => page, ($$anchor, page, $$index_2, $$array) => {
										{
											let $0 = $.derived(() => page === $.get(pageNo) ? "default" : "ghost");

											Button($$anchor, {
												get variant() {
													return $.get($0);
												},
												size: 'sm',
												onclick: () => goToPage(page),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_19 = $.text();

													$.template_effect(() => $.set_text(text_19, page));
													$.append($$anchor, text_19);
												},
												$$slots: { default: true }
											});
										}
									});

									$.append($$anchor, fragment_32);
								};

								var alternate = ($$anchor) => {
									var fragment_35 = root_16();
									var node_55 = $.first_child(fragment_35);

									{
										let $0 = $.derived(() => $.get(pageNo) === 1 ? "default" : "ghost");

										Button(node_55, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => goToPage(1),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_20 = $.text('1');

												$.append($$anchor, text_20);
											},
											$$slots: { default: true }
										});
									}

									var node_56 = $.sibling(node_55, 2);

									{
										var consequent_9 = ($$anchor) => {
											var span_3 = root_15();

											$.append($$anchor, span_3);
										};

										$.if(node_56, ($$render) => {
											if ($.get(pageNo) > 3) $$render(consequent_9);
										});
									}

									var node_57 = $.sibling(node_56, 2);

									$.each(node_57, 16, () => Array.from({ length: 3 }, (_, i) => $.get(pageNo) - 1 + i).filter((p) => p > 1 && p < $.get(totalPages)), (page) => page, ($$anchor, page, $$index_3, $$array_1) => {
										{
											let $0 = $.derived(() => page === $.get(pageNo) ? "default" : "ghost");

											Button($$anchor, {
												get variant() {
													return $.get($0);
												},
												size: 'sm',
												onclick: () => goToPage(page),
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_21 = $.text();

													$.template_effect(() => $.set_text(text_21, page));
													$.append($$anchor, text_21);
												},
												$$slots: { default: true }
											});
										}
									});

									var node_58 = $.sibling(node_57, 2);

									{
										var consequent_10 = ($$anchor) => {
											var span_4 = root_15();

											$.append($$anchor, span_4);
										};

										$.if(node_58, ($$render) => {
											if ($.get(pageNo) < $.get(totalPages) - 2) $$render(consequent_10);
										});
									}

									var node_59 = $.sibling(node_58, 2);

									{
										let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages) ? "default" : "ghost");

										Button(node_59, {
											get variant() {
												return $.get($0);
											},
											size: 'sm',
											onclick: () => goToPage($.get(totalPages)),
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_22 = $.text();

												$.template_effect(() => $.set_text(text_22, $.get(totalPages)));
												$.append($$anchor, text_22);
											},
											$$slots: { default: true }
										});
									}

									$.append($$anchor, fragment_35);
								};

								$.if(node_53, ($$render) => {
									if ($.get(totalPages) <= 7) $$render(consequent_8); else $$render(alternate, -1);
								});
							}

							$.reset(div_18);

							var node_60 = $.sibling(div_18, 2);

							{
								let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

								Button(node_60, {
									variant: 'outline',
									size: 'icon',
									get disabled() {
										return $.get($0);
									},
									onclick: () => goToPage($.get(pageNo) + 1),
									children: ($$anchor, $$slotProps) => {
										ChevronRightIcon($$anchor, { class: 'size-4' });
									},
									$$slots: { default: true }
								});
							}

							$.reset(div_17);
							$.append($$anchor, div_17);
						};

						$.if(node_51, ($$render) => {
							if ($.get(totalPages) > 1) $$render(consequent_11);
						});
					}

					$.reset(div_16);
					$.template_effect(($0) => $.set_text(text_18, `Showing ${($.get(pageNo) - 1) * limit + 1} - ${$0 ?? ''} of ${$.get(totalCount) ?? ''} monitors`), [() => Math.min($.get(pageNo) * limit, $.get(totalCount))]);
					$.append($$anchor, div_16);
				};

				$.if(node_50, ($$render) => {
					if ($.get(totalPages) > 0) $$render(consequent_12);
				});
			}

			$.append($$anchor, fragment_15);
		};

		$.if(node_17, ($$render) => {
			if ($.get(loading)) $$render(consequent_4); else if ($.get(error)) $$render(consequent_5, 1); else if ($.get(monitors).length === 0) $$render(consequent_6, 2); else $$render(alternate_1, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}