import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> New Maintenance`, 1);
var root_3 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_4 = $.from_html(`<span class="line-clamp-1 max-w-xs"> </span>`);
var root_5 = $.from_html(`<p class="text-muted-foreground mt-1 text-sm"> </p>`);
var root_6 = $.from_html(`<p class="max-w-md"> </p> <!>`, 1);
var root_7 = $.from_html(`<!> One-Time`, 1);
var root_8 = $.from_html(`<!> Recurring`, 1);
var root_9 = $.from_html(`<div class="flex items-center gap-1"><!> <span class="text-muted-foreground text-sm"> </span></div>`);
var root_10 = $.from_html(`<div class="text-sm"><div><span class="text-muted-foreground">Start:</span> </div> <div><span class="text-muted-foreground">Duration:</span> </div> <div><span class="text-muted-foreground">RRULE:</span> </div></div>`);
var root_11 = $.from_html(`<div class="flex items-center gap-1"><!> <span class="text-sm"> </span></div>`);
var root_12 = $.from_html(`<div> </div>`);
var root_13 = $.from_html(`<div class="text-sm"></div>`);
var root_14 = $.from_html(`<span class="text-muted-foreground text-sm">None</span>`);
var root_15 = $.from_html(`<div class="text-sm"><div><span class="text-muted-foreground">Start:</span> </div> <div><span class="text-muted-foreground">End:</span> </div></div>`);
var root_16 = $.from_html(`<span class="text-muted-foreground text-sm">No events</span>`);
var root_17 = $.from_html(`<!> Edit`, 1);
var root_18 = $.from_html(`<span class="text-muted-foreground px-1">...</span>`);
var root_19 = $.from_html(`<div class="flex items-center gap-2"><!> <div class="flex items-center gap-1"></div> <!></div>`);
var root_20 = $.from_html(`<div class="flex items-center justify-between"><span class="text-muted-foreground text-sm"> </span> <!></div>`);
var root_21 = $.from_html(`<div class="container mx-auto space-y-6 py-6"><div class="flex items-center justify-between"><div class="flex items-center justify-between"><div class="flex items-center gap-3"><!></div> <!></div> <div class="flex items-center gap-3"><!></div></div>  <div class="ktable rounded-xl border"><!></div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// Types
	// State
	let loading = $.state(true);

	let maintenances = $.state($.proxy([]));
	let totalPages = $.state(0);
	let totalCount = $.state(0);
	let pageNo = $.state(1);
	let status = $.state("ACTIVE");
	const limit = 10;

	// Fetch maintenances
	async function fetchData() {
		$.set(loading, true);

		try {
			const response = await fetch(clientResolver(resolve, "/manage/api"), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "getMaintenances",
					data: {
						page: $.get(pageNo),
						limit,
						filter: { status: $.get(status) === "ALL" ? undefined : $.get(status) }
					}
				})
			});

			const result = await response.json();

			if (!result.error) {
				$.set(maintenances, result.maintenances, true);
				$.set(totalCount, result.total, true);
				$.set(totalPages, Math.ceil(result.total / limit), true);
			}
		} catch(error) {
			console.error("Error fetching maintenances:", error);
		} finally {
			$.set(loading, false);
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
			$.set(status, value, true);
			$.set(pageNo, 1);
			fetchData();
		}
	}

	// Pagination
	function goToPage(page) {
		$.set(pageNo, page, true);
		fetchData();
	}

	$.user_effect(() => {
		fetchData();
	});

	var div = root_21();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var node = $.child(div_3);

	$.component(node, () => Select.Root, ($$anchor, Select_Root) => {
		Select_Root($$anchor, {
			type: 'single',
			get value() {
				return $.get(status);
			},
			onValueChange: handleStatusChange,
			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_1 = $.first_child(fragment);

				$.component(node_1, () => Select.Trigger, ($$anchor, Select_Trigger) => {
					Select_Trigger($$anchor, {
						class: 'w-40',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, $.get(status) === "ALL"
								? "All"
								: $.get(status) === "ACTIVE" ? "Active" : "Inactive"));

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				});

				var node_2 = $.sibling(node_1, 2);

				$.component(node_2, () => Select.Content, ($$anchor, Select_Content) => {
					Select_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root();
							var node_3 = $.first_child(fragment_2);

							$.component(node_3, () => Select.Item, ($$anchor, Select_Item) => {
								Select_Item($$anchor, {
									value: 'ALL',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('All');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Select.Item, ($$anchor, Select_Item_1) => {
								Select_Item_1($$anchor, {
									value: 'ACTIVE',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Active');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							});

							var node_5 = $.sibling(node_4, 2);

							$.component(node_5, () => Select.Item, ($$anchor, Select_Item_2) => {
								Select_Item_2($$anchor, {
									value: 'INACTIVE',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Inactive');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_3);

	var node_6 = $.sibling(div_3, 2);

	{
		var consequent = ($$anchor) => {
			Spinner($$anchor, { class: 'size-5' });
		};

		$.if(node_6, ($$render) => {
			if ($.get(loading)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var node_7 = $.child(div_4);

	Button(node_7, {
		onclick: createNewMaintenance,
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_8 = $.first_child(fragment_4);

			PlusIcon(node_8, { class: 'size-4' });
			$.next();
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.reset(div_1);

	var div_5 = $.sibling(div_1, 2);
	var node_9 = $.child(div_5);

	$.component(node_9, () => Table.Root, ($$anchor, Table_Root) => {
		Table_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_5 = root_1();
				var node_10 = $.first_child(fragment_5);

				$.component(node_10, () => Table.Header, ($$anchor, Table_Header) => {
					Table_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_6 = $.comment();
							var node_11 = $.first_child(fragment_6);

							$.component(node_11, () => Table.Row, ($$anchor, Table_Row) => {
								Table_Row($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_7 = root_3();
										var node_12 = $.first_child(fragment_7);

										$.component(node_12, () => Table.Head, ($$anchor, Table_Head) => {
											Table_Head($$anchor, {
												class: 'w-16',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('ID');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});
										});

										var node_13 = $.sibling(node_12, 2);

										$.component(node_13, () => Table.Head, ($$anchor, Table_Head_1) => {
											Table_Head_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Title');

													$.append($$anchor, text_5);
												},
												$$slots: { default: true }
											});
										});

										var node_14 = $.sibling(node_13, 2);

										$.component(node_14, () => Table.Head, ($$anchor, Table_Head_2) => {
											Table_Head_2($$anchor, {
												class: 'w-32',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Type');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});
										});

										var node_15 = $.sibling(node_14, 2);

										$.component(node_15, () => Table.Head, ($$anchor, Table_Head_3) => {
											Table_Head_3($$anchor, {
												class: 'w-40',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Duration');

													$.append($$anchor, text_7);
												},
												$$slots: { default: true }
											});
										});

										var node_16 = $.sibling(node_15, 2);

										$.component(node_16, () => Table.Head, ($$anchor, Table_Head_4) => {
											Table_Head_4($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Monitors');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});
										});

										var node_17 = $.sibling(node_16, 2);

										$.component(node_17, () => Table.Head, ($$anchor, Table_Head_5) => {
											Table_Head_5($$anchor, {
												class: 'w-40',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_9 = $.text('Next Event');

													$.append($$anchor, text_9);
												},
												$$slots: { default: true }
											});
										});

										var node_18 = $.sibling(node_17, 2);

										$.component(node_18, () => Table.Head, ($$anchor, Table_Head_6) => {
											Table_Head_6($$anchor, {
												class: 'w-24',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_10 = $.text('Status');

													$.append($$anchor, text_10);
												},
												$$slots: { default: true }
											});
										});

										var node_19 = $.sibling(node_18, 2);

										$.component(node_19, () => Table.Head, ($$anchor, Table_Head_7) => {
											Table_Head_7($$anchor, {
												class: 'w-24 text-right',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Actions');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_7);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_6);
						},
						$$slots: { default: true }
					});
				});

				var node_20 = $.sibling(node_10, 2);

				$.component(node_20, () => Table.Body, ($$anchor, Table_Body) => {
					Table_Body($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_8 = $.comment();
							var node_21 = $.first_child(fragment_8);

							{
								var consequent_1 = ($$anchor) => {
									var fragment_9 = $.comment();
									var node_22 = $.first_child(fragment_9);

									$.component(node_22, () => Table.Row, ($$anchor, Table_Row_1) => {
										Table_Row_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												var fragment_10 = $.comment();
												var node_23 = $.first_child(fragment_10);

												$.component(node_23, () => Table.Cell, ($$anchor, Table_Cell) => {
													Table_Cell($$anchor, {
														colspan: 8,
														class: 'text-muted-foreground py-8 text-center',
														children: ($$anchor, $$slotProps) => {
															$.next();

															var text_12 = $.text('No maintenances found');

															$.append($$anchor, text_12);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								};

								var alternate_3 = ($$anchor) => {
									var fragment_11 = $.comment();
									var node_24 = $.first_child(fragment_11);

									$.each(node_24, 17, () => $.get(maintenances), $.index, ($$anchor, maintenance) => {
										var fragment_12 = $.comment();
										var node_25 = $.first_child(fragment_12);

										$.component(node_25, () => Table.Row, ($$anchor, Table_Row_2) => {
											Table_Row_2($$anchor, {
												class: 'hover:bg-muted/50 cursor-pointer',
												onclick: () => openMaintenance($.get(maintenance).id),
												children: ($$anchor, $$slotProps) => {
													var fragment_13 = root_3();
													var node_26 = $.first_child(fragment_13);

													$.component(node_26, () => Table.Cell, ($$anchor, Table_Cell_1) => {
														Table_Cell_1($$anchor, {
															class: 'font-medium',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_13 = $.text();

																$.template_effect(() => $.set_text(text_13, $.get(maintenance).id));
																$.append($$anchor, text_13);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_26, 2);

													$.component(node_27, () => Table.Cell, ($$anchor, Table_Cell_2) => {
														Table_Cell_2($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_15 = $.comment();
																var node_28 = $.first_child(fragment_15);

																$.component(node_28, () => Tooltip.Root, ($$anchor, Tooltip_Root) => {
																	Tooltip_Root($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_16 = root_1();
																			var node_29 = $.first_child(fragment_16);

																			$.component(node_29, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger) => {
																				Tooltip_Trigger($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var span = root_4();
																						var text_14 = $.only_child(span, true);

																						$.template_effect(() => $.set_text(text_14, $.get(maintenance).title));
																						$.append($$anchor, span);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_30 = $.sibling(node_29, 2);

																			$.component(node_30, () => Tooltip.Content, ($$anchor, Tooltip_Content) => {
																				Tooltip_Content($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var fragment_17 = root_6();
																						var p = $.first_child(fragment_17);
																						var text_15 = $.only_child(p, true);
																						var node_31 = $.sibling(p, 2);

																						{
																							var consequent_2 = ($$anchor) => {
																								var p_1 = root_5();
																								var text_16 = $.only_child(p_1, true);

																								$.template_effect(() => $.set_text(text_16, $.get(maintenance).description));
																								$.append($$anchor, p_1);
																							};

																							$.if(node_31, ($$render) => {
																								if ($.get(maintenance).description) $$render(consequent_2);
																							});
																						}

																						$.template_effect(() => $.set_text(text_15, $.get(maintenance).title));
																						$.append($$anchor, fragment_17);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_16);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_15);
															},
															$$slots: { default: true }
														});
													});

													var node_32 = $.sibling(node_27, 2);

													$.component(node_32, () => Table.Cell, ($$anchor, Table_Cell_3) => {
														Table_Cell_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																Badge($$anchor, {
																	variant: 'outline',
																	class: 'gap-1',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_19 = $.comment();
																		var node_33 = $.first_child(fragment_19);

																		{
																			var consequent_3 = ($$anchor) => {
																				var fragment_20 = root_7();
																				var node_34 = $.first_child(fragment_20);

																				CalendarIcon(node_34, { class: 'size-3' });
																				$.next();
																				$.append($$anchor, fragment_20);
																			};

																			var d = $.derived(() => isOneTime($.get(maintenance).rrule));

																			var alternate = ($$anchor) => {
																				var fragment_21 = root_8();
																				var node_35 = $.first_child(fragment_21);

																				RepeatIcon(node_35, { class: 'size-3' });
																				$.next();
																				$.append($$anchor, fragment_21);
																			};

																			$.if(node_33, ($$render) => {
																				if ($.get(d)) $$render(consequent_3); else $$render(alternate, -1);
																			});
																		}

																		$.append($$anchor, fragment_19);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													var node_36 = $.sibling(node_32, 2);

													$.component(node_36, () => Table.Cell, ($$anchor, Table_Cell_4) => {
														Table_Cell_4($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_22 = $.comment();
																var node_37 = $.first_child(fragment_22);

																$.component(node_37, () => Tooltip.Root, ($$anchor, Tooltip_Root_1) => {
																	Tooltip_Root_1($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_23 = root_1();
																			var node_38 = $.first_child(fragment_23);

																			$.component(node_38, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_1) => {
																				Tooltip_Trigger_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var div_6 = root_9();
																						var node_39 = $.child(div_6);

																						ClockIcon(node_39, { class: 'text-muted-foreground size-3' });

																						var span_1 = $.sibling(node_39, 2);
																						var text_17 = $.only_child(span_1, true);

																						$.reset(div_6);
																						$.template_effect(($0) => $.set_text(text_17, $0), [() => formatDuration($.get(maintenance).duration_seconds)]);
																						$.append($$anchor, div_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_40 = $.sibling(node_38, 2);

																			$.component(node_40, () => Tooltip.Content, ($$anchor, Tooltip_Content_1) => {
																				Tooltip_Content_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						var div_7 = root_10();
																						var div_8 = $.child(div_7);
																						var text_18 = $.sibling($.child(div_8));

																						$.reset(div_8);

																						var div_9 = $.sibling(div_8, 2);
																						var text_19 = $.sibling($.child(div_9));

																						$.reset(div_9);

																						var div_10 = $.sibling(div_9, 2);
																						var text_20 = $.sibling($.child(div_10));

																						$.reset(div_10);
																						$.reset(div_7);

																						$.template_effect(
																							($0, $1) => {
																								$.set_text(text_18, ` ${$0 ?? ''}`);
																								$.set_text(text_19, ` ${$1 ?? ''}`);
																								$.set_text(text_20, ` ${$.get(maintenance).rrule ?? ''}`);
																							},
																							[
																								() => format(new Date($.get(maintenance).start_date_time * 1000), "yyyy-MM-dd HH:mm"),
																								() => formatDuration($.get(maintenance).duration_seconds)
																							]
																						);

																						$.append($$anchor, div_7);
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
															},
															$$slots: { default: true }
														});
													});

													var node_41 = $.sibling(node_36, 2);

													$.component(node_41, () => Table.Cell, ($$anchor, Table_Cell_5) => {
														Table_Cell_5($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_24 = $.comment();
																var node_42 = $.first_child(fragment_24);

																{
																	var consequent_4 = ($$anchor) => {
																		var fragment_25 = $.comment();
																		var node_43 = $.first_child(fragment_25);

																		$.component(node_43, () => Tooltip.Root, ($$anchor, Tooltip_Root_2) => {
																			Tooltip_Root_2($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_26 = root_1();
																					var node_44 = $.first_child(fragment_26);

																					$.component(node_44, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_2) => {
																						Tooltip_Trigger_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var div_11 = root_11();
																								var node_45 = $.child(div_11);

																								BlendIcon(node_45, { class: 'text-muted-foreground size-3' });

																								var span_2 = $.sibling(node_45, 2);
																								var text_21 = $.only_child(span_2, true);

																								$.reset(div_11);
																								$.template_effect(() => $.set_text(text_21, $.get(maintenance).monitors.length));
																								$.append($$anchor, div_11);
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_46 = $.sibling(node_44, 2);

																					$.component(node_46, () => Tooltip.Content, ($$anchor, Tooltip_Content_2) => {
																						Tooltip_Content_2($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var div_12 = root_13();

																								$.each(div_12, 21, () => $.get(maintenance).monitors, $.index, ($$anchor, monitor) => {
																									var div_13 = root_12();
																									var text_22 = $.only_child(div_13, true);

																									$.template_effect(() => $.set_text(text_22, $.get(monitor).monitor_tag));
																									$.append($$anchor, div_13);
																								});

																								$.reset(div_12);
																								$.append($$anchor, div_12);
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
																	};

																	var alternate_1 = ($$anchor) => {
																		var span_3 = root_14();

																		$.append($$anchor, span_3);
																	};

																	$.if(node_42, ($$render) => {
																		if ($.get(maintenance).monitors && $.get(maintenance).monitors.length > 0) $$render(consequent_4); else $$render(alternate_1, -1);
																	});
																}

																$.append($$anchor, fragment_24);
															},
															$$slots: { default: true }
														});
													});

													var node_47 = $.sibling(node_41, 2);

													$.component(node_47, () => Table.Cell, ($$anchor, Table_Cell_6) => {
														Table_Cell_6($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_27 = $.comment();
																var node_48 = $.first_child(fragment_27);

																{
																	var consequent_5 = ($$anchor) => {
																		const displayStatus = $.derived(() => getEventDisplayStatus($.get(maintenance).upcoming_event));
																		var fragment_28 = $.comment();
																		var node_49 = $.first_child(fragment_28);

																		$.component(node_49, () => Tooltip.Root, ($$anchor, Tooltip_Root_3) => {
																			Tooltip_Root_3($$anchor, {
																				children: ($$anchor, $$slotProps) => {
																					var fragment_29 = root_1();
																					var node_50 = $.first_child(fragment_29);

																					$.component(node_50, () => Tooltip.Trigger, ($$anchor, Tooltip_Trigger_3) => {
																						Tooltip_Trigger_3($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								Badge($$anchor, {
																									get variant() {
																										return $.get(displayStatus).variant;
																									},

																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_23 = $.text();

																										$.template_effect(() => $.set_text(text_23, $.get(displayStatus).label));
																										$.append($$anchor, text_23);
																									},
																									$$slots: { default: true }
																								});
																							},
																							$$slots: { default: true }
																						});
																					});

																					var node_51 = $.sibling(node_50, 2);

																					$.component(node_51, () => Tooltip.Content, ($$anchor, Tooltip_Content_3) => {
																						Tooltip_Content_3($$anchor, {
																							children: ($$anchor, $$slotProps) => {
																								var div_14 = root_15();
																								var div_15 = $.child(div_14);
																								var text_24 = $.sibling($.child(div_15));

																								$.reset(div_15);

																								var div_16 = $.sibling(div_15, 2);
																								var text_25 = $.sibling($.child(div_16));

																								$.reset(div_16);
																								$.reset(div_14);

																								$.template_effect(
																									($0, $1) => {
																										$.set_text(text_24, ` ${$0 ?? ''}`);
																										$.set_text(text_25, ` ${$1 ?? ''}`);
																									},
																									[
																										() => format(new Date($.get(maintenance).upcoming_event.start_date_time * 1000), "MMM d, yyyy HH:mm"),
																										() => format(new Date($.get(maintenance).upcoming_event.end_date_time * 1000), "MMM d, yyyy HH:mm")
																									]
																								);

																								$.append($$anchor, div_14);
																							},
																							$$slots: { default: true }
																						});
																					});

																					$.append($$anchor, fragment_29);
																				},
																				$$slots: { default: true }
																			});
																		});

																		$.append($$anchor, fragment_28);
																	};

																	var alternate_2 = ($$anchor) => {
																		var span_4 = root_16();

																		$.append($$anchor, span_4);
																	};

																	$.if(node_48, ($$render) => {
																		if ($.get(maintenance).upcoming_event) $$render(consequent_5); else $$render(alternate_2, -1);
																	});
																}

																$.append($$anchor, fragment_27);
															},
															$$slots: { default: true }
														});
													});

													var node_52 = $.sibling(node_47, 2);

													$.component(node_52, () => Table.Cell, ($$anchor, Table_Cell_7) => {
														Table_Cell_7($$anchor, {
															children: ($$anchor, $$slotProps) => {
																{
																	let $0 = $.derived(() => getStatusBadgeVariant($.get(maintenance).status));

																	Badge($$anchor, {
																		get variant() {
																			return $.get($0);
																		},

																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_26 = $.text();

																			$.template_effect(() => $.set_text(text_26, $.get(maintenance).status));
																			$.append($$anchor, text_26);
																		},
																		$$slots: { default: true }
																	});
																}
															},
															$$slots: { default: true }
														});
													});

													var node_53 = $.sibling(node_52, 2);

													$.component(node_53, () => Table.Cell, ($$anchor, Table_Cell_8) => {
														Table_Cell_8($$anchor, {
															class: 'text-right',
															children: ($$anchor, $$slotProps) => {
																Button($$anchor, {
																	variant: 'outline',
																	size: 'sm',
																	onclick: (e) => {
																		e.stopPropagation();
																		openMaintenance($.get(maintenance).id);
																	},

																	children: ($$anchor, $$slotProps) => {
																		var fragment_35 = root_17();
																		var node_54 = $.first_child(fragment_35);

																		PencilIcon(node_54, { class: 'size-4' });
																		$.next();
																		$.append($$anchor, fragment_35);
																	},
																	$$slots: { default: true }
																});
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_13);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_12);
									});

									$.append($$anchor, fragment_11);
								};

								$.if(node_21, ($$render) => {
									if ($.get(maintenances).length === 0 && !$.get(loading)) $$render(consequent_1); else $$render(alternate_3, -1);
								});
							}

							$.append($$anchor, fragment_8);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_5);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_5);

	var node_55 = $.sibling(div_5, 2);

	{
		var consequent_9 = ($$anchor) => {
			const startItem = $.derived(() => ($.get(pageNo) - 1) * limit + 1);
			const endItem = $.derived(() => Math.min($.get(pageNo) * limit, $.get(totalCount)));
			var div_17 = root_20();
			var span_5 = $.child(div_17);
			var text_27 = $.only_child(span_5);
			var node_56 = $.sibling(span_5, 2);

			{
				var consequent_8 = ($$anchor) => {
					var div_18 = root_19();
					var node_57 = $.child(div_18);

					{
						let $0 = $.derived(() => $.get(pageNo) === 1);

						Button(node_57, {
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

					var div_19 = $.sibling(node_57, 2);

					$.each(div_19, 21, () => Array.from({ length: $.get(totalPages) }, (_, i) => i + 1), $.index, ($$anchor, page) => {
						var fragment_37 = $.comment();
						var node_58 = $.first_child(fragment_37);

						{
							var consequent_6 = ($$anchor) => {
								{
									let $0 = $.derived(() => $.get(page) === $.get(pageNo) ? "default" : "ghost");

									Button($$anchor, {
										get variant() {
											return $.get($0);
										},
										size: 'sm',
										onclick: () => goToPage($.get(page)),
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_28 = $.text();

											$.template_effect(() => $.set_text(text_28, $.get(page)));
											$.append($$anchor, text_28);
										},
										$$slots: { default: true }
									});
								}
							};

							var consequent_7 = ($$anchor) => {
								var span_6 = root_18();

								$.append($$anchor, span_6);
							};

							$.if(node_58, ($$render) => {
								if ($.get(page) === 1 || $.get(page) === $.get(totalPages) || $.get(page) >= $.get(pageNo) - 1 && $.get(page) <= $.get(pageNo) + 1) $$render(consequent_6); else if ($.get(page) === $.get(pageNo) - 2 || $.get(page) === $.get(pageNo) + 2) $$render(consequent_7, 1);
							});
						}

						$.append($$anchor, fragment_37);
					});

					$.reset(div_19);

					var node_59 = $.sibling(div_19, 2);

					{
						let $0 = $.derived(() => $.get(pageNo) === $.get(totalPages));

						Button(node_59, {
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

					$.reset(div_18);
					$.append($$anchor, div_18);
				};

				$.if(node_56, ($$render) => {
					if ($.get(totalPages) > 1) $$render(consequent_8);
				});
			}

			$.reset(div_17);
			$.template_effect(() => $.set_text(text_27, `Showing ${$.get(startItem) ?? ''}-${$.get(endItem) ?? ''} of ${$.get(totalCount) ?? ''}`));
			$.append($$anchor, div_17);
		};

		$.if(node_55, ($$render) => {
			if ($.get(totalCount) > 0) $$render(consequent_9);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}