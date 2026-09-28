import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> Filters <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> Search`, 1);
var root_4 = $.from_html(`<!> Deleting...`, 1);
var root_5 = $.from_html(`<!> Delete`, 1);
var root_6 = $.from_html(`<!> Clear`, 1);
var root_7 = $.from_html(`<div class="bg-muted/50 flex flex-wrap items-end gap-3 rounded-lg border p-3"><div class="flex flex-col gap-1"><!> <!></div> <div class="flex flex-col gap-1"><!> <!></div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Monitor</span> <!></div> <div class="flex flex-col gap-1"><span class="text-muted-foreground text-xs font-medium">Status</span> <!></div> <!> <!> <!></div>`);
var root_8 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<span class="line-clamp-1 max-w-xs font-medium"> </span>`);
var root_10 = $.from_html(`<p> </p>`);
var root_11 = $.from_html(`<span class="text-muted-foreground text-sm"> </span>`);
var root_12 = $.from_html(`<span> </span>`);
var root_13 = $.from_html(`<span class="text-sm"> </span>`);
var root_14 = $.from_html(`<span class="text-muted-foreground text-sm">—</span>`);
var root_15 = $.from_html(`<span class="text-destructive line-clamp-1 max-w-xs text-sm"> </span>`);
var root_16 = $.from_html(`<p class="wrap-break-word"> </p>`);
var root_17 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_18 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_19 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_20 = $.from_html(`<strong>all monitors</strong>`);
var root_21 = $.from_html(`<strong> </strong>`);
var root_22 = $.from_html(`with status <strong> </strong>`, 1);
var root_23 = $.from_html(`This will delete monitoring data for <!> <!> `, 1);
var root_24 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex flex-col gap-3"><div class="flex items-center gap-2"><!> <!></div> <!></div> <div class="ktable rounded-xl border"><!></div> <!></div> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

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
	let loading = $.state(true);

	let deleting = $.state(false);
	let deleteDialogOpen = $.state(false);
	let monitoringData = $.state($.proxy([]));
	let monitors = $.state($.proxy([]));
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let showFilters = $.state(false);
	let monitorTagFilter = $.state("ALL");
	let statusFilter = $.state("ALL");
	let startDateTime = $.state($.proxy(formatDateTimeForInput(yesterday)));
	let endDateTime = $.state($.proxy(formatDateTimeForInput(now)));
	const limit = 50;
	const hasActiveFilters = $.derived(() => $.get(monitorTagFilter) !== "ALL" || $.get(statusFilter) !== "ALL" || $.get(startDateTime) !== formatDateTimeForInput(yesterday) || $.get(endDateTime) !== formatDateTimeForInput(now));

	// Convert datetime string (YYYY-MM-DDTHH:mm) to Unix timestamp (seconds)
	function dateTimeStringToTimestamp(dateTimeStr) {
		const date = new Date(dateTimeStr);

		return Math.floor(date.getTime() / 1000);
	}

	// Validate date range (max 30 days) and clamp values
	function validateDates() {
		const start = new Date($.get(startDateTime));
		const end = new Date($.get(endDateTime));

		if (start > end) {
			$.set(startDateTime, $.get(endDateTime), true);
		}

		const daysDiff = Math.abs((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

		if (daysDiff > 30) {
			const newEnd = new Date(start);

			newEnd.setDate(newEnd.getDate() + 30);

			if (newEnd > now) {
				$.set(endDateTime, formatDateTimeForInput(now), true);
			} else {
				$.set(endDateTime, formatDateTimeForInput(newEnd), true);
			}
		}
	}

	function applyFilters() {
		validateDates();
		$.set(pageNo, 1);
		fetchData();
	}

	function clearFilters() {
		$.set(monitorTagFilter, "ALL");
		$.set(statusFilter, "ALL");
		$.set(startDateTime, formatDateTimeForInput(yesterday), true);
		$.set(endDateTime, formatDateTimeForInput(now), true);
		$.set(pageNo, 1);
		fetchData();
	}

	function openDeleteDialog() {
		validateDates();
		$.set(deleteDialogOpen, true);
	}

	async function deleteFilteredData() {
		$.set(deleteDialogOpen, false);

		const startTs = dateTimeStringToTimestamp($.get(startDateTime));
		const endTs = dateTimeStringToTimestamp($.get(endDateTime));

		$.set(deleting, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "deleteMonitorData",
					data: {
						tag: $.get(monitorTagFilter) === "ALL" ? "" : $.get(monitorTagFilter),
						status: $.get(statusFilter) === "ALL" ? undefined : $.get(statusFilter),
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
				$.set(monitorTagFilter, "ALL");
				$.set(pageNo, 1);
				fetchData();
			}
		} catch(e) {
			toast.error("Failed to delete monitoring data");
		} finally {
			$.set(deleting, false);
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
				$.set(monitors, result.map((m) => ({ tag: m.tag, name: m.name })), true);
			}
		} catch(error) {
			console.error("Error fetching monitors:", error);
		}
	}

	// Fetch monitoring data
	async function fetchData() {
		$.set(loading, true);

		try {
			const requestData = {
				page: $.get(pageNo),
				limit,
				monitor_tag: $.get(monitorTagFilter),
				status: $.get(statusFilter)
			};

			if ($.get(startDateTime)) {
				requestData.start_time = dateTimeStringToTimestamp($.get(startDateTime));
			}

			if ($.get(endDateTime)) {
				requestData.end_time = dateTimeStringToTimestamp($.get(endDateTime));
			}

			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "getMonitoringDataPaginated", data: requestData })
			});

			const result = await response.json();

			if (!result.error) {
				$.set(monitoringData, result.data, true);
				$.set(totalCount, result.total, true);
				$.set(totalPages, Math.ceil(result.total / limit), true);
			}
		} catch(error) {
			console.error("Error fetching monitoring data:", error);
		} finally {
			$.set(loading, false);
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
			$.set(monitorTagFilter, value, true);
		}
	}

	function handleStatusChange(value) {
		if (value === "ALL" || isMonitoringStatus(value)) {
			$.set(statusFilter, value, true);
		}
	}

	// Pagination
	function goToPage(page) {
		$.set(pageNo, page, true);
		fetchData();
	}

	onMount(() => {
		fetchMonitors();
		fetchData();
	});

	var fragment = root_24();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	{
		let $0 = $.derived(() => $.get(showFilters) ? "default" : "outline");

		Button(node, {
			get variant() {
				return $.get($0);
			},
			size: 'sm',
			onclick: () => $.set(showFilters, !$.get(showFilters)),
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

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

				$.append($$anchor, fragment_1);
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

	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_3 = root_7();
			var div_4 = $.child(div_3);
			var node_5 = $.child(div_4);

			Label(node_5, {
				for: 'start-datetime',
				class: 'text-muted-foreground text-xs font-medium',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('From');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			{
				let $0 = $.derived(() => formatDateTimeForInput(maxDaysAgoDate));

				Input(node_6, {
					id: 'start-datetime',
					type: 'datetime-local',
					get min() {
						return $.get($0);
					},

					get max() {
						return $.get(endDateTime);
					},

					get value() {
						return $.get(startDateTime);
					},

					set value($$value) {
						$.set(startDateTime, $$value, true);
					}
				});
			}

			$.reset(div_4);

			var div_5 = $.sibling(div_4, 2);
			var node_7 = $.child(div_5);

			Label(node_7, {
				for: 'end-datetime',
				class: 'text-muted-foreground text-xs font-medium',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('To');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			{
				let $0 = $.derived(() => formatDateTimeForInput(now));

				Input(node_8, {
					id: 'end-datetime',
					type: 'datetime-local',
					get min() {
						return $.get(startDateTime);
					},

					get max() {
						return $.get($0);
					},

					get value() {
						return $.get(endDateTime);
					},

					set value($$value) {
						$.set(endDateTime, $$value, true);
					}
				});
			}

			$.reset(div_5);

			var div_6 = $.sibling(div_5, 2);
			var node_9 = $.sibling($.child(div_6), 2);

			$.component(node_9, () => Select.Root, ($$anchor, Select_Root) => {
				Select_Root($$anchor, {
					type: 'single',
					get value() {
						return $.get(monitorTagFilter);
					},
					onValueChange: handleMonitorChange,
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root_1();
						var node_10 = $.first_child(fragment_4);

						$.component(node_10, () => Select.Trigger, ($$anchor, Select_Trigger) => {
							Select_Trigger($$anchor, {
								class: 'w-48',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, $.get(monitorTagFilter) === "ALL" ? "All Monitors" : $.get(monitorTagFilter)));
									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						});

						var node_11 = $.sibling(node_10, 2);

						$.component(node_11, () => Select.Content, ($$anchor, Select_Content) => {
							Select_Content($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_12 = $.first_child(fragment_6);

									$.component(node_12, () => Select.Item, ($$anchor, Select_Item) => {
										Select_Item($$anchor, {
											value: 'ALL',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('All Monitors');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_13 = $.sibling(node_12, 2);

									$.each(node_13, 17, () => $.get(monitors), (monitor) => monitor.tag, ($$anchor, monitor) => {
										var fragment_7 = $.comment();
										var node_14 = $.first_child(fragment_7);

										$.component(node_14, () => Select.Item, ($$anchor, Select_Item_1) => {
											Select_Item_1($$anchor, {
												get value() {
													return $.get(monitor).tag;
												},

												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text();

													$.template_effect(() => $.set_text(text_5, $.get(monitor).name || $.get(monitor).tag));
													$.append($$anchor, text_5);
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

			var div_7 = $.sibling(div_6, 2);
			var node_15 = $.sibling($.child(div_7), 2);

			$.component(node_15, () => Select.Root, ($$anchor, Select_Root_1) => {
				Select_Root_1($$anchor, {
					type: 'single',
					get value() {
						return $.get(statusFilter);
					},
					onValueChange: handleStatusChange,
					children: ($$anchor, $$slotProps) => {
						var fragment_9 = root_1();
						var node_16 = $.first_child(fragment_9);

						$.component(node_16, () => Select.Trigger, ($$anchor, Select_Trigger_1) => {
							Select_Trigger_1($$anchor, {
								class: 'w-36',
								'aria-label': 'Status',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_6 = $.text();

									$.template_effect(() => $.set_text(text_6, $.get(statusFilter) === "ALL" ? "All Statuses" : $.get(statusFilter)));
									$.append($$anchor, text_6);
								},
								$$slots: { default: true }
							});
						});

						var node_17 = $.sibling(node_16, 2);

						$.component(node_17, () => Select.Content, ($$anchor, Select_Content_1) => {
							Select_Content_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_2();
									var node_18 = $.first_child(fragment_11);

									$.component(node_18, () => Select.Item, ($$anchor, Select_Item_2) => {
										Select_Item_2($$anchor, {
											value: 'ALL',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('All Statuses');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Select.Item, ($$anchor, Select_Item_3) => {
										Select_Item_3($$anchor, {
											get value() {
												return GC.UP;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text('UP');

												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									var node_20 = $.sibling(node_19, 2);

									$.component(node_20, () => Select.Item, ($$anchor, Select_Item_4) => {
										Select_Item_4($$anchor, {
											get value() {
												return GC.DOWN;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('DOWN');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_21 = $.sibling(node_20, 2);

									$.component(node_21, () => Select.Item, ($$anchor, Select_Item_5) => {
										Select_Item_5($$anchor, {
											get value() {
												return GC.DEGRADED;
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text('DEGRADED');

												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_9);
					},
					$$slots: { default: true }
				});
			});

			$.reset(div_7);

			var node_22 = $.sibling(div_7, 2);

			Button(node_22, {
				size: 'sm',
				onclick: applyFilters,
				children: ($$anchor, $$slotProps) => {
					var fragment_12 = root_3();
					var node_23 = $.first_child(fragment_12);

					SearchIcon(node_23, { class: 'size-4' });
					$.next();
					$.append($$anchor, fragment_12);
				},
				$$slots: { default: true }
			});

			var node_24 = $.sibling(node_22, 2);

			Button(node_24, {
				size: 'sm',
				variant: 'destructive',
				onclick: openDeleteDialog,
				get disabled() {
					return $.get(deleting);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_13 = $.comment();
					var node_25 = $.first_child(fragment_13);

					{
						var consequent_2 = ($$anchor) => {
							var fragment_14 = root_4();
							var node_26 = $.first_child(fragment_14);

							Spinner(node_26, { class: 'size-4' });
							$.next();
							$.append($$anchor, fragment_14);
						};

						var alternate = ($$anchor) => {
							var fragment_15 = root_5();
							var node_27 = $.first_child(fragment_15);

							TrashIcon(node_27, { class: 'size-4' });
							$.next();
							$.append($$anchor, fragment_15);
						};

						$.if(node_25, ($$render) => {
							if ($.get(deleting)) $$render(consequent_2); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_28 = $.sibling(node_24, 2);

			{
				var consequent_3 = ($$anchor) => {
					Button($$anchor, {
						variant: 'ghost',
						size: 'sm',
						onclick: clearFilters,
						children: ($$anchor, $$slotProps) => {
							var fragment_17 = root_6();
							var node_29 = $.first_child(fragment_17);

							XIcon(node_29, { class: 'size-4' });
							$.next();
							$.append($$anchor, fragment_17);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_28, ($$render) => {
					if ($.get(hasActiveFilters)) $$render(consequent_3);
				});
			}

			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if ($.get(showFilters)) $$render(consequent_4);
		});
	}

	$.reset(div_1);

	var div_8 = $.sibling(div_1, 2);
	var node_30 = $.child(div_8);

	$.component(node_30, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_18 = root_1();
				var node_31 = $.first_child(fragment_18);

				$.component(node_31, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_19 = $.comment();
							var node_32 = $.first_child(fragment_19);

							$.component(node_32, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_20 = root_8();
										var node_33 = $.first_child(fragment_20);

										$.component(node_33, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Monitor Tag');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										var node_34 = $.sibling(node_33, 2);

										$.component(node_34, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												class: 'w-48',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('Timestamp');

													$.append($$anchor, text_12);
												},
												$$slots: { default: true }
											});
										});

										var node_35 = $.sibling(node_34, 2);

										$.component(node_35, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('Status');

													$.append($$anchor, text_13);
												},
												$$slots: { default: true }
											});
										});

										var node_36 = $.sibling(node_35, 2);

										$.component(node_36, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Latency');

													$.append($$anchor, text_14);
												},
												$$slots: { default: true }
											});
										});

										var node_37 = $.sibling(node_36, 2);

										$.component(node_37, () => Table.Head, ($$anchor, Table_Head_4) => {
											Table_Head_4($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('Type');

													$.append($$anchor, text_15);
												},
												$$slots: { default: true }
											});
										});

										var node_38 = $.sibling(node_37, 2);

										$.component(node_38, () => Table.Head, ($$anchor, Table_Head_5) => {
											Table_Head_5($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_16 = $.text('Error Message');

													$.append($$anchor, text_16);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_20);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_19);
						},
						$$slots: { default: true }
					});
				});

				var node_39 = $.sibling(node_31, 2);

				$.component(node_39, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_21 = $.comment();
							var node_40 = $.first_child(fragment_21);

							{
								var consequent_5 = ($$anchor) => {
									var fragment_22 = $.comment();
									var node_41 = $.first_child(fragment_22);

									$.component(node_41, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_23 = $.comment();
												var node_42 = $.first_child(fragment_23);

												$.component(node_42, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														colspan: 6,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_17 = $.text('No monitoring data found');

															$.append($$anchor, text_17);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_23);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_22);
								};

								var alternate_4 = ($$anchor) => {
									var fragment_24 = $.comment();
									var node_43 = $.first_child(fragment_24);

									$.each(node_43, 17, () => $.get(monitoringData), (row) => row.monitor_tag + "_" + row.timestamp, ($$anchor, row) => {
										var fragment_25 = $.comment();
										var node_44 = $.first_child(fragment_25);

										$.component(node_44, () => Table.Row, ($$anchor, Table_Row_2) => {
											Table_Row_2($$anchor, {
												class: 'hover:bg-muted/50',
												children: ($$anchor, $$slotProps) => {
													var fragment_26 = root_8();
													var node_45 = $.first_child(fragment_26);

													$.component(node_45, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_27 = $.comment();
																var node_46 = $.first_child(fragment_27);

																$.component(node_46, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																	Tooltip_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_28 = root_1();
																			var node_47 = $.first_child(fragment_28);

																			$.component(node_47, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																				Tooltip_Trigger($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var span = root_9();
																						var text_18 = $.only_child(span, true);

																						$.template_effect(() => $.set_text(text_18, $.get(row).monitor_tag));
																						$.append($$anchor, span);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_48 = $.sibling(node_47, 2);

																			$.component(node_48, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																				Tooltip_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var p = root_10();
																						var text_19 = $.only_child(p, true);

																						$.template_effect(() => $.set_text(text_19, $.get(row).monitor_tag));
																						$.append($$anchor, p);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_28);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_27);
															},
															$$slots: { default: true }
														});
													});

													var node_49 = $.sibling(node_45, 2);

													$.component(node_49, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var span_1 = root_11();
																var text_20 = $.only_child(span_1, true);

																$.template_effect(($0) => $.set_text(text_20, $0), [() => formatTimestamp($.get(row).timestamp)]);
																$.append($$anchor, span_1);
															},
															$$slots: { default: true }
														});
													});

													var node_50 = $.sibling(node_49, 2);

													$.component(node_50, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var span_2 = root_12();
																var text_21 = $.only_child(span_2, true);

																$.template_effect(
																	($0) => {
																		$.set_class(span_2, 1, `text-xs font-semibold text-${$0 ?? ''}`);
																		$.set_text(text_21, $.get(row).status || "N/A");
																	},
																	[() => $.get(row).status?.toLowerCase()]
																);

																$.append($$anchor, span_2);
															},
															$$slots: { default: true }
														});
													});

													var node_51 = $.sibling(node_50, 2);

													$.component(node_51, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_29 = $.comment();
																var node_52 = $.first_child(fragment_29);

																{
																	var consequent_6 = ($$anchor) => {
																		var span_3 = root_13();
																		var text_22 = $.only_child(span_3);

																		$.template_effect(() => $.set_text(text_22, `${$.get(row).latency ?? ''} ms`));
																		$.append($$anchor, span_3);
																	};

																	var alternate_1 = ($$anchor) => {
																		var span_4 = root_14();

																		$.append($$anchor, span_4);
																	};

																	$.if(node_52, ($$render) => {
																		if ($.get(row).latency !== null) $$render(consequent_6); else $$render(alternate_1, -1);
																	});
																}

																$.append($$anchor, fragment_29);
															},
															$$slots: { default: true }
														});
													});

													var node_53 = $.sibling(node_51, 2);

													$.component(node_53, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_30 = $.comment();
																var node_54 = $.first_child(fragment_30);

																{
																	var consequent_7 = ($$anchor) => {
																		Badge($$anchor, {
																			variant: 'secondary',
																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_23 = $.text();

																				$.template_effect(() => $.set_text(text_23, $.get(row).type));
																				$.append($$anchor, text_23);
																			},
																			$$slots: { default: true }
																		});
																	};

																	var alternate_2 = ($$anchor) => {
																		var span_5 = root_14();

																		$.append($$anchor, span_5);
																	};

																	$.if(node_54, ($$render) => {
																		if ($.get(row).type) $$render(consequent_7); else $$render(alternate_2, -1);
																	});
																}

																$.append($$anchor, fragment_30);
															},
															$$slots: { default: true }
														});
													});

													var node_55 = $.sibling(node_53, 2);

													$.component(node_55, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_33 = $.comment();
																var node_56 = $.first_child(fragment_33);

																{
																	var consequent_8 = ($$anchor) => {
																		var fragment_34 = $.comment();
																		var node_57 = $.first_child(fragment_34);

																		$.component(node_57, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																			Tooltip_Root_1($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_35 = root_1();
																					var node_58 = $.first_child(fragment_35);

																					$.component(node_58, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																						Tooltip_Trigger_1($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var span_6 = root_15();
																								var text_24 = $.only_child(span_6, true);

																								$.template_effect(() => $.set_text(text_24, $.get(row).error_message));
																								$.append($$anchor, span_6);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_59 = $.sibling(node_58, 2);

																					$.component(node_59, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																						Tooltip_Content_1($$anchor, {
																							class: 'max-w-md',
																							children: ($$anchor, $$slotProps) => {
																								var p_1 = root_16();
																								var text_25 = $.only_child(p_1, true);

																								$.template_effect(() => $.set_text(text_25, $.get(row).error_message));
																								$.append($$anchor, p_1);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_35);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_34);
																	};

																	var alternate_3 = ($$anchor) => {
																		var span_7 = root_14();

																		$.append($$anchor, span_7);
																	};

																	$.if(node_56, ($$render) => {
																		if ($.get(row).error_message) $$render(consequent_8); else $$render(alternate_3, -1);
																	});
																}

																$.append($$anchor, fragment_33);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_26);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_25);
									});

									$.append($$anchor, fragment_24);
								};

								$.if(node_40, ($$render) => {
									if ($.get(monitoringData).length === 0 && !$.get(loading)) $$render(consequent_5); else $$render(alternate_4, -1);
								});
							}

							$.append($$anchor, fragment_21);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_18);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_8);

	var node_60 = $.sibling(div_8, 2);

	{
		var consequent_12 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(pageNo) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(pageNo) * limit, $.get(totalCount)));
			var div_9 = root_19();
			var span_8 = $.child(div_9);
			var text_26 = $.only_child(span_8);
			var node_61 = $.sibling(span_8, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_10 = root_18();
					var node_62 = $.child(div_10);

					{
						let $0 = $.derived(() => $.get(pageNo) === 1);

						Button(node_62, {
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

					var div_11 = $.sibling(node_62, 2);

					$.each(div_11, 20, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), (page) => page, ($$anchor, page) => {
						var fragment_37 = $.comment();
						var node_63 = $.first_child(fragment_37);

						{
							var consequent_9 = ($$anchor) => {
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

											var text_27 = $.text();

											$.template_effect(() => $.set_text(text_27, page));
											$.append($$anchor, text_27);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_10 = ($$anchor) => {
								var span_9 = root_17();

								$.append($$anchor, span_9);
							};

							$.if(node_63, ($$render) => {
								if (page === 1 || page === $.get(totalPages) || page >= $.get(pageNo) - 1 && page <= $.get(pageNo) + 1) $$render(consequent_9); else if (page === $.get(pageNo) - 2 || page === $.get(pageNo) + 2) $$render(consequent_10, 1);
							});
						}

						$.append($$anchor, fragment_37);
					});

					$.reset(div_11);

					var node_64 = $.sibling(div_11, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_64, {
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

					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_61, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_11);
				});
			}

			$.reset(div_9);
			$.template_effect(() => $.set_text(text_26, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(totalCount) ?? ''}`));
			$.append($$anchor, div_9);
		};

		$.if(node_60, ($$render) => {
			if ($.get(totalCount) > 0) $$render(consequent_12);
		});
	}

	$.reset(div);

	var node_65 = $.sibling(div, 2);

	$.component(node_65, () => AlertDialog.Root, ($$anchor, AlertDialog_Root) => {
		AlertDialog_Root($$anchor, {
			get open() {
				return $.get(deleteDialogOpen);
			},

			set open($$value) {
				$.set(deleteDialogOpen, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_41 = $.comment();
				var node_66 = $.first_child(fragment_41);

				$.component(node_66, () => AlertDialog.Content, ($$anchor, AlertDialog_Content) => {
					AlertDialog_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_42 = root_1();
							var node_67 = $.first_child(fragment_42);

							$.component(node_67, () => AlertDialog.Header, ($$anchor, AlertDialog_Header) => {
								AlertDialog_Header($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_43 = root_1();
										var node_68 = $.first_child(fragment_43);

										$.component(node_68, () => AlertDialog.Title, ($$anchor, AlertDialog_Title) => {
											AlertDialog_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_28 = $.text('Delete Monitoring Data');

													$.append($$anchor, text_28);
												},
												$$slots: { default: true }
											});
										});

										var node_69 = $.sibling(node_68, 2);

										$.component(node_69, () => AlertDialog.Description, ($$anchor, AlertDialog_Description) => {
											AlertDialog_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_44 = root_23();
													var node_70 = $.sibling($.first_child(fragment_44));

													{
														var consequent_13 = ($$anchor) => {
															var strong = root_20();

															$.append($$anchor, strong);
														};

														var alternate_5 = ($$anchor) => {
															var strong_1 = root_21();
															var text_29 = $.only_child(strong_1, true);

															$.template_effect(() => $.set_text(text_29, $.get(monitorTagFilter)));
															$.append($$anchor, strong_1);
														};

														$.if(node_70, ($$render) => {
															if ($.get(monitorTagFilter) === "ALL") $$render(consequent_13); else $$render(alternate_5, -1);
														});
													}

													var node_71 = $.sibling(node_70, 2);

													{
														var consequent_14 = ($$anchor) => {
															var fragment_45 = root_22();
															var strong_2 = $.sibling($.first_child(fragment_45));
															var text_30 = $.only_child(strong_2, true);

															$.template_effect(() => $.set_text(text_30, $.get(statusFilter)));
															$.append($$anchor, fragment_45);
														};

														$.if(node_71, ($$render) => {
															if ($.get(statusFilter) !== "ALL") $$render(consequent_14);
														});
													}

													var text_31 = $.sibling(node_71);

													$.template_effect(() => $.set_text(text_31, ` from ${$.get(startDateTime) ?? ''} to ${$.get(endDateTime) ?? ''}.
        This action cannot be undone.`));

													$.append($$anchor, fragment_44);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_43);
									},
									$$slots: { default: true }
								});
							});

							var node_72 = $.sibling(node_67, 2);

							$.component(node_72, () => AlertDialog.Footer, ($$anchor, AlertDialog_Footer) => {
								AlertDialog_Footer($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_46 = root_1();
										var node_73 = $.first_child(fragment_46);

										$.component(node_73, () => AlertDialog.Cancel, ($$anchor, AlertDialog_Cancel) => {
											AlertDialog_Cancel($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_32 = $.text('Cancel');

													$.append($$anchor, text_32);
												},
												$$slots: { default: true }
											});
										});

										var node_74 = $.sibling(node_73, 2);

										$.component(node_74, () => AlertDialog.Action, ($$anchor, AlertDialog_Action) => {
											AlertDialog_Action($$anchor, {
												onclick: deleteFilteredData,
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_33 = $.text('Delete');

													$.append($$anchor, text_33);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_46);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_42);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_41);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}